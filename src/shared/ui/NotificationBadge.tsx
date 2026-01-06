import React from 'react';
import { cn } from '@/shared/lib';

export type NotificationBadgeVariant = 'default' | 'warning' | 'destructive';

interface NotificationBadgeProps {
  /** Nombre à afficher (affiché seulement si > 0 ou showZero) */
  count: number;
  /** Variante visuelle : default (bleu), warning (orange), destructive (rouge) */
  variant?: NotificationBadgeVariant;
  /** Taille du badge */
  size?: 'sm' | 'md' | 'lg';
  /** Maximum affiché (ex: 99 → "99+") */
  max?: number;
  /** Afficher même si count = 0 */
  showZero?: boolean;
  /** Position absolue (pour overlay sur icône) */
  absolute?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  variant = 'default',
  size = 'md',
  max = 99,
  showZero = false,
  absolute = false,
  className,
}) => {
  // Ne pas afficher si count <= 0 et showZero = false
  if (count <= 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={cn(
        // Base
        'inline-flex items-center justify-center rounded-full font-bold',
        // Tailles
        size === 'sm' && 'min-w-[14px] h-[14px] text-[10px] px-0.5',
        size === 'md' && 'min-w-[18px] h-[18px] text-xs px-1',
        size === 'lg' && 'min-w-[22px] h-[22px] text-sm px-1.5',
        // Position absolue
        absolute && 'absolute -top-1 -right-1',
        // Variantes avec couleurs, animations et glows
        variant === 'default' && 'bg-primary text-primary-foreground shadow-glow-primary animate-fade-pulse',
        variant === 'warning' && 'bg-orange-500 text-white shadow-glow-warning animate-bounce-gentle',
        variant === 'destructive' && 'bg-destructive text-destructive-foreground shadow-glow-destructive animate-pulse',
        className
      )}
    >
      {displayCount}
    </span>
  );
};
