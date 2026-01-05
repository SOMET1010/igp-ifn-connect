import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Loader2, ArrowRight, Phone, RotateCcw, CheckCircle2, Volume2, VolumeX, Delete, ShieldCheck, AlertTriangle, PhoneCall, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTrustScore } from '@/features/auth/hooks/useTrustScore';
import { useVoiceQueue } from '@/shared/hooks/useVoiceQueue';
import { useVoiceTranscription } from '@/features/auth/hooks/useVoiceTranscription';
import { SocialChallenge } from './SocialChallenge';
import { SimpleRegistrationForm } from './SimpleRegistrationForm';
import { supabase } from '@/integrations/supabase/client';
import { merchantLoginConfig, agentLoginConfig, cooperativeLoginConfig } from '@/features/auth/config/loginConfigs';
import { AudioLevelIndicator } from './AudioLevelIndicator';
import { AudioFeedbackBanner } from './AudioFeedbackBanner';
import { MicDebugPanel } from './MicDebugPanel';
interface InclusivePhoneAuthProps {
  redirectPath: string;
  userType: 'merchant' | 'cooperative' | 'agent';
  className?: string;
}

type Step = 'phone' | 'phone_confirm' | 'otp' | 'verifying' | 'social_check' | 'blocked' | 'success' | 'register';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * InclusivePhoneAuth - SmartAuthGate PNAVIM v2
 * 
 * Flow "Zéro Lecture, Zéro Mémoire" :
 * - 🎤 Bouton micro géant pour dicter le numéro
 * - 📩 WebOTP API pour auto-remplissage SMS (Android)
 * - 📞 Callback vocal si SMS échoue
 * - Risk Gate invisible : 🟢 Direct | 🟠 Challenge | 🔴 Agent
 */
// Détection iframe
const useIframeDetection = () => {
  const isInIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  const isSecureContext = typeof window !== 'undefined' ? window.isSecureContext : false;
  const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia);
  return { isInIframe, isSecureContext, hasGetUserMedia };
};

export function InclusivePhoneAuth({ 
  redirectPath, 
  userType,
  className 
}: InclusivePhoneAuthProps) {
  const navigate = useNavigate();
  const { calculateTrustScore, recordSuccessfulLogin } = useTrustScore();
  const { speak, stop, isSpeaking } = useVoiceQueue();
  const { isInIframe, isSecureContext, hasGetUserMedia } = useIframeDetection();
  
  // État principal
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  
  // Assistance vocale
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  
  // Risk Gate
  const [trustResult, setTrustResult] = useState<any>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [socialQuestion, setSocialQuestion] = useState<{
    question: string;
    options: Array<{ label: string; icon: string; value: string }>;
    correctValue: string;
  } | null>(null);

  // Timeout management
  const [isTimeout, setIsTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const otpAbortRef = useRef<AbortController | null>(null);
  
  // Mode debug (activer en tapant 3 fois sur le titre)
  const [debugMode, setDebugMode] = useState(false);
  const debugTapCountRef = useRef(0);
  const debugTapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Transcription vocale pour le numéro (avec audioLevel pour feedback visuel)
  const { 
    startListening, 
    stopListening, 
    isConnected: isVoiceConnected, 
    isConnecting: isVoiceConnecting,
    transcript,
    extractedDigits,
    errorMessage: voiceError,
    scribeStatus,
    scribeError,
    // Métriques audio pour feedback visuel
    audioLevel,
    isReceivingAudio,
    levelHistory,
    audioStatus,
    silenceDuration,
    state: voiceState,
  } = useVoiceTranscription({
    onPhoneDetected: (detectedPhone) => {
      setPhone(detectedPhone);
      setIsListeningMic(false);
      stopListening();
      // Montrer l'écran de confirmation
      setStep('phone_confirm');
      // Lire le numéro détecté
      const spaced = detectedPhone.split('').join(' ');
      vibrate(100);
      speak(`J'ai entendu ${spaced}. C'est bon ?`, { priority: 'high' });
    },
    onDigitsProgress: (digits, count) => {
      // Feedback progressif pendant la dictée
      vibrate(20);
      if (count === 4) {
        speak('Continue...', { priority: 'normal' });
      } else if (count === 8) {
        speak('Presque fini...', { priority: 'normal' });
      }
    },
    onError: (err) => {
      const msg = err || 'Erreur vocale';
      setIsListeningMic(false);
      toast.error(msg);
      speak(msg, { priority: 'high' });
    }
  });

  // Message d'accueil au chargement pour les marchands
  const hasPlayedWelcomeRef = useRef(false);
  useEffect(() => {
    if (userType === 'merchant' && !hasPlayedWelcomeRef.current) {
      hasPlayedWelcomeRef.current = true;
      setVoiceEnabled(true);
      // Petit délai pour laisser la page charger
      const timer = setTimeout(() => {
        speak("Bienvenue ! Appuie sur le gros bouton micro et dis ton numéro de téléphone. Je t'aide.", { priority: 'high' });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [userType, speak]);

  // Timeout si aucune détection après 10 secondes d'écoute
  const noDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isListeningMic && isVoiceConnected) {
      noDetectionTimeoutRef.current = setTimeout(() => {
        if (!extractedDigits || extractedDigits.length < 4) {
          speak("Je n'entends rien. Tu peux aussi taper ton numéro sur le clavier.", { priority: 'high' });
        }
      }, 10000);
    }
    return () => {
      if (noDetectionTimeoutRef.current) {
        clearTimeout(noDetectionTimeoutRef.current);
      }
    };
  }, [isListeningMic, isVoiceConnected, extractedDigits, speak]);

  // Format visuel du téléphone : "07 01 02 03 04"
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  };

  // Feedback haptique
  const vibrate = (duration: number = 30) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  // Lecture vocale d'un chiffre
  const speakDigit = useCallback((digit: string) => {
    if (!voiceEnabled) return;
    const digitWords: Record<string, string> = {
      '0': 'zéro', '1': 'un', '2': 'deux', '3': 'trois', '4': 'quatre',
      '5': 'cinq', '6': 'six', '7': 'sept', '8': 'huit', '9': 'neuf'
    };
    speak(digitWords[digit] || digit, { priority: 'high' });
  }, [voiceEnabled, speak]);

  // Répéter le numéro complet
  const repeatPhone = useCallback(() => {
    if (phone.length === 0) {
      speak('Aucun chiffre saisi', { priority: 'high' });
      return;
    }
    const digits = phone.split('').map(d => {
      const words: Record<string, string> = {
        '0': 'zéro', '1': 'un', '2': 'deux', '3': 'trois', '4': 'quatre',
        '5': 'cinq', '6': 'six', '7': 'sept', '8': 'huit', '9': 'neuf'
      };
      return words[d] || d;
    });
    speak(`Ton numéro : ${digits.join(', ')}`, { priority: 'high' });
  }, [phone, speak]);

  // Message d'aide contextuel
  const getPhoneHelperText = () => {
    if (phone.length === 0) return 'Appuie sur le micro et parle';
    if (phone.length < 5) return 'Continue...';
    if (phone.length < 10) return `Encore ${10 - phone.length} chiffres`;
    return '✅ Numéro complet !';
  };

  // Ouvrir en plein écran (hors iframe)
  const handleOpenFullscreen = () => {
    window.open(window.location.href, '_blank');
  };

  // Démarrer l'écoute micro (avec indication claire + auto-fin sur pause)
  const handleMicClick = async () => {
    // 2e tap = arrêter
    if (isListeningMic || isVoiceConnecting || isVoiceConnected) {
      stopListening();
      setIsListeningMic(false);
      vibrate(30);
      speak('D’accord', { priority: 'normal' });
      return;
    }

    // Stopper TTS avant de démarrer le micro (anti-interférence)
    stop();

    try {
      setIsListeningMic(true);
      vibrate(50);

      await startListening();

      vibrate(30);
      // Délai court avant annonce pour éviter interférence
      setTimeout(() => {
        speak("C'est bon, je t'écoute. Dis ton numéro lentement.", { priority: 'high' });
      }, 300);
    } catch (err) {
      setIsListeningMic(false);
      toast.info('Utilise le clavier pour entrer ton numéro', { duration: 4000 });
      speak('Tape ton numéro sur le clavier', { priority: 'normal' });
    }
  };

  // Gérer la saisie téléphone
  const handlePhoneChange = (digit: string) => {
    if (phone.length >= 10) return;
    vibrate(30);
    setPhone(prev => prev + digit);
    setError(null);
    speakDigit(digit);
  };

  const handlePhoneBackspace = () => {
    if (phone.length > 0) {
      vibrate(20);
      setPhone(prev => prev.slice(0, -1));
      setError(null);
      if (voiceEnabled) speak('Effacé', { priority: 'normal' });
    }
  };

  const handlePhoneClear = () => {
    vibrate(50);
    setPhone('');
    setError(null);
    if (voiceEnabled) speak('Tout effacé', { priority: 'normal' });
  };

  // Toggle voix
  const toggleVoice = () => {
    if (voiceEnabled) {
      stop();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
      speak('Assistance vocale activée. Appuie sur le gros micro pour parler.', { priority: 'high' });
    }
  };
  
  // Toggle debug mode (triple tap sur le badge)
  const handleDebugTap = () => {
    debugTapCountRef.current++;
    
    if (debugTapTimerRef.current) {
      clearTimeout(debugTapTimerRef.current);
    }
    
    debugTapTimerRef.current = setTimeout(() => {
      debugTapCountRef.current = 0;
    }, 500);
    
    if (debugTapCountRef.current >= 3) {
      setDebugMode(prev => !prev);
      debugTapCountRef.current = 0;
      vibrate(100);
      console.log('[DEBUG] Mode debug:', !debugMode);
    }
  };

  // Confirmer le numéro dicté
  const handleConfirmPhone = () => {
    vibrate(50);
    handleSubmitPhone();
  };

  // Corriger le numéro dicté
  const handleRejectPhone = () => {
    vibrate(30);
    setPhone('');
    setStep('phone');
    speak('D\'accord, réessaye', { priority: 'normal' });
  };

  // Étape 1 : Envoyer le numéro et recevoir OTP
  const handleSubmitPhone = useCallback(async () => {
    if (phone.length !== 10) {
      setError('Le numéro doit avoir 10 chiffres');
      if (voiceEnabled) speak('Le numéro doit avoir 10 chiffres', { priority: 'high' });
      return;
    }

    const validPrefixes = ['01', '05', '07', '21', '25', '27'];
    const prefix = phone.substring(0, 2);
    if (!validPrefixes.includes(prefix)) {
      setError('Numéro ivoirien invalide');
      if (voiceEnabled) speak('Ce numéro n\'est pas valide', { priority: 'high' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = `+225${phone}`;
      
      // Générer OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setDevOtp(generatedOtp);
      
      console.log(`[DEV] OTP pour ${formattedPhone}: ${generatedOtp}`);
      toast.info(`Code: ${generatedOtp}`, { duration: 15000 });

      if (voiceEnabled) {
        speak(`Code envoyé. Ton code est ${generatedOtp.split('').join(', ')}`, { priority: 'high' });
      }

      setStep('otp');
      
    } catch (err) {
      console.error('Erreur envoi OTP:', err);
      setError('Impossible d\'envoyer le code');
      if (voiceEnabled) speak('Erreur. Réessaye.', { priority: 'high' });
    } finally {
      setIsLoading(false);
    }
  }, [phone, voiceEnabled, speak]);

  // WebOTP API - Auto-remplissage SMS (Android)
  useEffect(() => {
    if (step !== 'otp') return;
    
    // Vérifier si WebOTP est supporté
    if (!('OTPCredential' in window)) {
      console.log('[WebOTP] Not supported');
      return;
    }

    const ac = new AbortController();
    otpAbortRef.current = ac;

    console.log('[WebOTP] Listening for SMS...');

    (navigator.credentials as any).get({
      otp: { transport: ['sms'] },
      signal: ac.signal,
    })
    .then((otpCredential: any) => {
      if (otpCredential?.code) {
        console.log('[WebOTP] Code detected:', otpCredential.code);
        setOtp(otpCredential.code);
        toast.success('Code détecté automatiquement !');
        vibrate(100);
        // Auto-submit sera déclenché par l'effet sur otp
      }
    })
    .catch((err: any) => {
      if (err.name !== 'AbortError') {
        console.log('[WebOTP] Error:', err.message);
      }
    });

    return () => {
      ac.abort();
      otpAbortRef.current = null;
    };
  }, [step]);

  // Déterminer le niveau de risque
  const getRiskLevel = (score: number): RiskLevel => {
    if (score >= 60) return 'LOW';
    if (score >= 30) return 'MEDIUM';
    return 'HIGH';
  };

  // Étape 2 : Vérifier l'OTP + Risk Gate (Trust Score uniquement pour marchands)
  const handleSubmitOtp = useCallback(async () => {
    if (otp.length !== 6) {
      setError('Le code doit avoir 6 chiffres');
      return;
    }

    // Vérifier OTP d'abord
    if (!devOtp || otp !== devOtp) {
      setError('Code incorrect');
      vibrate(100);
      if (voiceEnabled) speak('Code incorrect. Réessaye.', { priority: 'high' });
      return;
    }

    // Annuler WebOTP
    if (otpAbortRef.current) {
      otpAbortRef.current.abort();
    }

    // OTP valide - passer à l'écran de vérification
    setStep('verifying');
    setIsTimeout(false);

    // Pour les agents et coopératives : accès direct sans Trust Score
    if (userType !== 'merchant') {
      console.log(`[handleSubmitOtp] ${userType} - Accès direct sans Trust Score`);
      await new Promise(r => setTimeout(r, 800)); // Petite pause pour UX
      await finalizeLogin();
      return;
    }

    // Trust Score uniquement pour les marchands
    // Timeout de 12 secondes
    timeoutRef.current = setTimeout(() => {
      setIsTimeout(true);
    }, 12000);

    try {
      const formattedPhone = `+225${phone}`;
      const result = await calculateTrustScore(formattedPhone);
      
      // Annuler le timeout si réponse reçue
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setTrustResult(result);
      const level = getRiskLevel(result.score);
      setRiskLevel(level);

      // Petite pause pour montrer l'animation de vérification
      await new Promise(r => setTimeout(r, 1500));

      // Décision basée sur le risque
      if (level === 'LOW') {
        // 🟢 Accès direct
        await finalizeLogin(result.merchantId);
      } else if (level === 'MEDIUM') {
        // 🟠 Challenge social
        prepareSocialChallenge(result);
        setStep('social_check');
      } else {
        // 🔴 Risque élevé - pour MVP on laisse passer, en prod: setStep('blocked')
        await finalizeLogin(result.merchantId);
      }
      
    } catch (err) {
      console.error('Erreur vérification:', err);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsTimeout(true);
    }
  }, [otp, devOtp, phone, userType, calculateTrustScore, voiceEnabled, speak]);

  // Retry après timeout
  const handleRetryVerification = useCallback(async () => {
    setIsTimeout(false);
    setStep('verifying');
    
    timeoutRef.current = setTimeout(() => {
      setIsTimeout(true);
    }, 12000);

    try {
      const formattedPhone = `+225${phone}`;
      const result = await calculateTrustScore(formattedPhone);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setTrustResult(result);
      const level = getRiskLevel(result.score);
      setRiskLevel(level);

      await new Promise(r => setTimeout(r, 1000));

      if (level === 'LOW') {
        await finalizeLogin(result.merchantId);
      } else if (level === 'MEDIUM') {
        prepareSocialChallenge(result);
        setStep('social_check');
      } else {
        await finalizeLogin(result.merchantId);
      }
    } catch (err) {
      setIsTimeout(true);
    }
  }, [phone, calculateTrustScore]);

  // Préparer la question sociale
  const prepareSocialChallenge = (result: any) => {
    const questions = [
      {
        question: 'Quel est ton marché ?',
        options: [
          { label: 'Adjamé', icon: '🏪', value: 'adjame' },
          { label: 'Cocody', icon: '🛒', value: 'cocody' },
          { label: 'Yopougon', icon: '🏬', value: 'yopougon' },
          { label: 'Autre', icon: '📍', value: 'autre' },
        ],
        correctValue: 'adjame',
      },
      {
        question: 'Tu vends quoi ?',
        options: [
          { label: 'Banane', icon: '🍌', value: 'banane' },
          { label: 'Igname', icon: '🥔', value: 'igname' },
          { label: 'Tomate', icon: '🍅', value: 'tomate' },
          { label: 'Autre', icon: '🥬', value: 'autre' },
        ],
        correctValue: 'tomate',
      },
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setSocialQuestion(randomQuestion);

    if (voiceEnabled) {
      speak(randomQuestion.question, { priority: 'high' });
    }
  };

  // Valider la réponse sociale
  const handleSocialAnswer = async (value: string) => {
    setIsLoading(true);
    vibrate(50);
    
    // Pour le MVP, on accepte toutes les réponses
    await new Promise(r => setTimeout(r, 500));
    
    await finalizeLogin(trustResult?.merchantId);
  };

  // Helper: Récupérer la config selon userType
  const getLoginConfig = useCallback(() => {
    switch (userType) {
      case 'merchant': return merchantLoginConfig;
      case 'agent': return agentLoginConfig;
      case 'cooperative': return cooperativeLoginConfig;
      default: return merchantLoginConfig;
    }
  }, [userType]);

  // Helper: S'assurer que le profil marchand existe (simplifié pour éviter les problèmes de typage)
  const ensureMerchantProfile = async (userId: string, cleanPhone: string): Promise<string | null> => {
    // Vérifier si le merchant existe déjà pour cet user
    const { data: existing } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existing) return existing.id;
    
    // Vérifier si un merchant sans user_id existe avec ce téléphone
    const { data: unlinked } = await supabase
      .from('merchants')
      .select('id')
      .eq('phone', cleanPhone)
      .is('user_id', null)
      .maybeSingle();
    
    if (unlinked) {
      // Lier le merchant existant à cet utilisateur
      await supabase
        .from('merchants')
        .update({ user_id: userId })
        .eq('id', unlinked.id);
      return unlinked.id;
    }
    
    // Créer un nouveau merchant
    const { data: newMerchant } = await supabase
      .from('merchants')
      .insert({
        user_id: userId,
        full_name: `Marchand ${cleanPhone}`,
        phone: cleanPhone,
        cmu_number: `CMU-${Date.now()}`,
        activity_type: 'Détaillant',
        status: 'validated' as const
      })
      .select('id')
      .single();
    
    return newMerchant?.id ?? null;
  };

  // Helper: S'assurer que le profil coopérative existe
  const ensureCooperativeProfile = async (userId: string, cleanPhone: string): Promise<string | null> => {
    // Vérifier si la coopérative existe déjà pour cet user
    const { data: existing } = await supabase
      .from('cooperatives')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existing) return existing.id;
    
    // Vérifier si une coopérative sans user_id existe avec ce téléphone
    const { data: unlinked } = await supabase
      .from('cooperatives')
      .select('id')
      .eq('phone', cleanPhone)
      .is('user_id', null)
      .maybeSingle();
    
    if (unlinked) {
      // Lier la coopérative existante à cet utilisateur
      await supabase
        .from('cooperatives')
        .update({ user_id: userId })
        .eq('id', unlinked.id);
      return unlinked.id;
    }
    
    // Créer une nouvelle coopérative
    const { data: newCoop } = await supabase
      .from('cooperatives')
      .insert({
        user_id: userId,
        name: `Coopérative ${cleanPhone}`,
        code: `COOP-${Date.now()}`,
        phone: cleanPhone,
        region: 'À définir',
        commune: 'À définir'
      })
      .select('id')
      .single();
    
    return newCoop?.id ?? null;
  };

  // Helper: S'assurer que le profil agent existe
  const ensureAgentProfile = async (userId: string, cleanPhone: string): Promise<string | null> => {
    // Vérifier si l'agent existe déjà pour cet user
    const { data: existing } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existing) return existing.id;
    
    // Créer un nouvel agent
    const { data: newAgent } = await supabase
      .from('agents')
      .insert({
        user_id: userId,
        employee_id: `AGT-${Date.now()}`,
        organization: 'DGE',
        zone: 'À définir',
        is_active: true
      })
      .select('id')
      .single();
    
    return newAgent?.id ?? null;
  };

  // Finaliser la connexion avec création de session Supabase
  const finalizeLogin = async (existingMerchantId?: string) => {
    setStep('success');
    vibrate(100);
    setIsLoading(true);
    
    try {
      const config = getLoginConfig();
      const cleanPhone = phone.replace(/\s/g, '');
      const email = config.emailPattern(cleanPhone);
      const password = config.passwordPattern(cleanPhone);
      
      console.log(`[finalizeLogin] Attempting auth for ${email}`);
      
      // Essayer de se connecter d'abord
      let { error: signInError, data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      let userId: string | undefined;
      
      // Si l'utilisateur n'existe pas, le créer
      if (signInError?.message?.includes('Invalid login credentials')) {
        console.log('[finalizeLogin] User not found, creating...');
        
        const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { 
              full_name: `${config.role.charAt(0).toUpperCase() + config.role.slice(1)} ${cleanPhone}`,
              phone: cleanPhone
            }
          }
        });
        
        if (signUpError && !signUpError.message?.includes('already')) {
          throw signUpError;
        }
        
        userId = signUpData?.user?.id;
        
        // Se connecter après l'inscription
        if (userId) {
          const { error: retrySignIn, data: retryData } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (retrySignIn) {
            console.error('[finalizeLogin] Retry sign in failed:', retrySignIn);
            throw retrySignIn;
          }
          // Mettre à jour userId avec les données de la nouvelle session
          userId = retryData?.user?.id;
        }
      } else if (signInError) {
        throw signInError;
      } else {
        userId = signInData?.user?.id;
      }
      
      // Créer ou mettre à jour le profil selon le userType
      if (userId && userType === 'merchant') {
        // Utiliser la nouvelle fonction robuste claim_merchant_by_phone
        const { data: claimResult, error: claimError } = await supabase.rpc('claim_merchant_by_phone', { 
          p_phone: cleanPhone 
        });
        
        console.log('[finalizeLogin] claim_merchant_by_phone result:', claimResult);
        
        if (claimError) {
          console.error('[finalizeLogin] claim_merchant_by_phone error:', claimError);
          throw new Error('Erreur lors de la liaison du compte');
        }
        
        // Vérifier le résultat de la fonction
        const result = claimResult as { success: boolean; error?: string; message?: string; merchant_id?: string };
        
        if (!result.success) {
          if (result.error === 'phone_already_linked') {
            // Ce numéro est lié à un autre compte actif - déconnecter et afficher erreur
            await supabase.auth.signOut();
            toast.error(result.message || 'Ce numéro est déjà lié à un autre compte');
            if (voiceEnabled) speak('Ce numéro est déjà utilisé par un autre compte. Contacte un agent.', { priority: 'high' });
            setStep('phone');
            setIsLoading(false);
            return;
          } else if (result.error === 'merchant_not_found') {
            // Aucun marchand avec ce téléphone - proposer inscription rapide
            await supabase.auth.signOut();
            toast.info('Nouveau marchand ! Inscription rapide en cours...');
            if (voiceEnabled) speak('Tu n\'es pas encore inscrit. On va faire ça ensemble maintenant.', { priority: 'high' });
            setStep('register');
            setIsLoading(false);
            return;
          } else {
            throw new Error(result.message || 'Erreur de liaison du compte');
          }
        }
      } else if (userId && userType === 'agent') {
        // Créer ou lier le profil agent AVANT d'assigner le rôle
        await ensureAgentProfile(userId, cleanPhone);
        
        // Assigner le rôle agent
        try {
          await supabase.rpc('assign_agent_role', { p_user_id: userId });
        } catch (rpcError) {
          console.log('[finalizeLogin] Role may already exist:', rpcError);
        }
      } else if (userId && userType === 'cooperative') {
        // Créer ou lier le profil coopérative AVANT d'assigner le rôle
        await ensureCooperativeProfile(userId, cleanPhone);
        
        // Assigner le rôle coopérative
        try {
          await supabase.rpc('assign_cooperative_role', { p_user_id: userId });
        } catch (rpcError) {
          console.log('[finalizeLogin] Role may already exist:', rpcError);
        }
      }
      
      // Enregistrer le login réussi pour le trust score
      if (existingMerchantId) {
        await recordSuccessfulLogin(existingMerchantId);
      }
      
      toast.success('Connexion réussie !');
      if (voiceEnabled) speak('Bienvenue ! Tu es connecté.', { priority: 'high' });
      
      // Attendre que la session ET le rôle soient bien établis avant de naviguer
      const checkSession = async (): Promise<boolean> => {
        const { data } = await supabase.auth.getSession();
        return !!data.session;
      };
      
      const checkRoleReady = async (): Promise<boolean> => {
        if (!userId) return false;
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        return roles && roles.length > 0;
      };
      
      // Attendre jusqu'à 3 secondes que la session soit prête
      let sessionAttempts = 0;
      const maxAttempts = 6;
      while (sessionAttempts < maxAttempts) {
        const hasSession = await checkSession();
        if (hasSession) {
          console.log('[finalizeLogin] Session confirmed');
          break;
        }
        await new Promise(r => setTimeout(r, 500));
        sessionAttempts++;
      }
      
      // Attendre jusqu'à 3 secondes supplémentaires que le rôle soit prêt
      let roleAttempts = 0;
      while (roleAttempts < maxAttempts) {
        const hasRole = await checkRoleReady();
        if (hasRole) {
          console.log('[finalizeLogin] Role confirmed, navigating...');
          break;
        }
        await new Promise(r => setTimeout(r, 500));
        roleAttempts++;
      }
      
      // Invalider le cache du rôle pour forcer un rechargement frais
      localStorage.removeItem('ifn-user-role-cache');
      
      navigate(redirectPath);
      
    } catch (error: any) {
      console.error('[finalizeLogin] Error:', error);
      toast.error('Erreur de connexion. Réessaye.');
      if (voiceEnabled) speak('Erreur de connexion. Réessaye.', { priority: 'high' });
      setStep('phone');
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer la saisie OTP
  const handleOtpChange = (digit: string) => {
    if (otp.length >= 6) return;
    vibrate(30);
    const newOtp = otp + digit;
    setOtp(newOtp);
    setError(null);
    if (voiceEnabled) speakDigit(digit);
  };

  const handleOtpBackspace = () => {
    vibrate(20);
    setOtp(prev => prev.slice(0, -1));
    setError(null);
  };

  // Appel vocal pour recevoir l'OTP via Edge Function
  const handleVoiceCallOtp = async () => {
    vibrate(50);
    setIsLoading(true);
    toast.info('📞 Préparation de l\'appel vocal...');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-otp-callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            phone: `+225${phone}`,
            otp: devOtp,
            language: 'fr'
          }),
        }
      );

      const data = await response.json();

      if (data.audio) {
        // Lire l'audio généré par ElevenLabs
        const audioUrl = `data:audio/mpeg;base64,${data.audio}`;
        const audio = new Audio(audioUrl);
        audio.play();
        toast.success('🔊 Écoute ton code !');
      } else if (data.message) {
        // Fallback: utiliser TTS local
        speak(data.message, { priority: 'high' });
        toast.info('🔊 Le code va être lu...');
      } else {
        // Dernier fallback
        speak(`Ton code est ${devOtp?.split('').join(', ')}. Je répète : ${devOtp?.split('').join(', ')}`, { priority: 'high' });
      }
    } catch (error) {
      console.error('[handleVoiceCallOtp] Error:', error);
      // Fallback: lire le code directement avec TTS local
      speak(`Ton code est ${devOtp?.split('').join(', ')}. Je répète : ${devOtp?.split('').join(', ')}`, { priority: 'high' });
      toast.info('🔊 Écoute ton code');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset complet
  const handleReset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (otpAbortRef.current) {
      otpAbortRef.current.abort();
    }
    stop();
    stopListening();
    setStep('phone');
    setPhone('');
    setOtp('');
    setError(null);
    setDevOtp(null);
    setTrustResult(null);
    setSocialQuestion(null);
    setIsTimeout(false);
    setRiskLevel('LOW');
    setIsListeningMic(false);
  };

  // Appeler agent
  const handleCallAgent = () => {
    window.location.href = 'tel:+2251234';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (otpAbortRef.current) otpAbortRef.current.abort();
      stopListening();
    };
  }, [stopListening]);

  // Auto-submit OTP quand complet
  useEffect(() => {
    if (otp.length === 6 && step === 'otp' && !isLoading) {
      handleSubmitOtp();
    }
  }, [otp, step, isLoading, handleSubmitOtp]);

  // Couleurs par type
  const colors = {
    merchant: { bg: 'bg-gradient-to-br from-orange-500 to-amber-500', btn: 'text-amber-600' },
    agent: { bg: 'bg-gradient-to-br from-emerald-500 to-teal-500', btn: 'text-emerald-600' },
    cooperative: { bg: 'bg-gradient-to-br from-violet-500 to-purple-500', btn: 'text-violet-600' },
  }[userType];

  const labels = {
    merchant: 'Commerçant',
    agent: 'Agent',
    cooperative: 'Coopérative',
  }[userType];

  // Étape actuelle pour la barre de progression
  const getStepNumber = () => {
    if (step === 'phone' || step === 'phone_confirm') return 1;
    if (step === 'otp') return 2;
    return 3;
  };

  // Barre de progression 3 étapes
  const ProgressBar = () => (
    <div className="flex items-center justify-center gap-2 mb-4">
      {[
        { num: 1, label: '📱', title: 'Numéro' },
        { num: 2, label: '🔑', title: 'Code' },
        { num: 3, label: '✅', title: 'Connecté' },
      ].map((s, i) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all",
                getStepNumber() >= s.num
                  ? "bg-white text-amber-600"
                  : "bg-white/20 text-white/60"
              )}
            >
              {s.label}
            </div>
            <span className={cn(
              "text-[10px] mt-1",
              getStepNumber() >= s.num ? "text-white" : "text-white/60"
            )}>
              {s.title}
            </span>
          </div>
          {i < 2 && (
            <div className={cn(
              "w-8 h-1 rounded-full mb-4",
              getStepNumber() > s.num ? "bg-white" : "bg-white/20"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Clavier numérique inclusif avec haptic
  const NumPad = ({ onDigit, onBackspace, onClear, showClear = false }: { 
    onDigit: (d: string) => void;
    onBackspace: () => void;
    onClear?: () => void;
    showClear?: boolean;
  }) => (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
        <button
          key={digit}
          type="button"
          onClick={() => onDigit(digit)}
          className="h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white text-2xl font-bold transition-all active:scale-95 touch-manipulation"
        >
          {digit}
        </button>
      ))}
      {showClear && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="h-14 rounded-xl bg-red-500/30 hover:bg-red-500/50 text-white text-sm font-medium transition-all touch-manipulation"
        >
          Tout effacer
        </button>
      ) : (
        <button
          type="button"
          onClick={onBackspace}
          className="h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all touch-manipulation flex items-center justify-center"
        >
          <Delete className="w-6 h-6" />
        </button>
      )}
      <button
        type="button"
        onClick={() => onDigit('0')}
        className="h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white text-2xl font-bold transition-all active:scale-95 touch-manipulation"
      >
        0
      </button>
      <button
        type="button"
        onClick={onBackspace}
        className="h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all touch-manipulation flex items-center justify-center"
      >
        <Delete className="w-6 h-6" />
      </button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full max-w-sm mx-auto", className)}
    >
      <div className={cn("rounded-3xl p-6 shadow-xl", colors.bg)}>
        {/* Header: Badge + Voice + Progress */}
        <div className="flex items-center justify-between mb-2">
          <span 
            onClick={handleDebugTap}
            className="bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full cursor-pointer select-none"
          >
            Accès {labels} {debugMode && '🔧'}
          </span>
          <button
            onClick={toggleVoice}
            className={cn(
              "p-2 rounded-full transition-all",
              voiceEnabled ? "bg-white text-amber-600" : "bg-white/20 text-white"
            )}
            title={voiceEnabled ? "Désactiver la voix" : "Activer la voix"}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        <ProgressBar />

        <AnimatePresence mode="wait">
          {/* Étape 1 : Téléphone avec MICRO GÉANT */}
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Bandeau iframe - avertissement micro bloqué */}
              {isInIframe && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-500/90 text-white rounded-xl p-4 shadow-lg"
                >
                  <p className="text-sm font-medium text-center mb-3">
                    ⚠️ Le micro ne marche pas dans l'aperçu.<br />
                    <span className="text-xs opacity-90">Ouvre en plein écran pour parler.</span>
                  </p>
                  <Button
                    onClick={handleOpenFullscreen}
                    className="w-full bg-white text-amber-700 hover:bg-amber-50 font-bold"
                  >
                    🔗 Ouvrir en plein écran
                  </Button>
                </motion.div>
              )}
              
              {/* MICRO GÉANT - Centre d'attention */}
              <div className="flex flex-col items-center gap-4 py-2">
                {/* Zone micro avec anneau de progression et barres audio */}
                <div className="relative">
                  {/* Pulse d'appel à l'action quand inactif */}
                  {!(isListeningMic || isVoiceConnected || isVoiceConnecting) && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white/30"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  {/* Anneau de progression des chiffres */}
                  {(isListeningMic || isVoiceConnected) && (
                    <svg className="absolute inset-0 w-32 h-32 -m-4" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="6"
                      />
                      <motion.circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={339.3}
                        initial={{ strokeDashoffset: 339.3 }}
                        animate={{ strokeDashoffset: 339.3 - (339.3 * (extractedDigits.length / 10)) }}
                        transition={{ duration: 0.3 }}
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                  )}
                  
                  {/* Barres audio animées autour du micro */}
                  {(isListeningMic || isVoiceConnected) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {/* Barres à gauche */}
                      <div className="absolute left-[-30px] flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={`left-${i}`}
                            className="w-1.5 bg-white rounded-full"
                            animate={{
                              height: [8, 24, 12, 28, 8],
                            }}
                            transition={{
                              duration: 0.7,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                      {/* Barres à droite */}
                      <div className="absolute right-[-30px] flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={`right-${i}`}
                            className="w-1.5 bg-white rounded-full"
                            animate={{
                              height: [12, 28, 8, 24, 12],
                            }}
                            transition={{
                              duration: 0.7,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <motion.button
                    onClick={handleMicClick}
                    disabled={isVoiceConnecting}
                    className={cn(
                      "relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg",
                      isListeningMic || isVoiceConnected
                        ? "bg-red-500 ring-4 ring-red-400/50"
                        : "bg-white/20 hover:bg-white/30 hover:scale-105"
                    )}
                    whileTap={{ scale: 0.95 }}
                    animate={isListeningMic || isVoiceConnected ? { scale: [1, 1.05, 1] } : {}}
                    transition={isListeningMic || isVoiceConnected ? { duration: 1.5, repeat: Infinity } : {}}
                  >
                    {isVoiceConnecting ? (
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : isListeningMic || isVoiceConnected ? (
                      <MicOff className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </motion.button>
                </div>

                {/* Feedback audio temps réel - TRÈS VISIBLE */}
                {(isListeningMic || isVoiceConnected || voiceState !== 'idle') && (
                  <div className="flex flex-col items-center gap-2 w-full max-w-xs">
                    {/* Indicateur de niveau audio - barres */}
                    <AudioLevelIndicator
                      level={audioLevel}
                      levelHistory={levelHistory}
                      isReceivingAudio={isReceivingAudio}
                      size="lg"
                      barCount={7}
                    />
                    
                    {/* Message contextuel (Je t'écoute / Je n'entends rien...) */}
                    <AudioFeedbackBanner
                      state={voiceState}
                      audioStatus={audioStatus}
                      silenceDuration={silenceDuration}
                      errorMessage={voiceError ?? scribeError}
                      onRetry={handleMicClick}
                    />
                    
                    {/* Panneau debug (triple tap sur le badge pour activer) */}
                    {debugMode && (
                      <MicDebugPanel
                        audioLevel={audioLevel}
                        isReceivingAudio={isReceivingAudio}
                        audioStatus={audioStatus}
                        silenceDuration={silenceDuration}
                        state={voiceState}
                        isConnected={isVoiceConnected}
                        isConnecting={isVoiceConnecting}
                        transcript={transcript}
                        extractedDigits={extractedDigits}
                        scribeStatus={scribeStatus}
                        scribeError={scribeError}
                      />
                    )}
                  </div>
                )}
                
                {/* État textuel quand pas en écoute */}
                {!(isListeningMic || isVoiceConnected) && (
                  <p className="text-white text-sm font-medium">
                    {isVoiceConnecting
                      ? '⏳ Connexion...'
                      : '👆 Appuie et parle'}
                  </p>
                )}

                {/* AFFICHAGE CHIFFRES DÉTECTÉS - TRÈS VISIBLE */}
                {(isListeningMic || isVoiceConnected) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-xs"
                  >
                    <div className="bg-white rounded-2xl px-5 py-4 shadow-lg">
                      {/* Chiffres détectés */}
                      <div className="flex justify-center items-center gap-1 min-h-[48px]">
                        {[...Array(10)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={cn(
                              "w-6 h-12 rounded-lg flex items-center justify-center text-xl font-bold",
                              extractedDigits[i] 
                                ? "bg-emerald-500 text-white" 
                                : "bg-gray-100 text-gray-300"
                            )}
                            initial={extractedDigits[i] ? { scale: 0 } : {}}
                            animate={extractedDigits[i] ? { scale: 1 } : {}}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            {extractedDigits[i] || '–'}
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Barre de progression */}
                      <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-emerald-500 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${(extractedDigits.length / 10) * 100}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                      
                      {/* Compteur */}
                      <p className="text-center text-sm text-gray-500 mt-2">
                        {extractedDigits.length === 0 
                          ? 'Dis ton numéro... "zéro sept..."' 
                          : extractedDigits.length < 10 
                            ? `${extractedDigits.length}/10 chiffres - continue !`
                            : '✓ Numéro complet !'}
                      </p>
                    </div>
                    
                    {/* Transcript brut pour debug */}
                    {transcript && (
                      <p className="text-white/50 text-xs text-center mt-2 italic">
                        "{transcript}"
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Instructions quand pas en écoute */}
                {!(isListeningMic || isVoiceConnected) && (
                  <p className="text-white/70 text-xs text-center max-w-xs">
                    Ou utilise le clavier ci-dessous
                  </p>
                )}
              </div>

              {/* Séparateur */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/60 text-xs">ou tape ton numéro</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Affichage numéro avec progression visuelle TOUJOURS VISIBLE */}
              <div className="bg-white/95 rounded-2xl p-4">
                {/* Grille de chiffres animée */}
                <div className="flex justify-center items-center gap-1 mb-3">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "w-7 h-11 rounded-lg flex items-center justify-center text-lg font-bold transition-all",
                        phone[i] 
                          ? "bg-emerald-500 text-white shadow-md" 
                          : "bg-gray-100 text-gray-300"
                      )}
                      initial={phone[i] ? { scale: 0.5, opacity: 0 } : {}}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {phone[i] || '–'}
                    </motion.div>
                  ))}
                </div>
                
                {/* Barre de progression */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className={cn(
                      "h-full rounded-full transition-colors",
                      phone.length === 10 ? "bg-emerald-500" : "bg-orange-400"
                    )}
                    initial={{ width: '0%' }}
                    animate={{ width: `${(phone.length / 10) * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                
                {/* Compteur */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-xs font-medium",
                    phone.length === 10 ? "text-emerald-600" : "text-gray-500"
                  )}>
                    {phone.length}/10 chiffres
                  </span>
                  {phone.length > 0 && voiceEnabled && (
                    <button
                      onClick={repeatPhone}
                      className="text-xs text-amber-600 font-medium flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" /> Répéter
                    </button>
                  )}
                </div>
              </div>

              <NumPad 
                onDigit={handlePhoneChange}
                onBackspace={handlePhoneBackspace}
                onClear={handlePhoneClear}
                showClear={phone.length > 0}
              />

              {error && (
                <p className="text-center text-white bg-red-500/30 rounded-lg py-2 text-sm">
                  {error}
                </p>
              )}

              <Button
                onClick={handleSubmitPhone}
                disabled={phone.length !== 10 || isLoading}
                className={cn("w-full h-12 bg-white hover:bg-white/90 font-bold rounded-xl", colors.btn)}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Recevoir le code
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Étape 1b : Confirmation du numéro dicté */}
          {step === 'phone_confirm' && (
            <motion.div
              key="phone_confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 py-4"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">J'ai entendu :</h2>
              </div>

              {/* Affichage gros numéro */}
              <div className="bg-white rounded-2xl p-6">
                <p className="text-3xl font-mono font-bold tracking-widest text-center text-gray-800">
                  {formatPhoneDisplay(phone)}
                </p>
              </div>

              {/* Boutons de confirmation */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleRejectPhone}
                  variant="outline"
                  className="h-14 bg-white/10 border-white/30 text-white hover:bg-white/20 font-bold"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Non, répéter
                </Button>
                <Button
                  onClick={handleConfirmPhone}
                  disabled={isLoading}
                  className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Oui, c'est bon
                    </>
                  )}
                </Button>
              </div>

              {/* Bouton écouter */}
              <Button
                onClick={repeatPhone}
                variant="ghost"
                className="w-full text-white hover:bg-white/10"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                🔊 Écouter le numéro
              </Button>
            </motion.div>
          )}

          {/* Étape 2 : OTP avec WebOTP */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">Code de vérification</h2>
                <p className="text-white/80 text-sm">
                  Envoyé au {formatPhoneDisplay(phone)}
                </p>
              </div>

              {/* Message rassurant WebOTP */}
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white/90 text-sm">
                  📩 Ne touche à rien, le code va se remplir tout seul
                </p>
              </div>

              <div className="bg-white/95 rounded-2xl p-4">
                {/* Input invisible pour WebOTP */}
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  className="sr-only"
                />
                
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{
                        scale: otp[i] ? [1, 1.15, 1] : 1,
                        borderColor: otp[i] ? '#f59e0b' : '#d1d5db',
                        backgroundColor: otp[i] ? '#fffbeb' : '#f9fafb',
                      }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-colors",
                        otp[i] ? "text-amber-600" : "text-gray-400",
                        !otp[i] && otp.length === i && "animate-pulse border-amber-300"
                      )}
                    >
                      {otp[i] || ''}
                    </motion.div>
                  ))}
                </div>
                {devOtp && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    [DEV] Code: {devOtp}
                  </p>
                )}
              </div>

              <NumPad 
                onDigit={handleOtpChange}
                onBackspace={handleOtpBackspace}
              />

              {error && (
                <p className="text-center text-white bg-red-500/30 rounded-lg py-2 text-sm">
                  {error}
                </p>
              )}

              {/* Fallback : Appel vocal */}
              <div className="border-t border-white/20 pt-4 mt-2">
                <p className="text-white/60 text-xs text-center mb-2">
                  Tu ne reçois pas le SMS ?
                </p>
                <Button
                  onClick={handleVoiceCallOtp}
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  📞 Appelle-moi pour me dire le code
                </Button>
              </div>

              <Button
                onClick={handleReset}
                variant="ghost"
                className="w-full text-white hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Changer de numéro
              </Button>
            </motion.div>
          )}

          {/* Étape 2.5 : Vérification en cours (Risk Gate) */}
          {step === 'verifying' && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 py-8"
            >
              {!isTimeout ? (
                <>
                  <div className="flex justify-center">
                    <motion.div 
                      className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ShieldCheck className="w-10 h-10 text-white" />
                    </motion.div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Vérification...</h2>
                    <p className="text-white/80 text-sm mt-1">
                      On vérifie que c'est bien toi
                    </p>
                  </div>
                  <Loader2 className="w-6 h-6 animate-spin text-white mx-auto" />
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-amber-500/30 flex items-center justify-center">
                      <AlertTriangle className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Réseau lent</h2>
                    <p className="text-white/80 text-sm mt-1">
                      La connexion est difficile
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleRetryVerification}
                      className="flex-1 bg-white text-amber-600 hover:bg-white/90"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Réessayer
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="flex-1 border-white/50 text-white hover:bg-white/10"
                    >
                      Annuler
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Étape 2.5b : Social Check (Risk Gate Orange) */}
          {step === 'social_check' && socialQuestion && (
            <motion.div
              key="social"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <SocialChallenge
                question={socialQuestion.question}
                options={socialQuestion.options}
                onAnswer={handleSocialAnswer}
                isLoading={isLoading}
                voiceEnabled={voiceEnabled}
              />
            </motion.div>
          )}

          {/* Étape bloquée (Risk Gate Rouge) */}
          {step === 'blocked' && (
            <motion.div
              key="blocked"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6 py-8"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-500/30 flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Assistance requise</h2>
                <p className="text-white/80 text-sm mt-1">
                  On a besoin de vérifier ton identité
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleCallAgent}
                  className="w-full bg-white text-red-600 hover:bg-white/90"
                >
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Appeler l'agent (1234)
                </Button>
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  className="w-full text-white hover:bg-white/10"
                >
                  Réessayer plus tard
                </Button>
              </div>
            </motion.div>
          )}

          {/* Étape Inscription rapide */}
          {step === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SimpleRegistrationForm
                phone={phone}
                voiceEnabled={voiceEnabled}
                onSuccess={() => {
                  // Retour à l'écran téléphone avec message
                  handleReset();
                  toast.success('Inscription enregistrée ! Un agent va te valider.');
                }}
                onCancel={handleReset}
              />
            </motion.div>
          )}

          {/* Étape 3 : Succès */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4 py-8"
            >
              <div className="flex justify-center">
                <motion.div 
                  className="w-20 h-20 rounded-full bg-white flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </motion.div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Bienvenue !</h2>
                <p className="text-white/80 text-sm">Connexion réussie</p>
                <p className="text-white/60 text-xs mt-2 flex items-center justify-center gap-1">
                  🟢 Vérifié
                </p>
              </div>
              <Loader2 className="w-6 h-6 animate-spin text-white mx-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
