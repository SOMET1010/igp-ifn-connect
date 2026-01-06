import React from "react";
import { WaxPattern } from "./WaxPattern";
import { cn } from "@/shared/lib";

interface VibrantTotalBarProps {
  /** Libellé au-dessus du montant */
  label: string;
  /** Montant formaté (ex: "12 500") */
  amount: string;
  /** Devise */
  currency?: string;
  /** Classes additionnelles */
  className?: string;
  /** Callback au clic */
  onClick?: () => void;
}

/**
 * Barre de total vibrante avec gradient orange/terracotta
 * Affiche le montant en très gros caractères
 */
export const VibrantTotalBar: React.FC<VibrantTotalBarProps> = ({
  label,
  amount,
  currency = "FCFA",
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        // Base
        "relative overflow-hidden rounded-2xl",
        // Gradient chaud
        "bg-gradient-to-r from-terre-battue via-orange-sanguine to-terre-battue",
        // Padding
        "px-6 py-5",
        // Text center
        "text-center",
        // Shadow chaude
        "shadow-xl shadow-orange-sanguine/30",
        // Hover si cliquable
        onClick && "cursor-pointer hover:shadow-2xl transition-shadow",
        className
      )}
    >
      {/* Wax Pattern en overlay subtil */}
      <WaxPattern 
        variant="geometric" 
        opacity={0.08} 
        className="absolute inset-0"
      />

      {/* Contenu */}
      <div className="relative z-10">
        {/* Label */}
        <p className="text-white/80 text-sm font-medium font-inter uppercase tracking-wide mb-1">
          {label}
        </p>
        
        {/* Montant XXL */}
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl sm:text-6xl font-nunito font-extrabold text-white tracking-tight">
            {amount}
          </span>
          <span className="text-2xl font-bold text-yellow-200">
            {currency}
          </span>
        </div>
      </div>

      {/* Glow effect */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, white 0%, transparent 70%)"
        }}
      />
    </div>
  );
};
