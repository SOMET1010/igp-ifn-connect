import React from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface GlassCardProps {
  /** Contenu de la carte */
  children: React.ReactNode;
  /** Variante de style */
  variant?: "glass" | "solid";
  /** Variante de couleur de bordure */
  borderColor?: "orange" | "green" | "gold" | "violet" | "none";
  /** Taille du padding */
  padding?: "sm" | "md" | "lg" | "xl";
  /** Classes additionnelles */
  className?: string;
  /** Callback au clic */
  onClick?: () => void;
  /** Rendre la carte comme un bouton */
  asButton?: boolean;
  /** Forcer la réduction des effets (Android bas de gamme) */
  reducedEffects?: boolean;
}

const borderColors = {
  orange: "border-orange-sanguine/30 hover:border-orange-sanguine/50",
  green: "border-vert-manioc/30 hover:border-vert-manioc/50",
  gold: "border-accent/30 hover:border-accent/50",
  violet: "border-violet-500/30 hover:border-violet-500/50",
  none: "border-white/20",
};

const paddings = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

/**
 * Carte avec effet glassmorphism "L'Âme du Marché"
 * Fond semi-transparent avec blur et bordures colorées chaudes
 * Optimisée pour Android bas de gamme avec fallback sans blur
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = "glass",
  borderColor = "orange",
  padding = "md",
  className,
  onClick,
  asButton = false,
  reducedEffects = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceEffects = reducedEffects || prefersReducedMotion;

  const Component = asButton || onClick ? "button" : "div";

  const baseStyles =
    variant === "glass"
      ? shouldReduceEffects
        ? "bg-white/90" // Fallback sans blur
        : "bg-white/85 backdrop-blur-xl"
      : "bg-card";

  return (
    <Component
      onClick={onClick}
      className={cn(
        // Base
        baseStyles,
        "rounded-3xl border-2 shadow-lg",
        // Bordure colorée
        borderColors[borderColor],
        // Padding
        paddings[padding],
        // Transitions (sauf si reduced motion)
        !shouldReduceEffects && "transition-all duration-200",
        // Hover effect si cliquable
        onClick &&
          !shouldReduceEffects &&
          "hover:scale-[1.02] hover:shadow-xl cursor-pointer active:scale-[0.98]",
        onClick && shouldReduceEffects && "active:opacity-80 cursor-pointer",
        className
      )}
      type={Component === "button" ? "button" : undefined}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
