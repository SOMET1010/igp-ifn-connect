import React from 'react';
import { cn } from '@/lib/utils';

interface PnavimTricolorLineProps {
  className?: string;
}

/**
 * Ligne tricolore décorative (Orange - Blanc - Vert)
 * Signature visuelle institutionnelle Côte d'Ivoire
 */
export const PnavimTricolorLine: React.FC<PnavimTricolorLineProps> = ({
  className,
}) => {
  return (
    <div 
      className={cn("h-1 w-full", className)}
      style={{
        background: 'linear-gradient(90deg, #E67E22 0%, #E67E22 33%, #FFFFFF 33%, #FFFFFF 66%, #2E7D32 66%, #2E7D32 100%)'
      }}
      aria-hidden="true"
    />
  );
};

export default PnavimTricolorLine;
