import React from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type PersonaType = "TANTIE" | "AGENT" | "COOP";

interface PnavimRoleCardProps {
  /** Type de persona */
  persona: PersonaType;
  /** Taille de la carte */
  size?: "sm" | "md" | "lg" | "xl";
  /** Lien de navigation */
  link: string;
  /** Callback audio */
  onVoiceClick?: () => void;
  /** Message audio à jouer */
  audioMessage?: string;
  /** Classes additionnelles */
  className?: string;
}

const personaConfig: Record<PersonaType, {
  emoji: string;
  title: string;
  subtitle: string;
  bgGradient: string;
  borderColor: string;
  iconBg: string;
}> = {
  TANTIE: {
    emoji: "🧺",
    title: "Je suis Marchand",
    subtitle: "Encaisser, gérer mon stock",
    bgGradient: "from-orange-sanguine/20 via-white/90 to-white/95",
    borderColor: "border-orange-sanguine/50 hover:border-orange-sanguine",
    iconBg: "bg-orange-sanguine/20",
  },
  AGENT: {
    emoji: "👨🏾‍💼",
    title: "Agent Terrain",
    subtitle: "Valider, accompagner",
    bgGradient: "from-vert-manioc/15 via-white/90 to-white/95",
    borderColor: "border-vert-manioc/50 hover:border-vert-manioc",
    iconBg: "bg-vert-manioc/20",
  },
  COOP: {
    emoji: "🌾",
    title: "Coopérative",
    subtitle: "Vendre aux marchands",
    bgGradient: "from-accent/15 via-white/90 to-white/95",
    borderColor: "border-accent/50 hover:border-accent",
    iconBg: "bg-accent/20",
  },
};

const sizeStyles = {
  sm: {
    card: "p-4",
    emoji: "text-4xl",
    title: "text-lg",
    subtitle: "text-sm",
    iconWrapper: "w-16 h-16",
  },
  md: {
    card: "p-5",
    emoji: "text-5xl",
    title: "text-xl",
    subtitle: "text-base",
    iconWrapper: "w-20 h-20",
  },
  lg: {
    card: "p-6",
    emoji: "text-6xl",
    title: "text-2xl",
    subtitle: "text-base",
    iconWrapper: "w-24 h-24",
  },
  xl: {
    card: "p-8",
    emoji: "text-7xl",
    title: "text-3xl",
    subtitle: "text-lg",
    iconWrapper: "w-28 h-28",
  },
};

/**
 * Carte rôle persona PNAVIM
 * Grande carte cliquable avec emoji, titre et sous-titre
 * Bouton audio intégré
 */
export const PnavimRoleCard: React.FC<PnavimRoleCardProps> = ({
  persona,
  size = "md",
  link,
  onVoiceClick,
  audioMessage,
  className,
}) => {
  const navigate = useNavigate();
  const { triggerTap, triggerSuccess } = useSensoryFeedback();
  const prefersReducedMotion = useReducedMotion();
  
  const config = personaConfig[persona];
  const styles = sizeStyles[size];

  const handleClick = () => {
    triggerSuccess();
    navigate(link);
  };

  const handleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerTap();
    if (onVoiceClick) {
      onVoiceClick();
    } else if (audioMessage && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(audioMessage);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        // Base glassmorphism
        "relative w-full rounded-3xl border-2",
        prefersReducedMotion ? "bg-white/95" : "bg-gradient-to-br backdrop-blur-xl",
        config.bgGradient,
        config.borderColor,
        styles.card,
        // Ombre
        "shadow-lg hover:shadow-xl",
        // Transitions
        !prefersReducedMotion && "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        prefersReducedMotion && "active:opacity-80",
        // Layout
        "flex items-center gap-4 text-left",
        className
      )}
    >
      {/* Icône Emoji */}
      <div className={cn(
        "flex items-center justify-center rounded-2xl shrink-0",
        config.iconBg,
        styles.iconWrapper
      )}>
        <span className={styles.emoji} role="img" aria-label={config.title}>
          {config.emoji}
        </span>
      </div>

      {/* Contenu textuel */}
      <div className="flex-1 min-w-0">
        <h2 className={cn(
          "font-nunito font-extrabold text-charbon leading-tight",
          styles.title
        )}>
          {config.title}
        </h2>
        <p className={cn(
          "text-charbon/60 mt-1",
          styles.subtitle
        )}>
          {config.subtitle}
        </p>
      </div>

      {/* Bouton Audio */}
      <button
        onClick={handleVoice}
        className={cn(
          "shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
          "bg-white/80 border border-charbon/10 shadow",
          "hover:bg-white active:scale-90 transition-transform"
        )}
        aria-label="Écouter"
      >
        <Volume2 className="w-5 h-5 text-orange-sanguine" />
      </button>
    </button>
  );
};

export default PnavimRoleCard;
