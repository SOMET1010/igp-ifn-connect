import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTrustScore } from './useTrustScore';
import { useDeviceFingerprint } from './useDeviceFingerprint';
import { PersonaType, PERSONAS } from '../config/personas';
import { toast } from 'sonner';

/**
 * Hook principal d'Authentification Sociale PNAVIM
 * Orchestre les 4 couches du protocole
 * 
 * Layer 1: Identification vocale ("C'est qui est là ?")
 * Layer 2: Vérification invisible (device + contexte)
 * Layer 3: Challenge social (question culturelle)
 * Layer 4: Fallback humain (escalade vers agent)
 */

export type AuthLayer = 1 | 2 | 3 | 4;

export type AuthStep = 
  | 'welcome'      // Accueil initial
  | 'listening'    // Écoute du numéro
  | 'verifying'    // Vérification silencieuse
  | 'challenge'    // Question culturelle
  | 'fallback'     // Escalade humaine
  | 'success'      // Accès accordé
  | 'register';    // Nouvel utilisateur

interface SocialAuthState {
  layer: AuthLayer;
  step: AuthStep;
  phone: string | null;
  persona: PersonaType;
  trustScore: number;
  merchantId: string | null;
  merchantName: string | null;
  challengeQuestion: string | null;
  error: string | null;
}

interface UseSocialAuthProps {
  redirectPath: string;
  userType: 'merchant' | 'cooperative' | 'agent';
  onPhoneValidated?: (phone: string) => void;
}

export function useSocialAuth({ redirectPath, userType, onPhoneValidated }: UseSocialAuthProps) {
  const navigate = useNavigate();
  const { signInWithPhone, verifyOtp } = useAuth();
  const { calculateTrustScore, recordSuccessfulLogin } = useTrustScore();
  const { fingerprint } = useDeviceFingerprint();
  
  const [state, setState] = useState<SocialAuthState>({
    layer: 1,
    step: 'welcome',
    phone: null,
    persona: 'tantie', // Default persona
    trustScore: 0,
    merchantId: null,
    merchantName: null,
    challengeQuestion: null,
    error: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);

  // Obtenir le persona actuel
  const currentPersona = PERSONAS[state.persona];

  // Changer de persona
  const setPersona = useCallback((persona: PersonaType) => {
    setState(prev => ({ ...prev, persona }));
  }, []);

  // Layer 1: Traiter le numéro de téléphone détecté
  const processPhoneNumber = useCallback(async (phone: string) => {
    setState(prev => ({ ...prev, phone, step: 'verifying', layer: 2 }));
    setIsLoading(true);
    
    try {
      // Nettoyer et formater le numéro
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.startsWith('225') 
        ? `+${cleanPhone}` 
        : `+225${cleanPhone}`;
      
      // Layer 2: Calculer le score de confiance
      const trustResult = await calculateTrustScore(formattedPhone);
      
      setState(prev => ({
        ...prev,
        phone: formattedPhone,
        trustScore: trustResult.score,
        merchantId: trustResult.merchantId || null,
        merchantName: trustResult.merchantName || null,
      }));
      
      // Callback pour informer le parent
      onPhoneValidated?.(formattedPhone);
      
      // Décision basée sur le score
      if (trustResult.decision === 'direct_access') {
        // Score élevé = Accès direct
        await proceedToLogin(formattedPhone, trustResult.merchantId!);
      } else if (trustResult.decision === 'challenge') {
        // Score moyen = Question culturelle
        setState(prev => ({
          ...prev,
          layer: 3,
          step: 'challenge',
          challengeQuestion: currentPersona.greetings.challenge,
        }));
      } else if (trustResult.merchantId) {
        // Score bas mais utilisateur connu = Challenge aussi
        setState(prev => ({
          ...prev,
          layer: 3,
          step: 'challenge',
          challengeQuestion: currentPersona.greetings.challenge,
        }));
      } else {
        // Nouvel utilisateur = Inscription
        setState(prev => ({ ...prev, step: 'register' }));
      }
      
    } catch (error) {
      console.error('Error processing phone:', error);
      setState(prev => ({
        ...prev,
        error: "Erreur lors de la vérification. Réessayez.",
        step: 'welcome',
        layer: 1,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [calculateTrustScore, currentPersona, onPhoneValidated]);

  // Procéder à la connexion OTP
  const proceedToLogin = useCallback(async (phone: string, merchantId?: string) => {
    setIsLoading(true);
    
    try {
      // Générer et envoyer l'OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      
      // TODO: Envoyer l'OTP par SMS via LAFRICAMOBILE
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
      
      // Pour le dev, on affiche le code
      toast.info(`Code de vérification: ${otp}`, { duration: 10000 });
      
      setState(prev => ({ ...prev, step: 'success' }));
      
      // Enregistrer la connexion réussie pour améliorer le score
      if (merchantId) {
        await recordSuccessfulLogin(merchantId);
      }
      
    } catch (error) {
      console.error('Error during login:', error);
      escalateToHuman("Problème technique lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  }, [recordSuccessfulLogin]);

  // Layer 3: Valider la réponse au challenge culturel
  const validateChallengeAnswer = useCallback(async (answer: string) => {
    setIsLoading(true);
    
    try {
      if (!state.merchantId) {
        throw new Error('No merchant ID');
      }
      
      // Récupérer la question de sécurité du marchand
      const { data: securityQuestion, error } = await supabase
        .from('merchant_security_questions')
        .select('answer_normalized, answer_hash')
        .eq('merchant_id', state.merchantId)
        .eq('is_active', true)
        .single();
      
      if (error || !securityQuestion) {
        // Pas de question configurée - on accepte si le score est > 30
        if (state.trustScore > 30) {
          await proceedToLogin(state.phone!, state.merchantId);
          return true;
        }
        escalateToHuman("Vérification impossible");
        return false;
      }
      
      // Normaliser et comparer la réponse
      const normalizedAnswer = answer.toLowerCase().trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      const expectedAnswer = securityQuestion.answer_normalized.toLowerCase();
      
      // Comparaison floue (tolérance aux fautes de frappe)
      const isMatch = normalizedAnswer === expectedAnswer ||
        normalizedAnswer.includes(expectedAnswer) ||
        expectedAnswer.includes(normalizedAnswer);
      
      if (isMatch) {
        await proceedToLogin(state.phone!, state.merchantId);
        return true;
      } else {
        // Mauvaise réponse - escalade humaine
        escalateToHuman("Réponse incorrecte");
        return false;
      }
      
    } catch (error) {
      console.error('Error validating challenge:', error);
      escalateToHuman("Erreur de vérification");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state.merchantId, state.phone, state.trustScore, proceedToLogin]);

  // Layer 4: Escalade vers agent humain
  const escalateToHuman = useCallback((reason: string) => {
    setState(prev => ({
      ...prev,
      layer: 4,
      step: 'fallback',
      error: reason,
    }));
    
    // TODO: Créer un ticket d'assistance et notifier les agents
    toast.error(currentPersona.greetings.error);
  }, [currentPersona]);

  // Vérifier l'OTP et finaliser la connexion
  const verifyAndLogin = useCallback(async (otp: string) => {
    if (!state.phone) return false;
    
    setIsLoading(true);
    
    try {
      // En mode dev, vérifier avec le code généré
      if (generatedOtp && otp === generatedOtp) {
        // Simuler la connexion Supabase
        const { error } = await signInWithPhone(state.phone);
        
        if (error) {
          // Si l'utilisateur n'existe pas, créer un compte
          console.log('User may not exist, attempting signup flow');
        }
        
        toast.success(currentPersona.greetings.success);
        navigate(redirectPath);
        return true;
      }
      
      // Vérification réelle avec Supabase
      const { error } = await verifyOtp(state.phone, otp);
      
      if (error) {
        toast.error("Code incorrect. Réessayez.");
        return false;
      }
      
      toast.success(currentPersona.greetings.success);
      navigate(redirectPath);
      return true;
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error("Erreur de vérification");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state.phone, generatedOtp, signInWithPhone, verifyOtp, navigate, redirectPath, currentPersona]);

  // Réinitialiser le flow
  const reset = useCallback(() => {
    setState({
      layer: 1,
      step: 'welcome',
      phone: null,
      persona: state.persona,
      trustScore: 0,
      merchantId: null,
      merchantName: null,
      challengeQuestion: null,
      error: null,
    });
    setGeneratedOtp(null);
  }, [state.persona]);

  return {
    // State
    ...state,
    isLoading,
    currentPersona,
    generatedOtp, // Pour le mode dev
    
    // Actions
    processPhoneNumber,
    validateChallengeAnswer,
    verifyAndLogin,
    escalateToHuman,
    setPersona,
    reset,
    
    // Helpers
    getMessage: (key: keyof typeof currentPersona.greetings) => 
      currentPersona.greetings[key].replace('{name}', state.merchantName || ''),
  };
}
