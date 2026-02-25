// ============================================
// JÙLABA CARD - COMPOSANT CARTE UNIFIÉ
// ============================================
// Remplace: GlassCard, SafeCard, cartes génériques
// RÈGLE: Maximum 3 cartes par écran

import React from 'react';
import { cn } from '@/shared/lib';
import { useSensoryFeedback } from '@/shared/hooks';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'success' | 'warning';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface PnavimCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  clickable?: boolean;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-julaba-border',
  elevated: 'bg-white shadow-lg border-0',
  outlined: 'bg-transparent border-2 border-julaba-primary',
  success: 'bg-julaba-secondary/10 border border-julaba-secondary/30',
  warning: 'bg-amber-50 border border-amber-200',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const PnavimCard = React.forwardRef<HTMLDivElement, PnavimCardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    clickable = false,
    icon,
    title,
    subtitle,
    children, 
    onClick,
    ...props 
  }, ref) => {
    const { triggerTap } = useSensoryFeedback();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!clickable) return;
      triggerTap();
      onClick?.(e);
    };

    const baseStyles = cn(
      // Base
      "rounded-xl",
      // Transition
      "transition-all duration-200",
      // Clickable styles
      clickable && [
        "cursor-pointer",
        "hover:shadow-md",
        "active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-julaba-primary focus-visible:ring-offset-2"
      ]
    );

    // Si icon, title ou subtitle sont fournis, on utilise un layout prédéfini
    const hasHeader = icon || title || subtitle;

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        onClick={handleClick}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {hasHeader && (
          <div className="flex items-start gap-3">
            {icon && (
              <div className="shrink-0 w-10 h-10 rounded-lg bg-julaba-primary/10 flex items-center justify-center text-julaba-primary">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-base font-semibold text-julaba-foreground truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-julaba-muted mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}
        {hasHeader && children && <div className="mt-3">{children}</div>}
        {!hasHeader && children}
      </div>
    );
  }
);

PnavimCard.displayName = "PnavimCard";

export default PnavimCard;
