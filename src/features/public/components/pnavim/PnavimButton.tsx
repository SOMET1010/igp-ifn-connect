// ============================================
// PNAVIM BUTTON - COMPOSANT BOUTON UNIFIÉ
// ============================================
// Remplace: GiantActionButton, PnavimPillButton, boutons génériques
// RÈGLE: Maximum 1 bouton primary par écran

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'; // xl = Giant button (remplace GiantActionButton)

interface PnavimButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-pnavim-primary text-white hover:bg-pnavim-primary/90 shadow-md',
  secondary: 'bg-pnavim-secondary text-white hover:bg-pnavim-secondary/90 shadow-md',
  outline: 'border-2 border-pnavim-primary text-pnavim-primary bg-transparent hover:bg-pnavim-primary/10',
  ghost: 'bg-transparent text-pnavim-foreground hover:bg-black/5',
  danger: 'bg-pnavim-destructive text-white hover:bg-pnavim-destructive/90',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-12 px-6 text-base gap-2',
  lg: 'h-14 px-8 text-lg font-semibold gap-2',
  xl: 'h-20 px-8 text-xl font-bold rounded-2xl gap-3', // Remplaçant du GiantActionButton
};

export const PnavimButton = React.forwardRef<HTMLButtonElement, PnavimButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    leftIcon, 
    rightIcon, 
    fullWidth = false,
    children, 
    onClick,
    disabled,
    type = 'button',
    ...props 
  }, ref) => {
    const { triggerTap } = useSensoryFeedback();
    const prefersReducedMotion = useReducedMotion();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;
      triggerTap();
      onClick?.(e);
    };

    const baseStyles = cn(
      // Base
      "inline-flex items-center justify-center rounded-xl font-medium",
      // Transition
      "transition-all duration-200",
      // Focus
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pnavim-primary focus-visible:ring-offset-2",
      // Disabled
      "disabled:opacity-50 disabled:pointer-events-none",
      // Active
      !prefersReducedMotion && "active:scale-[0.98]",
      // Touch target minimum
      "min-h-[48px]"
    );

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
        )}
        onClick={handleClick}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

PnavimButton.displayName = "PnavimButton";

export default PnavimButton;
