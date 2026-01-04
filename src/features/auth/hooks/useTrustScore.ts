import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceFingerprint } from '@/features/auth/hooks/useDeviceFingerprint';
import { TRUST_THRESHOLDS } from '@/features/auth/config/personas';
import { useAuthLogging } from '@/features/auth/hooks/useAuthLogging';

/**
 * Hook pour calculer le score de confiance (Layer 2)
 * 
 * Facteurs pris en compte :
 * - Appareil connu (device fingerprint)
 * - Heure habituelle de connexion
 * - Localisation géographique
 * - Historique de connexions réussies
 */

interface TrustFactors {
  deviceKnown: boolean;
  deviceScore: number;
  timeMatch: boolean;
  timeScore: number;
  geoMatch: boolean;
  geoScore: number;
  historyScore: number;
}

interface TrustResult {
  score: number;
  factors: TrustFactors;
  decision: 'direct_access' | 'challenge' | 'human_fallback';
  merchantId?: string;
  merchantName?: string;
}

export function useTrustScore() {
  const { fingerprint, deviceName } = useDeviceFingerprint();
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastResult, setLastResult] = useState<TrustResult | null>(null);
  const { logAuthDecision, detectRiskEvents, updateAuthOutcome } = useAuthLogging();
  const currentLogIdRef = useRef<string | null>(null);

  const calculateTrustScore = useCallback(async (phone: string): Promise<TrustResult> => {
    setIsCalculating(true);
    
    try {
      // 1. Trouver le marchand par téléphone
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id, full_name, user_id')
        .eq('phone', phone)
        .single();
      
      if (merchantError || !merchant) {
        // Nouveau utilisateur - score bas mais pas d'erreur
        const result: TrustResult = {
          score: 0,
          factors: {
            deviceKnown: false,
            deviceScore: 0,
            timeMatch: false,
            timeScore: 0,
            geoMatch: false,
            geoScore: 0,
            historyScore: 0,
          },
          decision: 'human_fallback',
        };
        setLastResult(result);
        return result;
      }
      
      // 2. Obtenir l'heure et la position actuelles
      const currentHour = new Date().getHours();
      let currentLat: number | undefined;
      let currentLon: number | undefined;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 60000,
          });
        });
        currentLat = position.coords.latitude;
        currentLon = position.coords.longitude;
      } catch {
        // Géolocalisation non disponible - pas bloquant
        console.log('Geolocation not available');
      }
      
      // 3. Appeler la fonction RPC pour calculer le score
      const { data: scoreData, error: scoreError } = await supabase.rpc(
        'calculate_trust_score',
        {
          p_merchant_id: merchant.id,
          p_device_fingerprint: fingerprint || 'unknown',
          p_login_hour: currentHour,
          p_latitude: currentLat,
          p_longitude: currentLon,
        }
      );
      
      let trustScore = 0;
      let factors: TrustFactors = {
        deviceKnown: false,
        deviceScore: 0,
        timeMatch: false,
        timeScore: 0,
        geoMatch: false,
        geoScore: 0,
        historyScore: 0,
      };
      
      if (!scoreError && scoreData && scoreData.length > 0) {
        trustScore = scoreData[0].trust_score || 0;
        const rawFactors = scoreData[0].factors as any;
        
        if (rawFactors) {
          factors = {
            deviceKnown: rawFactors.device_known || false,
            deviceScore: rawFactors.device_score || 0,
            timeMatch: rawFactors.time_match || false,
            timeScore: rawFactors.time_score || 0,
            geoMatch: rawFactors.geo_match || false,
            geoScore: rawFactors.geo_score || 0,
            historyScore: rawFactors.history_score || 0,
          };
        }
      }
      
      // 4. Déterminer la décision
      let decision: 'direct_access' | 'challenge' | 'human_fallback';
      if (trustScore >= TRUST_THRESHOLDS.DIRECT_ACCESS) {
        decision = 'direct_access';
      } else if (trustScore >= TRUST_THRESHOLDS.CHALLENGE) {
        decision = 'challenge';
      } else {
        decision = 'human_fallback';
      }
      
      const result: TrustResult = {
        score: trustScore,
        factors,
        decision,
        merchantId: merchant.id,
        merchantName: merchant.full_name,
      };
      
      setLastResult(result);

      // Journaliser la décision d'authentification
      const logId = await logAuthDecision({
        merchantId: merchant.id,
        phone,
        decision,
        trustScore,
        factors: { ...factors },
        deviceFingerprint: fingerprint || undefined,
      });
      currentLogIdRef.current = logId;

      // Détecter les événements de risque
      await detectRiskEvents(merchant.id, factors, trustScore);

      return result;
      
    } catch (error) {
      console.error('Error calculating trust score:', error);
      
      // En cas d'erreur, fallback humain
      const result: TrustResult = {
        score: 0,
        factors: {
          deviceKnown: false,
          deviceScore: 0,
          timeMatch: false,
          timeScore: 0,
          geoMatch: false,
          geoScore: 0,
          historyScore: 0,
        },
        decision: 'human_fallback',
      };
      setLastResult(result);
      return result;
      
    } finally {
      setIsCalculating(false);
    }
  }, [fingerprint]);

  // Enregistrer une connexion réussie pour améliorer le score futur
  const recordSuccessfulLogin = useCallback(async (merchantId: string) => {
    if (!fingerprint) return;
    
    try {
      const currentHour = new Date().getHours();
      
      // Mettre à jour ou créer l'entrée auth_context_scores
      const { error } = await supabase
        .from('auth_context_scores')
        .upsert({
          merchant_id: merchantId,
          device_fingerprint: fingerprint,
          device_name: deviceName || 'Unknown',
          is_primary_device: true,
          last_login_at: new Date().toISOString(),
          successful_logins: 1, // Will be incremented by trigger
          trust_score_updated_at: new Date().toISOString(),
        }, {
          onConflict: 'merchant_id',
        });
      
      if (error) {
        console.error('Error recording successful login:', error);
      }

      // Mettre à jour le log d'auth avec succès
      if (currentLogIdRef.current) {
        await updateAuthOutcome(currentLogIdRef.current, 'success');
        currentLogIdRef.current = null;
      }
    } catch (error) {
      console.error('Error in recordSuccessfulLogin:', error);
    }
  }, [fingerprint, deviceName, updateAuthOutcome]);

  // Enregistrer un échec d'authentification
  const recordFailedLogin = useCallback(async () => {
    if (currentLogIdRef.current) {
      await updateAuthOutcome(currentLogIdRef.current, 'failed');
      currentLogIdRef.current = null;
    }
  }, [updateAuthOutcome]);

  return {
    calculateTrustScore,
    recordSuccessfulLogin,
    recordFailedLogin,
    isCalculating,
    lastResult,
    thresholds: TRUST_THRESHOLDS,
  };
}
