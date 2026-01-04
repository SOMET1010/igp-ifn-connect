import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';

interface PnavimZoomControlsProps {
  className?: string;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  onZoomChange?: (zoom: number) => void;
}

/**
 * Contrôles de zoom pour l'accessibilité
 * Affiche le pourcentage actuel avec boutons +/-
 */
export const PnavimZoomControls: React.FC<PnavimZoomControlsProps> = ({
  className,
  initialZoom = 100,
  minZoom = 80,
  maxZoom = 150,
  step = 10,
  onZoomChange,
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const { triggerTap } = useSensoryFeedback();

  const handleZoomChange = useCallback((newZoom: number) => {
    const clampedZoom = Math.min(maxZoom, Math.max(minZoom, newZoom));
    setZoom(clampedZoom);
    
    // Appliquer le zoom au document
    document.documentElement.style.fontSize = `${clampedZoom}%`;
    
    triggerTap();
    onZoomChange?.(clampedZoom);
  }, [minZoom, maxZoom, triggerTap, onZoomChange]);

  const decrease = () => handleZoomChange(zoom - step);
  const increase = () => handleZoomChange(zoom + step);

  return (
    <div 
      className={cn(
        "flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1",
        className
      )}
      role="group"
      aria-label="Contrôles de zoom"
    >
      <button
        onClick={decrease}
        disabled={zoom <= minZoom}
        className="p-1 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Diminuer la taille du texte"
      >
        <Minus className="h-3.5 w-3.5 text-foreground" />
      </button>
      
      <span className="text-xs font-medium text-foreground min-w-[40px] text-center">
        {zoom}%
      </span>
      
      <button
        onClick={increase}
        disabled={zoom >= maxZoom}
        className="p-1 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Augmenter la taille du texte"
      >
        <Plus className="h-3.5 w-3.5 text-foreground" />
      </button>
    </div>
  );
};

export default PnavimZoomControls;
