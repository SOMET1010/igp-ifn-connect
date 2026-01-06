/**
 * AudioLevelIndicator - Feedback visuel du niveau audio
 * 
 * Montre clairement à l'utilisateur si le micro capte du son.
 * Barres animées qui réagissent au niveau audio en temps réel.
 */

import React from 'react';
import { cn } from '@/shared/lib';
import { motion } from 'framer-motion';

interface AudioLevelIndicatorProps {
  /** Niveau audio actuel (0-1) */
  level: number;
  /** Historique des niveaux pour animation fluide */
  levelHistory?: number[];
  /** Indique si le micro reçoit du son */
  isReceivingAudio: boolean;
  /** Nombre de barres à afficher */
  barCount?: number;
  /** Taille du composant */
  size?: 'sm' | 'md' | 'lg';
  /** Classe CSS additionnelle */
  className?: string;
}

export function AudioLevelIndicator({
  level,
  levelHistory = [],
  isReceivingAudio,
  barCount = 5,
  size = 'md',
  className,
}: AudioLevelIndicatorProps) {
  // Configuration des tailles
  const sizeConfig = {
    sm: { barWidth: 3, barGap: 2, maxHeight: 16 },
    md: { barWidth: 4, barGap: 3, maxHeight: 24 },
    lg: { barWidth: 6, barGap: 4, maxHeight: 32 },
  };
  
  const config = sizeConfig[size];
  
  // Générer les hauteurs des barres basées sur le niveau
  const bars = Array.from({ length: barCount }, (_, index) => {
    // Utiliser l'historique pour un effet plus fluide
    const historyIndex = Math.floor((index / barCount) * levelHistory.length);
    const historyLevel = levelHistory[historyIndex] || level;
    
    // Ajouter une variation naturelle pour chaque barre
    const variation = Math.sin((index * Math.PI) / barCount);
    const barLevel = historyLevel * (0.5 + variation * 0.5);
    
    // Hauteur minimum pour montrer que le composant est actif
    const minHeight = 4;
    const height = minHeight + barLevel * (config.maxHeight - minHeight);
    
    return height;
  });
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-[var(--gap)]",
        className
      )}
      style={{ '--gap': `${config.barGap}px` } as React.CSSProperties}
    >
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className={cn(
            "rounded-full transition-colors duration-150",
            isReceivingAudio ? "bg-green-500" : "bg-muted-foreground/30"
          )}
          style={{
            width: config.barWidth,
          }}
          animate={{
            height: height,
            opacity: isReceivingAudio ? 1 : 0.5,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        />
      ))}
    </div>
  );
}

/**
 * AudioPulse - Indicateur pulsant simple
 * 
 * Alternative plus simple : un cercle qui pulse avec le niveau audio.
 */
export function AudioPulse({
  level,
  isReceivingAudio,
  size = 'md',
  className,
}: {
  level: number;
  isReceivingAudio: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeConfig = {
    sm: 24,
    md: 40,
    lg: 56,
  };
  
  const baseSize = sizeConfig[size];
  const pulseScale = 1 + level * 0.5;
  
  return (
    <div className={cn("relative", className)}>
      {/* Cercle pulsant */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full",
          isReceivingAudio ? "bg-green-500/30" : "bg-muted/30"
        )}
        animate={{
          scale: isReceivingAudio ? pulseScale : 1,
          opacity: isReceivingAudio ? 0.6 : 0.3,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 10,
        }}
        style={{
          width: baseSize,
          height: baseSize,
        }}
      />
      
      {/* Cercle central */}
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          isReceivingAudio ? "bg-green-500" : "bg-muted-foreground/50"
        )}
        style={{
          width: baseSize,
          height: baseSize,
        }}
      >
        <span className="text-white text-xs font-medium">
          {isReceivingAudio ? '🔊' : '🔇'}
        </span>
      </div>
    </div>
  );
}

/**
 * AudioWaveform - Forme d'onde stylisée
 */
export function AudioWaveform({
  levelHistory,
  isReceivingAudio,
  className,
}: {
  levelHistory: number[];
  isReceivingAudio: boolean;
  className?: string;
}) {
  // S'assurer qu'on a assez de points
  const points = levelHistory.length >= 2 ? levelHistory : [0, 0];
  
  // Générer le path SVG
  const width = 100;
  const height = 30;
  const centerY = height / 2;
  
  const pathData = points
    .map((level, index) => {
      const x = (index / (points.length - 1)) * width;
      const amplitude = level * centerY * 0.9;
      const y = centerY - amplitude;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  
  // Path miroir pour symétrie
  const mirrorPath = points
    .map((level, index) => {
      const x = (index / (points.length - 1)) * width;
      const amplitude = level * centerY * 0.9;
      const y = centerY + amplitude;
      return `L ${x} ${y}`;
    })
    .reverse()
    .join(' ');
  
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full h-8", className)}
      preserveAspectRatio="none"
    >
      <path
        d={`${pathData} ${mirrorPath} Z`}
        fill={isReceivingAudio ? "rgba(34, 197, 94, 0.5)" : "rgba(156, 163, 175, 0.3)"}
        stroke={isReceivingAudio ? "rgb(34, 197, 94)" : "rgb(156, 163, 175)"}
        strokeWidth="1"
      />
    </svg>
  );
}

export default AudioLevelIndicator;
