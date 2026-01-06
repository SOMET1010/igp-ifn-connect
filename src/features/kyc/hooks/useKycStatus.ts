import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoMode } from '@/shared/hooks';
import type { KycLevel, KycStatus, KycRequest, KYC_LEVELS_CONFIG } from '../types/kyc.types';

interface UseKycStatusReturn {
  kycLevel: KycLevel;
  kycStatus: KycStatus | null;
  kycRequest: KycRequest | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  canAccess: (feature: 'credit' | 'wallet' | 'insurance') => boolean;
  getDailyLimit: () => number;
  getMonthlyLimit: () => number;
  isLevelSufficient: (requiredLevel: KycLevel) => boolean;
}

const LEVEL_ORDER: Record<KycLevel, number> = {
  level_0: 0,
  level_1: 1,
  level_2: 2,
};

const LEVEL_LIMITS: Record<KycLevel, { daily: number; monthly: number; credit: boolean; wallet: boolean; insurance: boolean }> = {
  level_0: { daily: 0, monthly: 0, credit: false, wallet: false, insurance: false },
  level_1: { daily: 50000, monthly: 500000, credit: false, wallet: true, insurance: false },
  level_2: { daily: 500000, monthly: 5000000, credit: true, wallet: true, insurance: true },
};

export function useKycStatus(): UseKycStatusReturn {
  const { user } = useAuth();
  const { isDemoMode, demoRole } = useDemoMode();
  
  const [kycLevel, setKycLevel] = useState<KycLevel>('level_0');
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [kycRequest, setKycRequest] = useState<KycRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKycStatus = useCallback(async () => {
    // Mode démo
    if (isDemoMode) {
      setKycLevel(demoRole === 'admin' ? 'level_2' : 'level_1');
      setKycStatus('approved');
      setIsLoading(false);
      return;
    }

    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Récupérer la demande KYC la plus récente
      const { data, error: fetchError } = await supabase
        .from('kyc_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        // Cast the data to match our types
        const typedData: KycRequest = {
          ...data,
          level: data.level as KycLevel,
          status: data.status as KycStatus,
          id_document_type: data.id_document_type as 'cni' | 'passport' | 'cmu' | null,
        };
        
        setKycRequest(typedData);
        setKycStatus(typedData.status);
        
        // Le niveau effectif dépend du statut
        if (typedData.status === 'approved') {
          setKycLevel(typedData.level);
        } else if (typedData.phone_verified) {
          setKycLevel('level_1');
        } else {
          setKycLevel('level_0');
        }
      } else {
        // Pas de demande KYC, vérifier si le téléphone est vérifié via le profil
        setKycLevel('level_0');
        setKycStatus(null);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération du statut KYC:', err);
      setError('Impossible de charger le statut KYC');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isDemoMode, demoRole]);

  useEffect(() => {
    fetchKycStatus();
  }, [fetchKycStatus]);

  const canAccess = useCallback((feature: 'credit' | 'wallet' | 'insurance'): boolean => {
    const limits = LEVEL_LIMITS[kycLevel];
    switch (feature) {
      case 'credit': return limits.credit;
      case 'wallet': return limits.wallet;
      case 'insurance': return limits.insurance;
      default: return false;
    }
  }, [kycLevel]);

  const getDailyLimit = useCallback((): number => {
    return LEVEL_LIMITS[kycLevel].daily;
  }, [kycLevel]);

  const getMonthlyLimit = useCallback((): number => {
    return LEVEL_LIMITS[kycLevel].monthly;
  }, [kycLevel]);

  const isLevelSufficient = useCallback((requiredLevel: KycLevel): boolean => {
    return LEVEL_ORDER[kycLevel] >= LEVEL_ORDER[requiredLevel];
  }, [kycLevel]);

  return {
    kycLevel,
    kycStatus,
    kycRequest,
    isLoading,
    error,
    refetch: fetchKycStatus,
    canAccess,
    getDailyLimit,
    getMonthlyLimit,
    isLevelSufficient,
  };
}
