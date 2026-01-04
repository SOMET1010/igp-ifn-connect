import React, { useState, useCallback, useEffect } from 'react';
import { Loader2, ArrowRight, Phone, RotateCcw, CheckCircle2, Volume2, VolumeX, Delete } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTrustScore } from '@/features/auth/hooks/useTrustScore';
import { useVoiceQueue } from '@/shared/hooks/useVoiceQueue';
import { SocialChallenge } from './SocialChallenge';

interface InclusivePhoneAuthProps {
  redirectPath: string;
  userType: 'merchant' | 'cooperative' | 'agent';
  className?: string;
}

type Step = 'phone' | 'otp' | 'social_check' | 'success';

/**
 * InclusivePhoneAuth - Authentification inclusive PNAVIM
 * 
 * Flow linéaire visible : Téléphone → OTP → Connecté
 * Rails sociaux invisibles : Risk Gate après OTP (si doute)
 * 
 * Inclusion :
 * - Voix guidée par chiffres (optionnelle)
 * - Clavier contrôlé 10 chiffres
 * - Boutons Répéter/Corriger
 * - Zéro superposition audio
 */
export function InclusivePhoneAuth({ 
  redirectPath, 
  userType,
  className 
}: InclusivePhoneAuthProps) {
  const navigate = useNavigate();
  const { calculateTrustScore, recordSuccessfulLogin } = useTrustScore();
  const { speak, stop, isSpeaking } = useVoiceQueue();
  
  // État principal
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  
  // Assistance vocale
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  // Risk Gate social
  const [trustResult, setTrustResult] = useState<any>(null);
  const [socialQuestion, setSocialQuestion] = useState<{
    question: string;
    options: Array<{ label: string; icon: string; value: string }>;
    correctValue: string;
  } | null>(null);

  // Format visuel du téléphone : "07 01 02 03 04"
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
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

  // Gérer la saisie téléphone
  const handlePhoneChange = (digit: string) => {
    if (phone.length >= 10) return;
    setPhone(prev => prev + digit);
    setError(null);
    speakDigit(digit);
  };

  const handlePhoneBackspace = () => {
    if (phone.length > 0) {
      setPhone(prev => prev.slice(0, -1));
      setError(null);
      if (voiceEnabled) speak('Effacé', { priority: 'normal' });
    }
  };

  const handlePhoneClear = () => {
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
      speak('Assistance vocale activée. Tape ton numéro chiffre par chiffre.', { priority: 'high' });
    }
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

  // Étape 2 : Vérifier l'OTP + Risk Gate
  const handleSubmitOtp = useCallback(async () => {
    if (otp.length !== 6) {
      setError('Le code doit avoir 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Vérifier OTP
      if (!devOtp || otp !== devOtp) {
        setError('Code incorrect');
        if (voiceEnabled) speak('Code incorrect. Réessaye.', { priority: 'high' });
        setIsLoading(false);
        return;
      }

      // ✅ OTP valide - maintenant Risk Gate silencieux
      const formattedPhone = `+225${phone}`;
      const result = await calculateTrustScore(formattedPhone);
      setTrustResult(result);

      // Décision basée sur le score
      if (result.decision === 'direct_access' || result.score >= 60) {
        // 🟢 Accès direct - contexte normal
        await finalizeLogin(result.merchantId);
      } else if (result.decision === 'challenge' || result.score >= 30) {
        // 🟡 Risque moyen - 1 question sociale simple
        prepareSocialChallenge(result);
        setStep('social_check');
      } else {
        // 🔴 Risque élevé ou nouveau - mais on laisse passer pour MVP
        // En prod : rediriger vers validation agent
        await finalizeLogin(result.merchantId);
      }
      
    } catch (err) {
      console.error('Erreur vérification:', err);
      setError('Erreur de vérification');
    } finally {
      setIsLoading(false);
    }
  }, [otp, devOtp, phone, calculateTrustScore, voiceEnabled, speak]);

  // Préparer la question sociale
  const prepareSocialChallenge = (result: any) => {
    // Questions simples avec pictogrammes
    const questions = [
      {
        question: 'Quel est ton marché ?',
        options: [
          { label: 'Adjamé', icon: '🏪', value: 'adjame' },
          { label: 'Cocody', icon: '🛒', value: 'cocody' },
          { label: 'Yopougon', icon: '🏬', value: 'yopougon' },
          { label: 'Autre', icon: '📍', value: 'autre' },
        ],
        correctValue: 'adjame', // En prod : récupérer du profil
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
    
    // Choisir une question au hasard
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    setSocialQuestion(randomQuestion);

    if (voiceEnabled) {
      speak(randomQuestion.question, { priority: 'high' });
    }
  };

  // Valider la réponse sociale
  const handleSocialAnswer = async (value: string) => {
    setIsLoading(true);
    
    // Pour le MVP, on accepte toutes les réponses
    // En prod : vérifier contre le profil marchand
    await new Promise(r => setTimeout(r, 500));
    
    await finalizeLogin(trustResult?.merchantId);
  };

  // Finaliser la connexion
  const finalizeLogin = async (merchantId?: string) => {
    setStep('success');
    
    if (merchantId) {
      await recordSuccessfulLogin(merchantId);
    }
    
    toast.success('Connexion réussie !');
    if (voiceEnabled) speak('Bienvenue ! Tu es connecté.', { priority: 'high' });
    
    setTimeout(() => {
      navigate(redirectPath);
    }, 1500);
  };

  // Gérer la saisie OTP
  const handleOtpChange = (digit: string) => {
    if (otp.length >= 6) return;
    const newOtp = otp + digit;
    setOtp(newOtp);
    setError(null);
    if (voiceEnabled) speakDigit(digit);
    
    // Auto-submit quand 6 chiffres
    if (newOtp.length === 6) {
      setTimeout(() => {
        setOtp(newOtp);
        handleSubmitOtp();
      }, 300);
    }
  };

  const handleOtpBackspace = () => {
    setOtp(prev => prev.slice(0, -1));
    setError(null);
  };

  // Reset complet
  const handleReset = () => {
    stop();
    setStep('phone');
    setPhone('');
    setOtp('');
    setError(null);
    setDevOtp(null);
    setTrustResult(null);
    setSocialQuestion(null);
  };

  // Auto-submit OTP quand complet
  useEffect(() => {
    if (otp.length === 6 && step === 'otp' && !isLoading) {
      handleSubmitOtp();
    }
  }, [otp, step, isLoading]);

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

  // Clavier numérique inclusif
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
        {/* Badge type + Voice toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="bg-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
            Accès {labels}
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

        <AnimatePresence mode="wait">
          {/* Étape 1 : Téléphone */}
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-white">Ton numéro</h2>
                <p className="text-white/80 text-sm">Entre ton numéro de téléphone</p>
              </div>

              {/* Affichage numéro */}
              <div className="bg-white/95 rounded-2xl p-4">
                <p className="text-2xl font-mono font-bold text-gray-800 tracking-wider text-center min-h-[2rem]">
                  {formatPhoneDisplay(phone) || '__ __ __ __ __'}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{phone.length}/10 chiffres</span>
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

          {/* Étape 2 : OTP */}
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

              <div className="bg-white/95 rounded-2xl p-4">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={cn(
                        "w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold",
                        otp[i] ? "border-amber-500 bg-amber-50 text-amber-600" : "border-gray-300 bg-gray-50"
                      )}
                    >
                      {otp[i] || ''}
                    </div>
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

          {/* Étape 2.5 : Social Check (Risk Gate) */}
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

          {/* Étape 3 : Succès */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4 py-8"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Bienvenue !</h2>
                <p className="text-white/80 text-sm">Connexion réussie</p>
              </div>
              <Loader2 className="w-6 h-6 animate-spin text-white mx-auto" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
