import React from 'react';
import { cn } from '@/lib/utils';

interface AudioBarsProps {
  isActive: boolean;
  className?: string;
}

/**
 * AudioBars - Barres audio animées pour le feedback d'écoute
 * 3 barres verticales qui "dansent" pendant l'écoute
 */
export function AudioBars({ isActive, className }: AudioBarsProps) {
  if (!isActive) return null;

  return (
    <div className={cn("flex items-end justify-center gap-1 h-6", className)}>
      <div 
        className="w-1 bg-secondary rounded-full animate-audio-bar-1"
        style={{ animationPlayState: isActive ? 'running' : 'paused' }}
      />
      <div 
        className="w-1 bg-secondary rounded-full animate-audio-bar-2"
        style={{ animationPlayState: isActive ? 'running' : 'paused' }}
      />
      <div 
        className="w-1 bg-secondary rounded-full animate-audio-bar-3"
        style={{ animationPlayState: isActive ? 'running' : 'paused' }}
      />
    </div>
  );
}

export default AudioBars;
