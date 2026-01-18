/**
 * JulabaVoiceButton - Bouton micro géant style Jùlaba
 * 
 * Design: Hero central, pulsation invitante, feedback visuel fort
 */
import { cn } from '@/lib/utils';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export interface JulabaVoiceButtonProps {
  /** État du bouton */
  state: 'idle' | 'listening' | 'processing' | 'disabled';
  /** Au clic */
  onClick: () => void;
  /** Taille */
  size?: 'md' | 'lg' | 'xl';
  /** Label sous le bouton */
  label?: string;
  className?: string;
}

export function JulabaVoiceButton({
  state,
  onClick,
  size = 'lg',
  label,
  className,
}: JulabaVoiceButtonProps) {
  
  const sizeStyles = {
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-32 h-32',
  };
  
  const iconSizes = {
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };
  
  const isDisabled = state === 'disabled';
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <button
        onClick={onClick}
        disabled={isDisabled || isProcessing}
        className={cn(
          // Base
          "rounded-full flex items-center justify-center",
          "border-4 border-white",
          "transition-all duration-150",
          "touch-manipulation",
          sizeStyles[size],
          
          // État idle (orange pulsant)
          state === 'idle' && `
            bg-gradient-to-br from-[hsl(30_100%_60%)] to-[hsl(27_100%_50%)]
            shadow-[0_8px_32px_-4px_hsl(30_100%_50%/0.5)]
            animate-[pulse-warm_2.5s_ease-in-out_infinite]
            hover:scale-105 active:scale-95
          `,
          
          // État listening (vert pulsant)
          isListening && `
            bg-gradient-to-br from-[hsl(145_74%_42%)] to-[hsl(145_74%_32%)]
            shadow-[0_8px_32px_-4px_hsl(145_74%_40%/0.5)]
            animate-[voice-pulse_1.5s_ease-out_infinite]
          `,
          
          // État processing
          isProcessing && `
            bg-gradient-to-br from-[hsl(30_100%_60%)] to-[hsl(27_100%_50%)]
            opacity-70 cursor-wait
          `,
          
          // État disabled
          isDisabled && `
            bg-gray-300 opacity-50 cursor-not-allowed
          `,
        )}
      >
        {isProcessing ? (
          <Loader2 className={cn(iconSizes[size], "text-white animate-spin")} />
        ) : isDisabled ? (
          <MicOff className={cn(iconSizes[size], "text-gray-500")} />
        ) : (
          <Mic className={cn(iconSizes[size], "text-white")} />
        )}
      </button>
      
      {label && (
        <span className={cn(
          "text-sm font-medium",
          isListening ? "text-[hsl(145_74%_35%)]" : "text-muted-foreground"
        )}>
          {isListening ? "J'écoute..." : label}
        </span>
      )}
    </div>
  );
}
