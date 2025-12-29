import React, { useEffect, useCallback, useState } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceAuthLang } from '@/features/voice-auth/config/audioScripts';
import { useSpeechTts } from '@/features/voice-auth/hooks/useSpeechTts';
import marcheIvoirien from '@/assets/marche-ivoirien.jpg';

type MicState = 'idle' | 'listening' | 'processing';

interface VoiceModeCardProps {
  lang: VoiceAuthLang;
  onPhoneDetected: (phone: string) => void;
  onFallbackClick: () => void;
  disabled?: boolean;
}

/**
 * VoiceModeCard - Composant COEUR de l'expérience inclusive
 * Mode VOCAL par défaut avec illustration marchande ivoirienne
 */
export function VoiceModeCard({
  lang,
  onPhoneDetected,
  onFallbackClick,
  disabled = false,
}: VoiceModeCardProps) {
  const [micState, setMicState] = useState<MicState>('idle');
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  const { speak, isSpeaking, stop } = useSpeechTts({ 
    lang,
    onEnd: () => {
      if (micState === 'listening') {
        // Could start actual speech recognition here
      }
    }
  });

  // Auto-play welcome message on mount (800ms delay)
  useEffect(() => {
    if (hasPlayedWelcome) return;
    
    const timer = setTimeout(() => {
      speak('welcome');
      setHasPlayedWelcome(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [speak, hasPlayedWelcome]);

  // Haptic feedback
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleMicClick = useCallback(() => {
    if (disabled) return;
    
    triggerHaptic();
    stop();

    if (micState === 'idle') {
      setMicState('listening');
      speak('listen');
      
      // Simulate phone detection after 3 seconds (demo)
      // In production, this would use actual speech recognition
      setTimeout(() => {
        setMicState('processing');
        speak('wait');
        
        // Simulate successful detection
        setTimeout(() => {
          setMicState('idle');
          // Demo: simulate detected phone number
          onPhoneDetected('0701020304');
        }, 2000);
      }, 3000);
    } else {
      setMicState('idle');
    }
  }, [disabled, micState, speak, stop, triggerHaptic, onPhoneDetected]);

  const getMicButtonClass = () => {
    return cn(
      'mic-button-xl',
      micState === 'listening' && 'is-listening',
      micState === 'processing' && 'is-processing',
      disabled && 'opacity-50 cursor-not-allowed'
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Illustration marchande circulaire */}
      <div className="relative">
        <div className="merchant-avatar">
          <img 
            src={marcheIvoirien} 
            alt="Marché ivoirien"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Point vert "En ligne" */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full border-2 border-white animate-pulse" />
      </div>

      {/* GROS Bouton Micro */}
      <button
        type="button"
        onClick={handleMicClick}
        disabled={disabled}
        className={getMicButtonClass()}
        aria-label={micState === 'listening' ? 'Écoute en cours' : 'Appuyer pour parler'}
      >
        {micState === 'processing' ? (
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        ) : (
          <Mic className={cn(
            "w-10 h-10 text-white transition-transform",
            micState === 'listening' && 'scale-110'
          )} />
        )}
      </button>

      {/* Label sous le micro */}
      <p className="text-center text-muted-foreground text-sm font-medium">
        {micState === 'idle' && (lang === 'nouchi' ? 'Appuie et parle' : 'Appuyez et parlez')}
        {micState === 'listening' && (lang === 'nouchi' ? "On t'écoute..." : 'Je vous écoute...')}
        {micState === 'processing' && (lang === 'nouchi' ? 'Attends un peu...' : 'Un instant...')}
      </p>

      {/* Indicateur audio actif */}
      {isSpeaking && (
        <div className="flex items-center gap-1.5 text-primary text-xs">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          {lang === 'nouchi' ? 'La machine parle...' : 'Audio en cours...'}
        </div>
      )}

      {/* Séparateur */}
      <div className="flex items-center gap-3 w-full max-w-xs">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wide">ou</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Fallback classique */}
      <button
        type="button"
        onClick={onFallbackClick}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
      >
        {lang === 'nouchi' 
          ? '📝 Je préfère écrire mon numéro' 
          : '📝 Je préfère saisir mon numéro'
        }
      </button>
    </div>
  );
}

export default VoiceModeCard;
