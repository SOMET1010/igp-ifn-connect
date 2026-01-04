import React from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PnavimCardProps {
  children: React.ReactNode;
  /** Variante de couleur */
  variant?: "glass" | "solid";
  /** Accent de bordure */
  accent?: "orange" | "green" | "gold" | "violet" | "none";
  /** Taille du padding */
  padding?: "sm" | "md" | "lg" | "xl";
  /** Callback au clic */
  onClick?: () => void;
  /** Classes additionnelles */
  className?: string;
  /** Désactiver les effets hover (perf Android) */
  reducedEffects?: boolean;
}

const accentColors = {
  orange: "border-orange-sanguine/40 hover:border-orange-sanguine/70",
  green: "border-vert-manioc/40 hover:border-vert-manioc/70",
  gold: "border-accent/40 hover:border-accent/70",
  violet: "border-violet-500/40 hover:border-violet-500/70",
  none: "border-white/30",
};

const paddings = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

/**
 * Carte PNAVIM - Glassmorphism "L'Âme du Marché"
 * Optimisée pour Android bas de gamme avec fallback sans blur
 */
export const PnavimCard: React.FC<PnavimCardProps> = ({
  children,
  variant = "glass",
  accent = "orange",
  padding = "md",
  onClick,
  className,
  reducedEffects = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceEffects = reducedEffects || prefersReducedMotion;

  const Component = onClick ? "button" : "div";

  const baseStyles = variant === "glass"
    ? shouldReduceEffects
      ? "bg-white/90" // Fallback sans blur
      : "bg-white/85 backdrop-blur-xl"
    : "bg-card";

  return (
    <Component
      onClick={onClick}
      type={Component === "button" ? "button" : undefined}
      className={cn(
        // Base
        baseStyles,
        "rounded-3xl border-2 shadow-lg",
        // Bordure accent
        accentColors[accent],
        // Padding
        paddings[padding],
        // Transitions
        !shouldReduceEffects && "transition-all duration-200",
        // Hover si cliquable
        onClick && !shouldReduceEffects && "hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] cursor-pointer",
        onClick && shouldReduceEffects && "active:opacity-80 cursor-pointer",
        className
      )}
    >
      {children}
    </Component>
  );
};

export default PnavimCard;
