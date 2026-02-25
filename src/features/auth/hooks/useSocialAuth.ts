import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/shared/contexts';
import { useTrustScore } from '@/features/auth/hooks/useTrustScore';
import { useDeviceFingerprint } from '@/features/auth/hooks/useDeviceFingerprint';
import { PersonaType, PERSONAS, CULTURAL_QUESTIONS } from '@/features/auth/config/personas';
import { normalizeAnswer, similarityScore } from '@/features/auth/utils/normalize';
import { toast } from 'sonner';

/**
 * Hook principal d'Authentification Sociale JÙLABA
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

interface SecurityQuestion {
  id: string;
  question_type: string;
  question_text: string;
  question_text_dioula: string | null;
  answer_normalized: string;
}

interface SocialAuthState {
  layer: AuthLayer;
  step: AuthStep;
  phone: string | null;
  persona: PersonaType;
  trustScore: number;
  merchantId: string | null;
  merchantName: string | null;
  challengeQuestion: SecurityQuestion | null;
  error: string | null;
}

interface UseSocialAuthProps {
  redirectPath: string;
  userType: 'merchant' | 'cooperative' | 'agent';
  onPhoneValidated?: (phone: string) => void;
  initialPersona?: PersonaType;
}

export function useSocialAuth({ redirectPath, userType, onPhoneValidated, initialPersona = 'tantie' }: UseSocialAuthProps) {
  const navigate = useNavigate();
  const { signInWithPhone, verifyOtp } = useAuth();
  const { calculateTrustScore, recordSuccessfulLogin } = useTrustScore();
  const { fingerprint } = useDeviceFingerprint();
  
  const [state, setState] = useState<SocialAuthState>({
    layer: 1,
    step: 'welcome',
    phone: null,
    persona: initialPersona,
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
      } else if (trustResult.decision === 'challenge' || (trustResult.merchantId && trustResult.score < 70)) {
        // Score moyen = Question culturelle - chercher une vraie question de sécurité
        const { data: securityQuestions } = await supabase
          .from('merchant_security_questions')
          .select('id, question_type, question_text, question_text_dioula, answer_normalized')
          .eq('merchant_id', trustResult.merchantId!)
          .eq('is_active', true);
        
        if (securityQuestions && securityQuestions.length > 0) {
          // Choisir une question aléatoire
          const randomQ = securityQuestions[Math.floor(Math.random() * securityQuestions.length)];
          setState(prev => ({
            ...prev,
            layer: 3,
            step: 'challenge',
            challengeQuestion: randomQ,
          }));
        } else {
          // Pas de question configurée - utiliser le challenge générique du persona
          setState(prev => ({
            ...prev,
            layer: 3,
            step: 'challenge',
            challengeQuestion: {
              id: 'generic',
              question_type: 'mother_name',
              question_text: CULTURAL_QUESTIONS.mother_name.fr,
              question_text_dioula: CULTURAL_QUESTIONS.mother_name.dioula,
              answer_normalized: '',
            },
          }));
        }
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

  // Layer 4: Escalade vers agent humain (déclaré en premier car utilisé par les autres fonctions)
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
  }, [recordSuccessfulLogin, escalateToHuman]);

  // Layer 3: Valider la réponse au challenge culturel
  const validateChallengeAnswer = useCallback(async (answer: string) => {
    setIsLoading(true);
    
    try {
      const { challengeQuestion, merchantId, phone, trustScore } = state;
      
      if (!merchantId) {
        throw new Error('No merchant ID');
      }
      
      // Si c'est une question générique (pas de réponse stockée)
      if (challengeQuestion?.id === 'generic' || !challengeQuestion?.answer_normalized) {
        // On accepte si le score est > 30 (l'utilisateur est probablement légitime)
        if (trustScore > 30) {
          await proceedToLogin(phone!, merchantId);
          return true;
        }
        escalateToHuman("Vérification impossible - pas de question configurée");
        return false;
      }
      
      // Normaliser et comparer la réponse
      const normalizedAnswer = normalizeAnswer(answer);
      const expectedAnswer = challengeQuestion.answer_normalized;
      
      // Comparaison avec tolérance aux fautes
      const similarity = similarityScore(normalizedAnswer, expectedAnswer);
      
      // Accepter si similarité > 80% (tolérance aux fautes mineures)
      if (similarity >= 80) {
        console.log(`[Layer3] Answer accepted with similarity ${similarity}%`);
        await proceedToLogin(phone!, merchantId);
        return true;
      } else {
        // Mauvaise réponse - escalade humaine
        console.log(`[Layer3] Answer rejected - similarity ${similarity}%`);
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
  }, [state, proceedToLogin, escalateToHuman]);

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
