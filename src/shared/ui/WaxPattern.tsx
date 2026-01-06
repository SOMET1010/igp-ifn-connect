import React from 'react';
import { cn } from '@/shared/lib';

interface WaxPatternProps {
  className?: string;
  variant?: 'kente' | 'adinkra' | 'geometric';
  opacity?: number;
}

export const WaxPattern: React.FC<WaxPatternProps> = ({
  className,
  variant = 'geometric',
  opacity = 0.06,
}) => {
  const getPattern = () => {
    switch (variant) {
      case 'kente':
        return (
          <pattern id="wax-kente" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            {/* Kente-inspired stripes and rectangles */}
            <rect x="0" y="0" width="20" height="60" fill="hsl(27, 100%, 38%)" />
            <rect x="20" y="0" width="20" height="60" fill="hsl(45, 90%, 55%)" />
            <rect x="40" y="0" width="20" height="60" fill="hsl(123, 46%, 34%)" />
            <rect x="0" y="20" width="60" height="5" fill="hsl(0, 0%, 20%)" />
            <rect x="0" y="40" width="60" height="5" fill="hsl(0, 0%, 20%)" />
          </pattern>
        );
      case 'adinkra':
        return (
          <pattern id="wax-adinkra" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            {/* Adinkra-inspired symbols */}
            <circle cx="20" cy="20" r="8" fill="none" stroke="hsl(27, 100%, 38%)" strokeWidth="2" />
            <circle cx="20" cy="20" r="3" fill="hsl(27, 100%, 38%)" />
            <line x1="10" y1="10" x2="30" y2="30" stroke="hsl(45, 90%, 55%)" strokeWidth="1.5" />
            <line x1="30" y1="10" x2="10" y2="30" stroke="hsl(45, 90%, 55%)" strokeWidth="1.5" />
          </pattern>
        );
      case 'geometric':
      default:
        return (
          <pattern id="wax-geometric" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            {/* African geometric pattern */}
            <polygon points="25,5 45,25 25,45 5,25" fill="none" stroke="hsl(27, 100%, 38%)" strokeWidth="1.5" />
            <polygon points="25,15 35,25 25,35 15,25" fill="hsl(28, 81%, 52%)" fillOpacity="0.3" />
            <circle cx="25" cy="25" r="3" fill="hsl(123, 46%, 34%)" />
            <line x1="0" y1="0" x2="10" y2="10" stroke="hsl(45, 90%, 55%)" strokeWidth="1" />
            <line x1="40" y1="0" x2="50" y2="10" stroke="hsl(45, 90%, 55%)" strokeWidth="1" />
            <line x1="0" y1="40" x2="10" y2="50" stroke="hsl(45, 90%, 55%)" strokeWidth="1" />
            <line x1="40" y1="40" x2="50" y2="50" stroke="hsl(45, 90%, 55%)" strokeWidth="1" />
          </pattern>
        );
    }
  };

  const patternId = `wax-${variant}`;

  return (
    <svg
      className={cn('absolute inset-0 w-full h-full pointer-events-none', className)}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>{getPattern()}</defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
};
