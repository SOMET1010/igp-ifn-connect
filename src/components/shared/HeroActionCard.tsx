import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroActionCardProps {
  /** Titre principal */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Emoji ou icône 3D */
  emoji: string;
  /** Variante de couleur du gradient */
  variant: "orange" | "violet" | "green" | "blue";
  /** Callback au clic */
  onClick: () => void;
  /** Désactiver la carte */
  disabled?: boolean;
  /** Classes additionnelles */
  className?: string;
}

const gradients = {
  orange: "from-orange-sanguine to-terre-battue",
  violet: "from-violet-500 to-violet-700",
  green: "from-vert-manioc to-green-700",
  blue: "from-blue-500 to-blue-700",
};

const glowColors = {
  orange: "shadow-orange-sanguine/40",
  violet: "shadow-violet-500/40",
  green: "shadow-vert-manioc/40",
  blue: "shadow-blue-500/40",
};

/**
 * Carte d'action héroïque avec gradient et illustration 3D
 * Utilisé pour les actions principales (VENDRE, HISTORIQUE, etc.)
 */
export const HeroActionCard: React.FC<HeroActionCardProps> = ({
  title,
  subtitle,
  emoji,
  variant,
  onClick,
  disabled = false,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base
        "relative w-full overflow-hidden rounded-3xl",
        // Gradient background
        `bg-gradient-to-br ${gradients[variant]}`,
        // Shadow et glow
        `shadow-xl ${glowColors[variant]}`,
        // Taille
        "min-h-[140px] p-5",
        // Layout
        "flex items-center justify-between gap-4",
        // Transition et hover
        "transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]",
        // Disabled state
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        className
      )}
      type="button"
    >
      {/* Contenu texte */}
      <div className="flex-1 text-left z-10">
        <h3 className="text-2xl sm:text-3xl font-nunito font-extrabold text-white tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-white/80 text-sm mt-1 font-inter">
            {subtitle}
          </p>
        )}
      </div>

      {/* Emoji illustration 3D */}
      <div className="flex-shrink-0 text-5xl sm:text-6xl z-10 transform hover:scale-110 transition-transform">
        {emoji}
      </div>

      {/* Flèche animée */}
      <div className="absolute bottom-4 right-4 z-10">
        <ChevronRight 
          className="w-8 h-8 text-white/70 animate-[arrow-bounce_1s_ease-in-out_infinite]" 
        />
      </div>

      {/* Overlay décoratif */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(circle at top right, white 0%, transparent 60%)"
        }}
      />
    </button>
  );
};

export default HeroActionCard;
