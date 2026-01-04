import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook pour journaliser les décisions d'authentification (Couche 3)
 * Assure la traçabilité complète des connexions
 */

export interface AuthLogEntry {
  merchantId?: string;
  phone: string;
  decision: 'direct_access' | 'challenge' | 'human_fallback';
  trustScore?: number;
  factors?: Record<string, unknown>;
  deviceFingerprint?: string;
  latitude?: number;
  longitude?: number;
}

export interface RiskEvent {
  merchantId?: string;
  eventType: 'new_device' | 'unusual_location' | 'unusual_time' | 'repeated_failures' | 'high_amount' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, unknown>;
}

export function useAuthLogging() {
  /**
   * Logger une décision d'authentification
   */
  const logAuthDecision = useCallback(async (entry: AuthLogEntry): Promise<string | null> => {
    try {
      const insertData: Record<string, unknown> = {
        phone: entry.phone,
        decision: entry.decision,
        trust_score: entry.trustScore,
        factors: entry.factors || {},
        device_fingerprint: entry.deviceFingerprint,
        latitude: entry.latitude,
        longitude: entry.longitude,
        user_agent: navigator.userAgent,
        outcome: 'pending',
      };
      
      if (entry.merchantId) {
        insertData.merchant_id = entry.merchantId;
      }

      const { data, error } = await supabase
        .from('auth_context_logs')
        .insert([insertData as any])
        .select('id')
        .single();

      if (error) {
        console.error('Error logging auth decision:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Error in logAuthDecision:', error);
      return null;
    }
  }, []);

  /**
   * Mettre à jour le résultat d'une tentative d'auth
   */
  const updateAuthOutcome = useCallback(async (
    logId: string,
    outcome: 'success' | 'failed' | 'abandoned'
  ): Promise<void> => {
    try {
      await supabase
        .from('auth_context_logs')
        .update({ outcome })
        .eq('id', logId);
    } catch (error) {
      console.error('Error updating auth outcome:', error);
    }
  }, []);

  /**
   * Créer un événement de risque
   */
  const createRiskEvent = useCallback(async (event: RiskEvent): Promise<void> => {
    try {
      const insertData: Record<string, unknown> = {
        event_type: event.eventType,
        severity: event.severity,
        details: event.details || {},
      };

      if (event.merchantId) {
        insertData.merchant_id = event.merchantId;
      }

      await supabase
        .from('risk_events')
        .insert([insertData as any]);
    } catch (error) {
      console.error('Error creating risk event:', error);
    }
  }, []);

  /**
   * Détecter et créer des événements de risque basés sur les facteurs
   */
  const detectRiskEvents = useCallback(async (
    merchantId: string | undefined,
    factors: {
      deviceKnown: boolean;
      geoMatch: boolean;
      timeMatch: boolean;
    },
    trustScore: number
  ): Promise<void> => {
    const events: RiskEvent[] = [];

    // Nouveau device détecté
    if (!factors.deviceKnown) {
      events.push({
        merchantId,
        eventType: 'new_device',
        severity: trustScore < 40 ? 'high' : 'medium',
        details: { trustScore },
      });
    }

    // Localisation inhabituelle avec score bas
    if (!factors.geoMatch && trustScore < 50) {
      events.push({
        merchantId,
        eventType: 'unusual_location',
        severity: 'high',
        details: { trustScore },
      });
    }

    // Heure inhabituelle avec score bas
    if (!factors.timeMatch && trustScore < 40) {
      events.push({
        merchantId,
        eventType: 'unusual_time',
        severity: 'medium',
        details: { trustScore, hour: new Date().getHours() },
      });
    }

    // Créer tous les événements en parallèle
    if (events.length > 0) {
      await Promise.all(events.map(e => createRiskEvent(e)));
    }
  }, [createRiskEvent]);

  return {
    logAuthDecision,
    updateAuthOutcome,
    createRiskEvent,
    detectRiskEvents,
  };
}
