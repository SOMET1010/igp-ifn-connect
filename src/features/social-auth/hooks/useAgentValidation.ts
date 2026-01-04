import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook pour gérer les validations agent (Couche 4)
 * Permet de demander et suivre les validations manuelles
 */

export interface ValidationRequest {
  id: string;
  validationCode: string;
  merchantId: string;
  validationType: 'identity' | 'device' | 'location' | 'transaction' | 'escalation';
  result: 'pending' | 'approved' | 'rejected' | 'expired';
  expiresAt: string;
}

export function useAgentValidation() {
  const [currentRequest, setCurrentRequest] = useState<ValidationRequest | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  /**
   * Générer un code de validation à 6 chiffres
   */
  const generateCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  /**
   * Demander une validation agent
   */
  const requestValidation = useCallback(async (
    merchantId: string,
    phone: string,
    reason: string,
    validationType: ValidationRequest['validationType'] = 'escalation'
  ): Promise<ValidationRequest | null> => {
    setIsRequesting(true);

    try {
      const validationCode = generateCode();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('trust_validations')
        .insert({
          merchant_id: merchantId,
          requested_by_phone: phone,
          validation_code: validationCode,
          validation_type: validationType,
          reason,
          expires_at: expiresAt,
        })
        .select('id, validation_code, merchant_id, validation_type, result, expires_at')
        .single();

      if (error) {
        console.error('Error requesting validation:', error);
        return null;
      }

      const request: ValidationRequest = {
        id: data.id,
        validationCode: data.validation_code,
        merchantId: data.merchant_id,
        validationType: data.validation_type as ValidationRequest['validationType'],
        result: data.result as ValidationRequest['result'],
        expiresAt: data.expires_at,
      };

      setCurrentRequest(request);

      // Notifier les agents (via push notification existante)
      await notifyAgents(merchantId, validationCode, reason);

      return request;
    } catch (error) {
      console.error('Error in requestValidation:', error);
      return null;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  /**
   * Notifier les agents de la zone
   */
  const notifyAgents = async (
    merchantId: string,
    validationCode: string,
    reason: string
  ): Promise<void> => {
    try {
      // Récupérer les infos du marchand
      const { data: merchant } = await supabase
        .from('merchants')
        .select('full_name, phone, market_id')
        .eq('id', merchantId)
        .single();

      if (!merchant) return;

      // Récupérer les agents actifs
      const { data: agents } = await supabase
        .from('agents')
        .select('user_id')
        .eq('is_active', true);

      if (!agents || agents.length === 0) return;

      // Envoyer notification push à chaque agent
      await supabase.functions.invoke('send-push-notification', {
        body: {
          userIds: agents.map(a => a.user_id),
          title: '🔐 Validation requise',
          body: `${merchant.full_name} demande une validation. Code: ${validationCode}`,
          data: {
            type: 'validation_request',
            merchantId,
            validationCode,
            reason,
          },
        },
      });
    } catch (error) {
      console.error('Error notifying agents:', error);
    }
  };

  /**
   * Vérifier le statut d'une validation
   */
  const checkValidationStatus = useCallback(async (
    requestId: string
  ): Promise<ValidationRequest['result']> => {
    try {
      const { data, error } = await supabase
        .from('trust_validations')
        .select('result')
        .eq('id', requestId)
        .single();

      if (error || !data) return 'pending';

      return data.result as ValidationRequest['result'];
    } catch {
      return 'pending';
    }
  }, []);

  /**
   * Écouter les changements de statut en temps réel
   */
  const subscribeToValidation = useCallback((
    requestId: string,
    onStatusChange: (status: ValidationRequest['result']) => void
  ) => {
    const channel = supabase
      .channel(`validation-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trust_validations',
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          const newResult = payload.new.result as ValidationRequest['result'];
          onStatusChange(newResult);
          
          if (newResult !== 'pending') {
            setCurrentRequest(prev => prev ? { ...prev, result: newResult } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /**
   * Valider une demande (côté agent)
   */
  const validateRequest = useCallback(async (
    validationCode: string,
    agentId: string,
    approved: boolean,
    notes?: string
  ): Promise<boolean> => {
    try {
      // Trouver la validation par code
      const { data: validation, error: findError } = await supabase
        .from('trust_validations')
        .select('id, merchant_id')
        .eq('validation_code', validationCode)
        .eq('result', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (findError || !validation) {
        console.error('Validation not found or expired');
        return false;
      }

      // Mettre à jour la validation
      const { error: updateError } = await supabase
        .from('trust_validations')
        .update({
          result: approved ? 'approved' : 'rejected',
          validated_by: agentId,
          validator_role: 'agent',
          validated_at: new Date().toISOString(),
          notes,
        })
        .eq('id', validation.id);

      if (updateError) {
        console.error('Error updating validation:', updateError);
        return false;
      }

      // Logger l'action de l'agent
      await supabase
        .from('agent_actions')
        .insert({
          agent_id: agentId,
          action_type: 'merchant_validation',
          target_merchant_id: validation.merchant_id,
          validation_id: validation.id,
          outcome: approved ? 'completed' : 'rejected',
          details: { notes },
        });

      return true;
    } catch (error) {
      console.error('Error in validateRequest:', error);
      return false;
    }
  }, []);

  /**
   * Annuler la demande en cours
   */
  const cancelRequest = useCallback(() => {
    setCurrentRequest(null);
  }, []);

  // Nettoyer lors du démontage
  useEffect(() => {
    return () => {
      setCurrentRequest(null);
    };
  }, []);

  return {
    currentRequest,
    isRequesting,
    requestValidation,
    checkValidationStatus,
    subscribeToValidation,
    validateRequest,
    cancelRequest,
  };
}
