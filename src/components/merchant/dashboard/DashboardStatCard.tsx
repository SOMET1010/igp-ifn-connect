import React from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  /** Libellé de la stat */
  label: string;
  /** Valeur principale */
  value: string | number;
  /** Emoji icône 3D */
  emoji: string;
  /** Couleur de bordure */
  borderColor?: "orange" | "green" | "gold" | "violet";
  /** Classes additionnelles */
  className?: string;
  /** Callback au clic */
  onClick?: () => void;
}

/**
 * Carte de statistique glassmorphism pour le dashboard marchand
 * Avec icône emoji 3D et design chaleureux
 */
export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  label,
  value,
  emoji,
  borderColor = "orange",
  className,
  onClick,
}) => {
  return (
    <GlassCard
      borderColor={borderColor}
      padding="md"
      onClick={onClick}
      className={cn("flex items-center gap-3", className)}
    >
      {/* Emoji icône */}
      <div className="text-3xl flex-shrink-0">
        {emoji}
      </div>
      
      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-inter uppercase tracking-wide truncate">
          {label}
        </p>
        <p className="text-xl font-nunito font-bold text-charbon truncate">
          {value}
        </p>
      </div>
    </GlassCard>
  );
};

export default DashboardStatCard;
