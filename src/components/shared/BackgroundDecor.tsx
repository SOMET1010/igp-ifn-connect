// ============================================
// Composant icônes décoratives en arrière-plan - Design KPATA
// ============================================

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecorIcon {
  Icon: LucideIcon;
  position: 'top-right' | 'bottom-left' | 'top-left' | 'bottom-right' | 'center-right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rotate?: number;
}

interface BackgroundDecorProps {
  icons: DecorIcon[];
  className?: string;
  opacity?: number;
}

const positionStyles: Record<string, string> = {
  'top-right': 'top-0 right-0 -translate-y-1/4 translate-x-1/4',
  'bottom-left': 'bottom-0 left-0 translate-y-1/4 -translate-x-1/4',
  'top-left': 'top-0 left-0 -translate-y-1/4 -translate-x-1/4',
  'bottom-right': 'bottom-0 right-0 translate-y-1/4 translate-x-1/4',
  'center-right': 'top-1/2 right-0 -translate-y-1/2 translate-x-1/3',
};

const sizeStyles: Record<string, string> = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
};

export const BackgroundDecor: React.FC<BackgroundDecorProps> = ({
  icons,
  className,
  opacity = 10,
}) => {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {icons.map((item, index) => {
        const { Icon, position, size = 'lg', rotate = 0 } = item;
        return (
          <div
            key={index}
            className={cn(
              'absolute text-primary',
              positionStyles[position],
              sizeStyles[size]
            )}
            style={{ 
              opacity: opacity / 100,
              transform: `${positionStyles[position].includes('translate') ? '' : ''}rotate(${rotate}deg)`,
            }}
          >
            <Icon className="w-full h-full" strokeWidth={0.5} />
          </div>
        );
      })}
    </div>
  );
};

export default BackgroundDecor;
