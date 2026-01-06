/**
 * Hook useQuickSale - Mode vente rapide 5 secondes
 * P.NA.VIM
 * 
 * Permet d'enregistrer une vente par la voix en 3 étapes :
 * 1. Écoute ("3 tomates 500")
 * 2. Confirmation ("3 tomates pour 500F, on valide ?")
 * 3. Succès (Enregistrement + Feedback)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/shared/contexts';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/shared/services/logger';
import { 
  createQuickSale, 
  parseVoiceCommand, 
  generateConfirmationText,
  generateSuccessText 
} from '../services/saleService';
import type { QuickSaleState } from '../types/sale.types';

interface UseQuickSaleReturn {
  state: QuickSaleState;
  start: () => void;
  processVoiceInput: (text: string) => void;
  confirm: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
  getConfirmationText: () => string;
  getSuccessText: () => string;
  isListening: boolean;
  isProcessing: boolean;
  hasError: boolean;
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

  // --- 1. Initialisation & Nettoyage ---

  // Récupérer l'ID Marchand (Critique pour la vente)
  useEffect(() => {
    let mounted = true;
    
    const fetchMerchantId = async () => {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('merchants')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        if (mounted && data) setMerchantId(data.id);
      } catch (err) {
        logger.error('QUICK_SALE:FETCH_MERCHANT_ERROR', err as Error);
        toast.error("Impossible de charger le profil marchand");
      }
    };

    fetchMerchantId();
    return () => { mounted = false; };
  }, [user?.id]);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // --- 2. Actions Principales ---

  /**
   * Démarrer une nouvelle vente
   * Réinitialise l'état et passe en mode écoute
   */
  const start = useCallback(() => {
    logger.info('QUICK_SALE:START');
    clearTimer();
    setState({
      ...INITIAL_STATE,
      step: 'listening',
    });
  }, [clearTimer]);

  /**
   * Traiter le texte reçu du moteur vocal (STT)
   * @param text La phrase prononcée (ex: "2 piments 100 francs")
   */
  const processVoiceInput = useCallback((text: string) => {
    if (!text || text.trim().length === 0) return;
    
    logger.info('QUICK_SALE:VOICE_INPUT', { text });
    setState(prev => ({ ...prev, step: 'parsing' }));
    
    // Parser la commande (Logique métier)
    const parsed = parseVoiceCommand(text);
    
    if (parsed && parsed.product && (parsed.totalAmount || parsed.unitPrice)) {
      // Succès du parsing
      logger.info('QUICK_SALE:PARSED_SUCCESS', { parsed });
      setState({
        step: 'confirm',
        input: parsed,
        error: null,
        saleId: null,
      });
    } else {
      // Échec du parsing
      logger.warn('QUICK_SALE:PARSE_FAILED', { text });
      setState({
        step: 'error',
        input: null,
        error: "Je n'ai pas compris le produit ou le prix. Essayez : 'Tomate 500'",
        saleId: null,
      });
      
      // Retour automatique à l'écoute après 3s
      clearTimer();
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, step: 'listening', error: null }));
      }, 3000);
    }
  }, [clearTimer]);

  /**
   * Confirmer et enregistrer la vente
   * Gère le mode Online/Offline
   */
  const confirm = useCallback(async () => {
    if (!state.input || !merchantId) {
      logger.error('QUICK_SALE:CONFIRM_ERROR', new Error('Missing input or merchantId'));
      toast.error("Données manquantes pour la vente");
      return;
    }

    logger.info('QUICK_SALE:CONFIRMING', { input: state.input });
    setState(prev => ({ ...prev, step: 'processing' }));

    try {
      // Appel au service de vente (qui gère la synchro offline)
      const result = await createQuickSale(merchantId, state.input);
      
      if (result.success) {
        setState({
          step: 'success',
          input: state.input,
          error: null,
          saleId: result.saleId || null,
        });
        
        // Feedback Utilisateur
        const successMsg = result.offline 
          ? "Vente sauvegardée (Hors ligne)" 
          : "Vente enregistrée avec succès !";
        
        toast.success(successMsg);

        // Mode mains-libres : enchaîner directement après 2.5s
        clearTimer();
        timeoutRef.current = setTimeout(() => {
          start();
        }, 2500);

      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      logger.error('QUICK_SALE:CONFIRM_FAILED', error as Error);
      setState(prev => ({
        ...prev,
        step: 'error',
        error: "Échec de l'enregistrement. Vérifiez votre connexion.",
      }));
    }
  }, [state.input, merchantId, clearTimer, start]);

  /**
   * Annuler l'action en cours
   */
  const cancel = useCallback(() => {
    logger.info('QUICK_SALE:CANCELLED');
    clearTimer();
    // On revient en mode écoute, prêt pour une nouvelle phrase
    setState({
      ...INITIAL_STATE,
      step: 'listening',
    });
  }, [clearTimer]);

  /**
   * Réinitialiser complètement le hook
   */
  const reset = useCallback(() => {
    clearTimer();
    setState(INITIAL_STATE);
  }, [clearTimer]);

  // --- 3. Helpers (Texte & État) ---

  const getConfirmationText = useCallback(() => {
    if (!state.input) return '';
    return generateConfirmationText(state.input);
  }, [state.input]);

  const getSuccessText = useCallback(() => {
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
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
    hasError: state.step === 'error',
  };
}
