import React, { useState, useCallback, useEffect } from 'react';
import { Mic, Loader2, Phone, ArrowRight, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocialAuth } from '../hooks/useSocialAuth';
import { useVoiceTranscription } from '../hooks/useVoiceTranscription';
import { useElevenLabsTts } from '../hooks/useElevenLabsTts';
import { AudioBars } from '@/components/merchant/AudioBars';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CulturalChallenge } from './CulturalChallenge';
import { HumanFallback } from './HumanFallback';
import { toast } from 'sonner';
import marcheIvoirien from '@/assets/marche-ivoirien.jpg';

interface VoiceSocialAuthProps {
  redirectPath: string;
  userType: 'merchant' | 'cooperative' | 'agent';
  onSuccess?: () => void;
  className?: string;
}

type MicState = 'idle' | 'listening' | 'processing';

/**
 * VoiceSocialAuth - Composant principal d'Authentification Sociale PNAVIM
 * 
 * Implémente le protocole à 4 couches :
 * Layer 1: Identification vocale ("C'est qui est là ?")
 * Layer 2: Vérification invisible (device + contexte) 
 * Layer 3: Challenge social (question culturelle)
 * Layer 4: Fallback humain (escalade vers agent)
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

  const {
    step,
    layer,
    phone,
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
  } = useSocialAuth({ redirectPath, userType });

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
      // Fallback gracieux vers saisie manuelle
      setShowManualInput(true);
    }
  });

  // Hook TTS ElevenLabs avec voix clonée du persona
  const { speak, isSpeaking, stop, isLoading: ttsLoading } = useElevenLabsTts({
    voiceId: currentPersona.voiceId!,
    onStart: () => {
      // Haptic feedback quand le TTS commence
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    },
    onError: (err) => {
      console.warn('[VoiceSocialAuth] TTS fallback:', err);
    }
  });

  // Auto-play welcome message avec voix clonée
  useEffect(() => {
    if (hasPlayedWelcome || step !== 'welcome') return;
    
    const timer = setTimeout(() => {
      speak(getMessage('welcome'));
      setHasPlayedWelcome(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [speak, hasPlayedWelcome, step, getMessage]);

  // Haptic feedback
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
      // Démarrer l'écoute
      try {
        setMicState('listening');
        speak(getMessage('listen'));
        await startListening();
      } catch (err) {
        console.error('[VoiceSocialAuth] Failed to start listening:', err);
        setMicState('idle');
        setShowManualInput(true);
        toast.error('Micro non disponible, utilise le clavier');
      }
    } else if (isConnected) {
      // Arrêter l'écoute
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

  const getMicButtonClass = () => {
    return cn(
      'mic-button-xl',
      micState === 'listening' && 'is-listening',
      micState === 'processing' && 'is-processing',
      isLoading && 'opacity-50 cursor-not-allowed'
    );
  };

  const getStatusLabel = () => {
    if (isLoading) return 'Vérification en cours...';
    if (micState === 'idle') return 'Appuie et parle';
    if (micState === 'listening') return "Je t'écoute...";
    return 'Un instant...';
  };

  // Render based on current step
  if (step === 'challenge') {
    // Get the question text - handle both string and object formats
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

  if (step === 'success' && generatedOtp) {
    return (
      <div className="flex flex-col items-center gap-5 py-4">
        {/* Avatar avec animation de succès */}
        <div className="relative">
          <div className="merchant-avatar-lg border-4 border-secondary">
            <img 
              src={marcheIvoirien} 
              alt="Marché ivoirien"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-secondary rounded-full border-2 border-white flex items-center justify-center">
            ✓
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">
            {merchantName ? `Bienvenue ${merchantName} !` : 'Bienvenue !'}
          </p>
          <p className="text-sm text-muted-foreground">
            Code envoyé au {phone}
          </p>
          <p className="text-xs text-muted-foreground">
            (Mode dev: {generatedOtp})
          </p>
        </div>

        {/* OTP Input */}
        <OtpVerification 
          onVerify={verifyAndLogin} 
          isLoading={isLoading}
          expectedOtp={generatedOtp}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-5 py-4", className)}>
      {/* Avatar Persona */}
      <div className="relative">
        <div className="merchant-avatar-lg">
          <img 
            src={marcheIvoirien} 
            alt="Marché ivoirien"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Status indicator */}
        <div className={cn(
          "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white",
          isLoading ? "bg-amber-500 animate-pulse" : "bg-secondary animate-pulse"
        )} />
      </div>

      {/* Message persona */}
      <p className="text-center text-foreground font-medium text-lg max-w-xs">
        {getMessage('welcome')}
      </p>

      {!showManualInput ? (
        <>
          {/* GROS Bouton Micro */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading || isConnecting || ttsLoading}
            className={getMicButtonClass()}
            aria-label={micState === 'listening' ? 'Écoute en cours' : 'Appuyer pour parler'}
          >
            {micState === 'processing' || isLoading || isConnecting || ttsLoading ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : isConnected ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className={cn(
                "w-12 h-12 text-white transition-transform",
                micState === 'listening' && 'scale-110'
              )} />
            )}
          </button>

          {/* Audio bars */}
          <AudioBars isActive={micState === 'listening' || isConnected} />

          {/* Transcription temps réel */}
          {(micState === 'listening' || isConnected) && transcript && (
            <div className="bg-muted/50 rounded-lg p-3 text-center max-w-xs animate-in fade-in">
              <p className="text-xs text-muted-foreground mb-1">J'entends :</p>
              <p className="text-lg font-medium text-foreground">{transcript}</p>
            </div>
          )}

          {/* Status label */}
          <p className="text-center text-muted-foreground text-base font-medium">
            {ttsLoading ? 'Préparation audio...' : isConnecting ? 'Connexion au micro...' : getStatusLabel()}
          </p>

          {/* Voice error message */}
          {voiceError && (
            <p className="text-sm text-destructive text-center max-w-xs">
              {voiceError}
            </p>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-1.5 text-primary text-xs">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              {currentPersona.name} parle...
            </div>
          )}

          {/* Separator */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Manual input fallback */}
          <button
            type="button"
            onClick={() => setShowManualInput(true)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            📝 Je préfère taper mon numéro
          </button>
        </>
      ) : (
        <form onSubmit={handleManualSubmit} className="w-full max-w-xs space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="07 01 02 03 04"
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              className="pl-11 text-lg h-14"
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12"
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

          <button
            type="button"
            onClick={() => setShowManualInput(false)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour au mode vocal
          </button>
        </form>
      )}
    </div>
  );
}

// Composant OTP intégré
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
