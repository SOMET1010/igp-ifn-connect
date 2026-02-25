import React from "react";
import { cn } from "@/shared/lib";
import { useSensoryFeedback, useReducedMotion } from "@/shared/hooks";

interface PnavimPillButtonProps {
  children: React.ReactNode;
  /** Variante de style */
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  /** Taille du bouton */
  size?: "sm" | "md" | "lg" | "xl";
  /** Pleine largeur */
  fullWidth?: boolean;
  /** Désactivé */
  disabled?: boolean;
  /** Icône à gauche */
  leftIcon?: React.ReactNode;
  /** Icône à droite */
  rightIcon?: React.ReactNode;
  /** Callback au clic */
  onClick?: () => void;
  /** Type de bouton */
  type?: "button" | "submit" | "reset";
  /** Classes additionnelles */
  className?: string;
}

const variantStyles = {
  primary: cn(
    "text-white shadow-xl",
    "bg-gradient-to-r from-orange-sanguine to-terre-battue",
    "hover:shadow-glow-orange"
  ),
  secondary: cn(
    "text-orange-sanguine border-2 border-orange-sanguine/50",
    "bg-white/80 hover:bg-orange-sanguine/10",
    "hover:border-orange-sanguine"
  ),
  success: cn(
    "text-white shadow-xl",
    "bg-gradient-to-r from-vert-manioc to-green-dark",
    "hover:shadow-glow-green"
  ),
  danger: cn(
    "text-white shadow-lg",
    "bg-gradient-to-r from-destructive to-red-700"
  ),
  ghost: cn(
    "text-charbon/70 hover:text-charbon",
    "bg-transparent hover:bg-charbon/5"
  ),
};

const sizeStyles = {
  sm: "h-10 px-4 text-sm gap-2",
  md: "h-12 px-6 text-base gap-2",
  lg: "h-14 px-8 text-lg gap-3",
  xl: "h-16 px-10 text-xl gap-3",
};

/**
 * Bouton pilule JÙLABA
 * Forme arrondie avec dégradé et ombre physique
 * Feedback haptique intégré
 */
export const PnavimPillButton: React.FC<PnavimPillButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  type = "button",
  className,
}) => {
  const { triggerTap } = useSensoryFeedback();
  const prefersReducedMotion = useReducedMotion();

  const handleClick = () => {
    if (!disabled) {
      triggerTap();
      onClick?.();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        // Base
        "inline-flex items-center justify-center font-nunito font-bold rounded-full",
        // Variante
        variantStyles[variant],
        // Taille
        sizeStyles[size],
        // Largeur
        fullWidth && "w-full",
        // Transitions
        !prefersReducedMotion && "transition-all duration-200",
        // Effets hover/active
        !disabled && !prefersReducedMotion && "hover:scale-[1.02] active:scale-[0.96]",
        !disabled && prefersReducedMotion && "active:opacity-80",
        // Disabled
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default PnavimPillButton;
