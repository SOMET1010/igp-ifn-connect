/**
 * Hook useQuickSale - Mode vente rapide 5 secondes
 * P.NA.VIM
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/shared/services/logger';
import { 
  createQuickSale, 
  parseVoiceCommand, 
  generateConfirmationText,
  generateSuccessText 
} from '../services/saleService';
import type { QuickSaleStep, QuickSaleInput, QuickSaleState } from '../types/sale.types';

interface UseQuickSaleReturn {
  state: QuickSaleState;
  // Actions
  start: () => void;
  processVoiceInput: (text: string) => void;
  confirm: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
  // Helpers
  getConfirmationText: () => string;
  getSuccessText: () => string;
  isListening: boolean;
  isProcessing: boolean;
}

const INITIAL_STATE: QuickSaleState = {
  step: 'idle',
  input: null,
  error: null,
  saleId: null,
};

export function useQuickSale(): UseQuickSaleReturn {
  const [state, setState] = useState<QuickSaleState>(INITIAL_STATE);
  const { user } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [merchantId, setMerchantId] = useState<string | null>(null);

  // Récupérer le merchant_id au montage
  useState(() => {
    if (user?.id) {
      supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setMerchantId(data.id);
        });
    }
  });

  // Nettoyer le timeout à la fin
  const clearTimeoutIfExists = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Démarrer l'écoute
  const start = useCallback(() => {
    logger.info('QUICK_SALE:START');
    clearTimeoutIfExists();
    setState({
      ...INITIAL_STATE,
      step: 'listening',
    });
  }, [clearTimeoutIfExists]);

  // Traiter l'input vocal
  const processVoiceInput = useCallback((text: string) => {
    logger.info('QUICK_SALE:VOICE_INPUT', { text });
    
    setState(prev => ({ ...prev, step: 'parsing' }));
    
    const parsed = parseVoiceCommand(text);
    
    if (parsed && parsed.product) {
      logger.info('QUICK_SALE:PARSED', { parsed });
      setState({
        step: 'confirm',
        input: parsed,
        error: null,
        saleId: null,
      });
    } else {
      logger.warn('QUICK_SALE:PARSE_FAILED', { text });
      setState({
        step: 'error',
        input: null,
        error: "Je n'ai pas compris. Dites par exemple: 3 tomates 500 francs",
        saleId: null,
      });
      
      // Auto-retry après 3 secondes
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, step: 'listening', error: null }));
      }, 3000);
    }
  }, []);

  // Confirmer la vente
  const confirm = useCallback(async () => {
    if (!state.input || !merchantId) {
      toast.error("Impossible de confirmer la vente");
      return;
    }

    logger.info('QUICK_SALE:CONFIRMING', { input: state.input });
    setState(prev => ({ ...prev, step: 'processing' }));

    try {
      const result = await createQuickSale(merchantId, state.input);
      
      if (result.success) {
        setState({
          step: 'success',
          input: state.input,
          error: null,
          saleId: result.saleId || null,
        });
        
        if (result.offline) {
          toast.info("Vente enregistrée hors-ligne");
        } else {
          toast.success("Vente enregistrée !");
        }

        // Auto-reset après 3 secondes pour nouvelle vente
        timeoutRef.current = setTimeout(() => {
          setState({
            ...INITIAL_STATE,
            step: 'listening',
          });
        }, 3000);
      } else {
        throw new Error(result.error || 'Erreur lors de la vente');
      }
    } catch (error) {
      logger.error('QUICK_SALE:CONFIRM_FAILED', error as Error);
      setState(prev => ({
        ...prev,
        step: 'error',
        error: "Erreur lors de l'enregistrement. Réessayez.",
      }));
    }
  }, [state.input, merchantId]);

  // Annuler
  const cancel = useCallback(() => {
    logger.info('QUICK_SALE:CANCELLED');
    clearTimeoutIfExists();
    setState({
      ...INITIAL_STATE,
      step: 'listening',
    });
  }, [clearTimeoutIfExists]);

  // Reset complet
  const reset = useCallback(() => {
    clearTimeoutIfExists();
    setState(INITIAL_STATE);
  }, [clearTimeoutIfExists]);

  // Générer le texte de confirmation
  const getConfirmationText = useCallback(() => {
    if (!state.input) return '';
    return generateConfirmationText(state.input);
  }, [state.input]);

  // Générer le texte de succès
  const getSuccessText = useCallback(() => {
    const isOffline = !navigator.onLine;
    return generateSuccessText(isOffline);
  }, []);

  return {
    state,
    start,
    processVoiceInput,
    confirm,
    cancel,
    reset,
    getConfirmationText,
    getSuccessText,
    isListening: state.step === 'listening',
    isProcessing: state.step === 'processing',
  };
}
