import React, { useEffect, useCallback, useState } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceAuthLang } from '@/shared/config/audio/suta';
import { useTts } from '@/shared/hooks/useTts';
import { AudioBars } from './AudioBars';
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

  const { speakScript, isSpeaking, stop } = useTts({ 
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
      speakScript('welcome');
      setHasPlayedWelcome(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [speakScript, hasPlayedWelcome]);

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
      speakScript('listen');
      
      // Simulate phone detection after 3 seconds (demo)
      // In production, this would use actual speech recognition
      setTimeout(() => {
        setMicState('processing');
        speakScript('wait');
        
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
  }, [disabled, micState, speakScript, stop, triggerHaptic, onPhoneDetected]);

  const getMicButtonClass = () => {
    return cn(
      'mic-button-xl',
      micState === 'listening' && 'is-listening',
      micState === 'processing' && 'is-processing',
      disabled && 'opacity-50 cursor-not-allowed'
    );
  };

  // Labels selon la langue
  const getLabel = () => {
    if (micState === 'idle') {
      return lang === 'nouchi' ? 'Appuie et parle' : 'Appuie et parle';
    }
    if (micState === 'listening') {
      return lang === 'nouchi' ? "On t'écoute..." : 'Je vous écoute...';
    }
    return lang === 'nouchi' ? 'Attends un peu...' : 'Un instant...';
  };

  const getFallbackText = () => {
    if (lang === 'nouchi') return '📝 Je préfère écrire mon numéro';
    if (lang === 'suta') return '📝 Écrire mon numéro';
    return '📝 Je préfère saisir mon numéro';
  };

  const getSpeakingText = () => {
    if (lang === 'nouchi') return 'La machine parle...';
    return 'Audio en cours...';
  };

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {/* Illustration marchande circulaire - AGRANDIE */}
      <div className="relative">
        <div className="merchant-avatar-lg">
          <img 
            src={marcheIvoirien} 
            alt="Marché ivoirien"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Point vert "En ligne" */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary rounded-full border-2 border-white animate-pulse" />
      </div>

      {/* GROS Bouton Micro - AGRANDI */}
      <button
        type="button"
        onClick={handleMicClick}
        disabled={disabled}
        className={getMicButtonClass()}
        aria-label={micState === 'listening' ? 'Écoute en cours' : 'Appuyer pour parler'}
      >
        {micState === 'processing' ? (
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        ) : (
          <Mic className={cn(
            "w-12 h-12 text-white transition-transform",
            micState === 'listening' && 'scale-110'
          )} />
        )}
      </button>

      {/* Barres audio pendant l'écoute */}
      <AudioBars isActive={micState === 'listening'} />

      {/* Label sous le micro - AGRANDI */}
      <p className="text-center text-muted-foreground text-base font-medium">
        {getLabel()}
      </p>

      {/* Indicateur audio actif */}
      {isSpeaking && (
        <div className="flex items-center gap-1.5 text-primary text-xs">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          {getSpeakingText()}
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
        {getFallbackText()}
      </button>
    </div>
  );
}

export default VoiceModeCard;
