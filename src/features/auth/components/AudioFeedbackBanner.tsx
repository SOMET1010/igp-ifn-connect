/**
 * AudioFeedbackBanner - Messages courts contextuels pour l'écoute vocale
 * 
 * Affiche UN message selon l'état :
 * - requesting_mic → "Préparation du micro..."
 * - connecting → "Connexion..."
 * - listening + ok → "Je t'écoute..."
 * - listening + silence > 1200ms → "Je n'entends rien..."
 * - listening + weak → "Parle plus près du téléphone"
 * - processing → "Un instant..."
 * - error → Message d'erreur + bouton
 */

import React from 'react';
import { Loader2, Mic, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AudioStatus } from '../hooks/useAudioLevel';

// Types d'état de transcription
type TranscriptionState = 'idle' | 'requesting_mic' | 'connecting' | 'listening' | 'processing' | 'error';

interface AudioFeedbackBannerProps {
  state: TranscriptionState;
  audioStatus: AudioStatus;
  silenceDuration: number;
  errorMessage?: string | null;
  onRetry?: () => void;
  className?: string;
}

const SILENCE_THRESHOLD_MS = 1200; // 1.2 secondes

export const AudioFeedbackBanner: React.FC<AudioFeedbackBannerProps> = ({
  state,
  audioStatus,
  silenceDuration,
  errorMessage,
  onRetry,
  className,
}) => {
  // Déterminer le contenu à afficher
  const getContent = () => {
    switch (state) {
      case 'requesting_mic':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: "Préparation du micro...",
          variant: 'loading' as const
        };
        
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: "Connexion...",
          variant: 'loading' as const
        };
        
      case 'listening':
        // Silence prolongé ?
        if (silenceDuration > SILENCE_THRESHOLD_MS) {
          return {
            icon: <VolumeX className="w-4 h-4" />,
            text: "Je n'entends rien...",
            variant: 'warning' as const
          };
        }
        
        // Niveau faible ?
        if (audioStatus === 'weak') {
          return {
            icon: <Volume2 className="w-4 h-4" />,
            text: "Parle plus près du téléphone",
            variant: 'warning' as const
          };
        }
        
        // OK !
        return {
          icon: <Mic className="w-4 h-4" />,
          text: "Je t'écoute...",
          variant: 'success' as const
        };
        
      case 'processing':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: "Un instant...",
          variant: 'loading' as const
        };
        
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: errorMessage || "Une erreur est survenue",
          variant: 'error' as const
        };
        
      default:
        return null;
    }
  };
  
  const content = getContent();
  
  if (!content) return null;
  
  // Styles selon le variant
  const variantStyles = {
    loading: 'bg-white/20 text-white border-white/30',
    success: 'bg-emerald-500/30 text-white border-emerald-400/50',
    warning: 'bg-amber-500/30 text-white border-amber-400/50',
    error: 'bg-red-500/30 text-white border-red-400/50',
  };
  
  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm transition-all",
        variantStyles[content.variant],
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Message principal */}
      <div className="flex items-center gap-2 text-sm font-medium">
        {content.icon}
        <span>{content.text}</span>
      </div>
      
      {/* Bouton retry (pour erreurs) */}
      {state === 'error' && onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
        >
          Recommencer
        </Button>
      )}
    </div>
  );
};

export default AudioFeedbackBanner;
