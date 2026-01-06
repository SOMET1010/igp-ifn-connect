import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, Loader2, Phone, ArrowRight, Volume2, Keyboard, Users, VolumeX, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocialAuth } from '@/features/auth/hooks/useSocialAuth';
import { useVoiceTranscription } from '@/features/auth/hooks/useVoiceTranscription';
import { useTts } from '@/shared/hooks/useTts';
import { usePersistedPersona } from '@/features/auth/hooks/usePersistedPersona';
import { AudioBars } from '@/features/merchant/components/AudioBars';
import { Button } from '@/components/ui/button';
import { CulturalChallenge } from './CulturalChallenge';
import { HumanFallback } from './HumanFallback';
import { PersonaSelector } from './PersonaSelector';
import { PhoneNumPad, AuthErrorBanner, createAuthError } from '@/shared/ui';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface VoiceSocialAuthProps {
  redirectPath: string;
  userType: 'merchant' | 'cooperative' | 'agent';
  onSuccess?: () => void;
  className?: string;
}

type MicState = 'idle' | 'listening' | 'processing';

/**
 * VoiceSocialAuth - Composant principal d'Authentification Sociale PNAVIM
 * Design inspiré des maquettes avec style africain
 */
export function VoiceSocialAuth({ 
  redirectPath, 
  userType,
  onSuccess,
  className 
}: VoiceSocialAuthProps) {
  const [micState, setMicState] = useState<MicState>('idle');
  const [manualPhone, setManualPhone] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [authError, setAuthError] = useState<{ code: string; message: string; type: 'network' | 'microphone' | 'validation' | 'server' | 'timeout' | 'unknown' } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hook pour persister le choix de persona
  const { persona: persistedPersona, setPersona: setPersistedPersona, isLoaded, isFirstVisit } = usePersistedPersona();

  const {
    step,
    layer,
    phone,
    persona,
    isLoading,
    currentPersona,
    merchantName,
    challengeQuestion,
    error,
    processPhoneNumber,
    validateChallengeAnswer,
    verifyAndLogin,
    reset,
    getMessage,
    generatedOtp,
    setPersona,
  } = useSocialAuth({ redirectPath, userType, initialPersona: persistedPersona });

  // Afficher le sélecteur à la première visite
  useEffect(() => {
    if (isLoaded && isFirstVisit) {
      setShowPersonaSelector(true);
    }
  }, [isLoaded, isFirstVisit]);

  // Synchroniser le persona quand il change
  const handlePersonaChange = useCallback((newPersona: typeof persistedPersona) => {
    setPersistedPersona(newPersona);
    setPersona(newPersona);
    setShowPersonaSelector(false);
    setHasPlayedWelcome(false);
  }, [setPersistedPersona, setPersona]);

  // Hook de transcription vocale ElevenLabs
  const { 
    startListening, 
    stopListening, 
    isConnected, 
    isConnecting,
    transcript 
  } = useVoiceTranscription({
    onPhoneDetected: (detectedPhone) => {
      console.log('[VoiceSocialAuth] Phone detected:', detectedPhone);
      setMicState('processing');
      stopListening();
      processPhoneNumber(detectedPhone);
    },
    onError: (errorMsg) => {
      console.error('[VoiceSocialAuth] Voice error:', errorMsg);
      setVoiceError(errorMsg);
      setMicState('idle');
      setShowManualInput(true);
    }
  });

  // Hook TTS ElevenLabs avec voix clonée PNAVIM
  const { speak, isSpeaking, stop, isLoading: ttsLoading } = useTts({
    voiceId: currentPersona.voiceId as import('@/shared/config/voiceConfig').PnavimVoiceId,
    persona,
    onStart: () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    },
    onError: (err) => {
      console.warn('[VoiceSocialAuth] TTS fallback:', err);
    }
  });

  // Auto-play welcome message
  useEffect(() => {
    if (hasPlayedWelcome || step !== 'welcome') return;
    
    const timer = setTimeout(() => {
      speak(getMessage('welcome'), { messageKey: 'welcome' });
      setHasPlayedWelcome(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [speak, hasPlayedWelcome, step, getMessage]);

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleMicClick = useCallback(async () => {
    if (isLoading || isConnecting) return;
    
    triggerHaptic();
    stop();
    setVoiceError(null);

    if (micState === 'idle' && !isConnected) {
      try {
        setMicState('listening');
        speak(getMessage('listen'), { messageKey: 'listen' });
        await startListening();
      } catch (err) {
        console.error('[VoiceSocialAuth] Failed to start listening:', err);
        setMicState('idle');
        setShowManualInput(true);
        toast.error('Micro non disponible, utilise le clavier');
      }
    } else if (isConnected) {
      stopListening();
      setMicState('idle');
    }
  }, [isLoading, isConnecting, isConnected, micState, speak, stop, triggerHaptic, startListening, stopListening, getMessage]);

  const handleManualSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (manualPhone.length >= 10) {
      processPhoneNumber(manualPhone);
    }
  }, [manualPhone, processPhoneNumber]);

  const handlePlayWelcome = useCallback(() => {
    speak(getMessage('welcome'), { messageKey: 'welcome' });
  }, [speak, getMessage]);

  // Afficher le sélecteur de persona
  if (showPersonaSelector) {
    return (
      <div className={cn("flex flex-col items-center gap-5 py-4", className)}>
        <PersonaSelector
          selectedPersona={persistedPersona}
          onSelect={handlePersonaChange}
        />
        
        {!isFirstVisit && (
          <button
            type="button"
            onClick={() => setShowPersonaSelector(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Annuler
          </button>
        )}
      </div>
    );
  }

  // Render based on current step
  if (step === 'challenge') {
    const questionText = typeof challengeQuestion === 'string' 
      ? challengeQuestion 
      : challengeQuestion?.question_text || getMessage('challenge');
    
    return (
      <CulturalChallenge
        question={questionText}
        personaName={currentPersona.name}
        personaAvatar={currentPersona.avatar}
        voiceId={currentPersona.voiceId!}
        onAnswer={validateChallengeAnswer}
        onCancel={reset}
        isLoading={isLoading}
      />
    );
  }

  if (step === 'fallback') {
    return (
      <HumanFallback
        reason={error || 'Vérification impossible'}
        phone={phone || undefined}
        merchantName={merchantName || undefined}
        voiceId={currentPersona.voiceId!}
        personaName={currentPersona.name}
        onRetry={reset}
      />
    );
  }

  // Écran inscription nouvel utilisateur
  if (step === 'register') {
    return (
      <div className="flex flex-col items-center gap-5 py-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center shadow-xl">
            <Users className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-foreground">
            Nouveau numéro détecté
          </p>
          <p className="text-sm text-muted-foreground">
            Le numéro {phone} n'est pas encore enregistré.
          </p>
          <p className="text-sm text-muted-foreground">
            Contacte un agent PNAVIM pour t'inscrire.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button 
            onClick={reset}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer avec un autre numéro
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'success' && generatedOtp) {
    return (
      <div className="flex flex-col items-center gap-5 py-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl">
            <span className="text-4xl">✓</span>
          </div>
        </motion.div>

        <div className="text-center space-y-2">
          <p className="text-lg font-bold text-foreground">
            {merchantName ? `Bienvenue ${merchantName} !` : 'Bienvenue !'}
          </p>
          <p className="text-sm text-muted-foreground">
            Code envoyé au {phone}
          </p>
          <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Mode dev: {generatedOtp}
          </p>
        </div>

        <OtpVerification 
          onVerify={verifyAndLogin} 
          isLoading={isLoading}
          expectedOtp={generatedOtp}
        />
      </div>
    );
  }

  // Couleurs dynamiques par rôle
  const roleColors: Record<typeof userType, { from: string; to: string; text: string }> = {
    merchant: { from: 'from-orange-500', to: 'to-amber-500', text: 'text-orange-600' },
    agent: { from: 'from-emerald-600', to: 'to-teal-500', text: 'text-emerald-600' },
    cooperative: { from: 'from-violet-600', to: 'to-purple-500', text: 'text-violet-600' },
  };
  
  const colors = roleColors[userType];

  // Main auth view - PNAVIM Style
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center gap-4", className)}
    >
      {/* Card principale avec style PNAVIM - couleur dynamique par rôle */}
      <div className={cn("w-full max-w-sm bg-gradient-to-br rounded-3xl p-6 shadow-xl", colors.from, colors.to)}>
        {/* Badge type d'accès */}
        <div className="flex justify-center mb-4">
          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full">
            Accès {userType === 'agent' ? 'Agent' : userType === 'cooperative' ? 'Coopérative' : 'Commerçant'}
          </span>
        </div>

        {/* Avatar avec badge nom - taille HERO 128px */}
        <div className="flex flex-col items-center mb-4">
          <motion.div 
            className="relative"
            animate={{ scale: isSpeaking ? 1.05 : 1 }}
            transition={{ repeat: isSpeaking ? Infinity : 0, duration: 0.5 }}
          >
            <div className="w-32 h-32 rounded-full bg-white p-1.5 shadow-lg">
              <img
                src={currentPersona.avatar}
                alt={currentPersona.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentPersona.name)}&background=fff&color=f97316&size=128&bold=true`;
                }}
              />
            </div>
            {/* Indicateur d'état */}
            <div className={cn(
              "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white flex items-center justify-center",
              isSpeaking ? "bg-emerald-400" : "bg-emerald-500"
            )}>
              {isSpeaking && <Volume2 className="w-3 h-3 text-white animate-pulse" />}
            </div>
          </motion.div>

          {/* Badge nom */}
          <div className="bg-white px-5 py-1.5 rounded-full shadow-md -mt-3 z-10">
            <span className="font-bold text-gray-800 text-sm">
              {currentPersona.name}
            </span>
          </div>
        </div>

        {/* Bulle de message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step + (transcript || 'welcome')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/95 rounded-2xl p-4 mb-4 shadow-inner"
          >
            <p className="text-center text-gray-800 font-medium">
              {micState === 'listening' && transcript 
                ? `J'entends : "${transcript}"` 
                : getMessage('welcome')}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Boutons d'action */}
        {!showManualInput ? (
          <div className="space-y-3">
            {/* Bouton écouter/STOP */}
            {isSpeaking ? (
              <motion.button
                onClick={stop}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                <VolumeX className="w-5 h-5" />
                Arrêter la voix
              </motion.button>
            ) : (
              <motion.button
                onClick={handlePlayWelcome}
                disabled={ttsLoading}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all",
                  ttsLoading && "opacity-50"
                )}
              >
                <Volume2 className="w-5 h-5" />
                Cliquez pour écouter
              </motion.button>
            )}

            {/* Bouton micro principal */}
            <motion.button
              onClick={handleMicClick}
              disabled={isLoading || isConnecting || ttsLoading || isSpeaking}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-full flex items-center justify-center gap-3 bg-white text-amber-600 font-bold py-4 px-6 rounded-xl shadow-lg transition-all",
                (isLoading || isConnecting || isSpeaking) && "opacity-50",
                isConnected && "bg-red-500 text-white"
              )}
            >
              {isLoading || isConnecting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Mic className={cn("w-6 h-6", micState === 'listening' && "animate-pulse")} />
              )}
              {isConnected ? 'Arrêter' : 'Parler mon numéro'}
            </motion.button>

            {/* Audio visualization */}
            {(micState === 'listening' || isConnected) && (
              <div className="flex justify-center">
                <AudioBars isActive={true} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Clavier numérique amélioré */}
            <PhoneNumPad
              value={manualPhone}
              onChange={setManualPhone}
              onComplete={(phone) => {
                processPhoneNumber(phone);
              }}
              disabled={isLoading}
            />
            
            <Button 
              type="button"
              onClick={() => {
                if (manualPhone.length >= 10) {
                  processPhoneNumber(manualPhone);
                }
              }}
              className="w-full h-12 bg-white text-amber-600 hover:bg-white/90 font-bold rounded-xl"
              disabled={manualPhone.length < 10 || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continuer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Erreur structurée avec recovery */}
        {authError && (
          <AuthErrorBanner
            code={authError.code}
            message={authError.message}
            type={authError.type}
            onRetry={() => {
              setAuthError(null);
              setVoiceError(null);
            }}
            onSwitchToKeyboard={() => {
              setAuthError(null);
              setVoiceError(null);
              setShowManualInput(true);
            }}
            className="mt-3"
          />
        )}

        {/* Error message simple (legacy) */}
        {voiceError && !authError && (
          <p className="text-sm text-white/90 text-center mt-3 bg-red-500/30 rounded-lg p-2">
            {voiceError}
          </p>
        )}
      </div>

      {/* Actions secondaires sous la carte */}
      <div className="flex flex-col items-center gap-2 w-full max-w-sm">
        {!showManualInput ? (
          <button
            type="button"
            onClick={() => setShowManualInput(true)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Keyboard className="w-4 h-4" />
            Mode clavier
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowManualInput(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour au mode vocal
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowPersonaSelector(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          Changer de guide
        </button>
      </div>
    </motion.div>
  );
}

// Composant OTP
function OtpVerification({ 
  onVerify, 
  isLoading,
  expectedOtp 
}: { 
  onVerify: (otp: string) => Promise<boolean>;
  isLoading: boolean;
  expectedOtp?: string;
}) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    const success = await onVerify(otp);
    if (!success) {
      setError('Code incorrect');
      setOtp('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        placeholder="• • • • • •"
        value={otp}
        onChange={(e) => {
          setOtp(e.target.value.replace(/\D/g, ''));
          setError('');
        }}
        className="text-center text-2xl tracking-[0.5em] h-14"
        autoFocus
      />
      
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
      
      <Button 
        type="submit" 
        className="w-full h-12"
        disabled={otp.length !== 6 || isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Valider'
        )}
      </Button>
    </form>
  );
}

export default VoiceSocialAuth;
