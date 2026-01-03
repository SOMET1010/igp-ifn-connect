import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  /** Contenu de la carte */
  children: React.ReactNode;
  /** Variante de couleur de bordure */
  borderColor?: "orange" | "green" | "gold" | "violet" | "none";
  /** Taille du padding */
  padding?: "sm" | "md" | "lg";
  /** Classes additionnelles */
  className?: string;
  /** Callback au clic */
  onClick?: () => void;
  /** Rendre la carte comme un bouton */
  asButton?: boolean;
}

const borderColors = {
  orange: "border-orange-sanguine/30 hover:border-orange-sanguine/50",
  green: "border-vert-manioc/30 hover:border-vert-manioc/50",
  gold: "border-yellow-500/30 hover:border-yellow-500/50",
  violet: "border-violet-500/30 hover:border-violet-500/50",
  none: "border-white/20",
};

const paddings = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

/**
 * Carte avec effet glassmorphism "L'Âme du Marché"
 * Fond semi-transparent avec blur et bordures colorées chaudes
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  borderColor = "orange",
  padding = "md",
  className,
  onClick,
  asButton = false,
}) => {
  const Component = asButton || onClick ? "button" : "div";
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        // Base glassmorphism
        "bg-white/85 backdrop-blur-xl rounded-3xl border-2 shadow-lg",
        // Transition fluide
        "transition-all duration-300",
        // Bordure colorée
        borderColors[borderColor],
        // Padding
        paddings[padding],
        // Hover effect si cliquable
        onClick && "hover:scale-[1.02] hover:shadow-xl cursor-pointer active:scale-[0.98]",
        className
      )}
      type={Component === "button" ? "button" : undefined}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
