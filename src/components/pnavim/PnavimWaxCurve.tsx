import React from "react";
import { cn } from "@/lib/utils";

interface PnavimWaxCurveProps {
  className?: string;
  variant?: "bottom" | "top";
}

/**
 * Courbe décorative SVG style "Wax" africain
 * Signature visuelle du marché ivoirien
 * Gradient jaune moutarde → orange sanguine → terre battue
 */
export const PnavimWaxCurve: React.FC<PnavimWaxCurveProps> = ({
  className,
  variant = "bottom",
}) => {
  const isTop = variant === "top";

  return (
    <svg
      viewBox="0 0 400 60"
      preserveAspectRatio="none"
      className={cn(
        "w-full h-auto pointer-events-none",
        isTop && "rotate-180",
        className
      )}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wax-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(45, 89%, 50%)" /> {/* Jaune moutarde */}
          <stop offset="40%" stopColor="hsl(25, 95%, 53%)" /> {/* Orange sanguine */}
          <stop offset="100%" stopColor="hsl(25, 100%, 38%)" /> {/* Terre battue */}
        </linearGradient>
      </defs>
      
      {/* Courbe fluide principale */}
      <path
        d="M0 60 
           Q60 25 120 40 
           T240 20 
           T360 35 
           T400 25 
           L400 60 Z"
        fill="url(#wax-gradient)"
        opacity="0.95"
      />
      
      {/* Courbe secondaire plus légère pour la profondeur */}
      <path
        d="M0 60 
           Q80 35 160 45 
           T320 30 
           T400 40 
           L400 60 Z"
        fill="url(#wax-gradient)"
        opacity="0.4"
      />
    </svg>
  );
};

export default PnavimWaxCurve;
