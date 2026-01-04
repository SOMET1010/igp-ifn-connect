/**
 * BigMicButton - Bouton micro XXL central
 * Avec animation pulse et feedback haptique
 */

import { useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BigMicButtonProps } from '../types/voice.types';

const SIZE_CLASSES = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-40 h-40'
};

const ICON_SIZES = {
  sm: 24,
  md: 36,
  lg: 48,
  xl: 64
};

export function BigMicButton({
  isListening,
  isProcessing,
  isOffline = false,
  onPress,
  onLongPress,
  onRelease,
  size = 'xl',
  disabled = false
}: BigMicButtonProps) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  
  const handlePointerDown = useCallback(() => {
    if (disabled) return;
    
    isLongPress.current = false;
    
    // Vibration courte au toucher
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    
    // Timer pour long press
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress?.();
      // Vibration longue pour long press
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, 500);
  }, [disabled, onLongPress]);
  
  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    if (!isLongPress.current) {
      onPress();
    } else {
      onRelease?.();
    }
  }, [onPress, onRelease]);
  
  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);
  
  const iconSize = ICON_SIZES[size];
  
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse animation quand écoute */}
      {isListening && (
        <>
          <div 
            className={cn(
              SIZE_CLASSES[size],
              "absolute rounded-full bg-primary/30 animate-ping"
            )} 
          />
          <div 
            className={cn(
              SIZE_CLASSES[size],
              "absolute rounded-full bg-primary/20 animate-pulse"
            )} 
            style={{ animationDelay: '0.1s' }}
          />
        </>
      )}
      
      {/* Bouton principal */}
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        disabled={disabled}
        className={cn(
          SIZE_CLASSES[size],
          "relative z-10 rounded-full flex items-center justify-center",
          "transition-all duration-200 transform",
          "focus:outline-none focus:ring-4 focus:ring-primary/50",
          "touch-none select-none",
          isListening 
            ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/50 scale-110" 
            : "bg-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105",
          isProcessing && "bg-muted text-muted-foreground",
          disabled && "opacity-50 cursor-not-allowed",
          "active:scale-95"
        )}
        aria-label={isListening ? "Arrêter l'écoute" : "Commencer l'écoute"}
      >
        {isProcessing ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : isListening ? (
          <MicOff size={iconSize} />
        ) : (
          <Mic size={iconSize} />
        )}
      </button>
      
      {/* Badge offline */}
      {isOffline && (
        <div className="absolute -top-2 -right-2 bg-muted text-muted-foreground rounded-full p-2 shadow-lg z-20">
          <WifiOff size={16} />
        </div>
      )}
    </div>
  );
}
