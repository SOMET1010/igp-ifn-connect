import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { generateSpeech } from "@/shared/services/tts/elevenlabsTts";
import { PNAVIM_VOICES } from "@/shared/config/voiceConfig";

type PersonaType = "TANTIE" | "AGENT" | "COOP";
type VariantType = "rich" | "solid" | "glass";

interface PnavimRoleCardProps {
  persona: PersonaType;
  variant?: VariantType;
  size?: "sm" | "md" | "lg" | "xl";
  link: string;
  showWelcomeBadge?: boolean;
  badgeText?: string;
  avatarStatus?: "online" | "offline";
  onVoiceClick?: () => void;
  audioMessage?: string;
  className?: string;
}

const personaConfig: Record<PersonaType, {
  emoji: string;
  title: string;
  subtitle: string;
  voiceId: string;
}> = {
  TANTIE: {
    emoji: "🧺",
    title: "Je suis Marchand",
    subtitle: "Encaisser, gérer mon stock",
    voiceId: PNAVIM_VOICES.TANTIE_SAGESSE,
  },
  AGENT: {
    emoji: "👨🏾‍💼",
    title: "Agent Terrain",
    subtitle: "Valider, accompagner",
    voiceId: PNAVIM_VOICES.GBAIRAI,
  },
  COOP: {
    emoji: "🌾",
    title: "Coopérative",
    subtitle: "Vendre aux marchands",
    voiceId: PNAVIM_VOICES.TANTIE_SAGESSE,
  },
};

const variantStyles: Record<VariantType, {
  card: string;
  iconBg: string;
  textColor: string;
  subtitleColor: string;
  audioBtn: string;
}> = {
  rich: {
    card: "bg-gradient-to-br from-orange-sanguine via-terre-battue to-orange-sanguine/90 border-orange-sanguine/30",
    iconBg: "bg-white/20",
    textColor: "text-white",
    subtitleColor: "text-white/80",
    audioBtn: "bg-white hover:bg-white/90 text-orange-sanguine",
  },
  solid: {
    card: "bg-vert-manioc border-vert-manioc/50",
    iconBg: "bg-white/20",
    textColor: "text-white",
    subtitleColor: "text-white/80",
    audioBtn: "bg-white/90 hover:bg-white text-vert-manioc",
  },
  glass: {
    card: "bg-gradient-to-br from-accent/15 via-white/90 to-white/95 backdrop-blur-xl border-accent/50 hover:border-accent",
    iconBg: "bg-accent/20",
    textColor: "text-charbon",
    subtitleColor: "text-charbon/60",
    audioBtn: "bg-white/80 hover:bg-white text-orange-sanguine border border-charbon/10",
  },
};

const sizeStyles = {
  sm: {
    card: "p-4",
    emoji: "text-3xl",
    title: "text-base",
    subtitle: "text-sm",
    iconWrapper: "w-14 h-14",
    badge: "text-xs px-2 py-0.5",
  },
  md: {
    card: "p-5",
    emoji: "text-4xl",
    title: "text-lg",
    subtitle: "text-sm",
    iconWrapper: "w-16 h-16",
    badge: "text-xs px-2.5 py-1",
  },
  lg: {
    card: "p-5",
    emoji: "text-5xl",
    title: "text-xl",
    subtitle: "text-base",
    iconWrapper: "w-20 h-20",
    badge: "text-sm px-3 py-1",
  },
  xl: {
    card: "p-6",
    emoji: "text-6xl",
    title: "text-2xl",
    subtitle: "text-base",
    iconWrapper: "w-24 h-24",
    badge: "text-sm px-3 py-1.5",
  },
};

/**
 * Carte rôle persona PNAVIM avec variantes visuelles
 * Utilise exclusivement les voix ElevenLabs custom
 */
export const PnavimRoleCard: React.FC<PnavimRoleCardProps> = ({
  persona,
  variant = "glass",
  size = "md",
  link,
  showWelcomeBadge = false,
  badgeText = "Bienvenue",
  avatarStatus,
  onVoiceClick,
  audioMessage,
  className,
}) => {
  const navigate = useNavigate();
  const { triggerTap, triggerSuccess } = useSensoryFeedback();
  const prefersReducedMotion = useReducedMotion();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  
  const config = personaConfig[persona];
  const styles = sizeStyles[size];
  const variantStyle = variantStyles[variant];

  const handleClick = () => {
    triggerSuccess();
    navigate(link);
  };

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const handleVoice = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerTap();

    if (onVoiceClick) {
      onVoiceClick();
      return;
    }

    if (!audioMessage) return;

    // Si déjà en lecture, arrêter
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoading(true);

    try {
      // Utiliser la voix ElevenLabs selon le persona
      const voiceId = config.voiceId;
      const audioBlob = await generateSpeech(audioMessage, { voiceId });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
        if (navigator.vibrate) navigator.vibrate(30);
      };

      audio.onended = () => {
        setIsPlaying(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
      };

      audio.onerror = () => {
        console.error('Erreur lecture audio ElevenLabs');
        setIsLoading(false);
        setIsPlaying(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.error('Erreur ElevenLabs TTS:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [audioMessage, config.voiceId, triggerTap, isPlaying, stopAudio, onVoiceClick]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        // Base
        "relative w-full rounded-3xl border-2 overflow-hidden",
        variantStyle.card,
        styles.card,
        // Ombre
        "shadow-lg hover:shadow-xl",
        // Transitions
        !prefersReducedMotion && "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        prefersReducedMotion && "active:opacity-80",
        // Layout
        "flex flex-col gap-3 text-left",
        className
      )}
    >
      {/* Badge Bienvenue */}
      {showWelcomeBadge && (
        <div className={cn(
          "absolute top-3 left-3 rounded-full bg-white/90 font-semibold text-orange-sanguine shadow-sm",
          styles.badge
        )}>
          {badgeText}
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex items-center gap-4 mt-auto">
        {/* Icône Emoji avec status optionnel */}
        <div className="relative shrink-0">
          <div className={cn(
            "flex items-center justify-center rounded-2xl",
            variantStyle.iconBg,
            styles.iconWrapper
          )}>
            <span className={styles.emoji} role="img" aria-label={config.title}>
              {config.emoji}
            </span>
          </div>
          
          {/* Badge status (online/offline) */}
          {avatarStatus && (
            <div className={cn(
              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white",
              avatarStatus === "online" ? "bg-green-500" : "bg-gray-400"
            )} />
          )}
        </div>

        {/* Contenu textuel */}
        <div className="flex-1 min-w-0">
          <h2 className={cn(
            "font-nunito font-extrabold leading-tight",
            variantStyle.textColor,
            styles.title
          )}>
            {config.title}
          </h2>
          <p className={cn(
            "mt-1",
            variantStyle.subtitleColor,
            styles.subtitle
          )}>
            {config.subtitle}
          </p>
        </div>

        {/* Bouton Audio */}
        <button
          onClick={handleVoice}
          disabled={isLoading}
          className={cn(
            "shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-md",
            variantStyle.audioBtn,
            "active:scale-90 transition-transform disabled:opacity-50"
          )}
          aria-label={isPlaying ? "Arrêter" : "Écouter"}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </button>
  );
};

export default PnavimRoleCard;
