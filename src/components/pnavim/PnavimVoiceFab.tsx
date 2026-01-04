import React from "react";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type FabState = "idle" | "listening" | "processing" | "disabled";

interface PnavimVoiceFabProps {
  /** État du FAB */
  state?: FabState;
  /** Callback au clic */
  onClick?: () => void;
  /** Position */
  position?: "bottom-right" | "bottom-center" | "bottom-left";
  /** Taille */
  size?: "md" | "lg" | "xl";
  /** Classes additionnelles */
  className?: string;
}

const positionStyles = {
  "bottom-right": "fixed bottom-20 right-4",
  "bottom-center": "fixed bottom-20 left-1/2 -translate-x-1/2",
  "bottom-left": "fixed bottom-20 left-4",
};

const sizeStyles = {
  md: "w-14 h-14",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

const iconSizes = {
  md: "w-6 h-6",
  lg: "w-7 h-7",
  xl: "w-8 h-8",
};

/**
 * Bouton flottant micro PNAVIM (FAB)
 * Animation pulse quand idle, glow vert quand écoute
 */
export const PnavimVoiceFab: React.FC<PnavimVoiceFabProps> = ({
  state = "idle",
  onClick,
  position = "bottom-right",
  size = "lg",
  className,
}) => {
  const { triggerTap, triggerLight } = useSensoryFeedback();
  const prefersReducedMotion = useReducedMotion();

  const handleClick = () => {
    if (state !== "processing" && state !== "disabled") {
      if (state === "idle") {
        triggerTap();
      } else {
        triggerLight();
      }
      onClick?.();
    }
  };

  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isDisabled = state === "disabled";

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled || isProcessing}
      className={cn(
        // Position
        positionStyles[position],
        // Taille
        sizeStyles[size],
        // Base
        "rounded-full flex items-center justify-center z-50",
        "border-4 border-white shadow-2xl",
        // État idle - orange avec pulse
        state === "idle" && [
          "bg-gradient-to-br from-orange-sanguine to-terre-battue",
          !prefersReducedMotion && "animate-pulse-slow",
        ],
        // État listening - vert avec glow
        isListening && [
          "bg-gradient-to-br from-vert-manioc to-green-dark",
          "shadow-glow-green",
        ],
        // État processing
        isProcessing && "bg-muted cursor-wait",
        // État disabled
        isDisabled && "bg-muted/50 cursor-not-allowed opacity-50",
        // Transitions
        !prefersReducedMotion && "transition-all duration-300",
        // Hover
        !isProcessing && !isDisabled && "hover:scale-105 active:scale-95",
        className
      )}
      aria-label={isListening ? "Arrêter l'écoute" : "Parler"}
    >
      {/* Ring animé pour listening */}
      {isListening && !prefersReducedMotion && (
        <>
          <span className="absolute inset-0 rounded-full bg-vert-manioc/30 animate-ping" />
          <span className="absolute inset-0 rounded-full bg-vert-manioc/20 animate-pulse" />
        </>
      )}

      {/* Icône */}
      {isProcessing ? (
        <Loader2 className={cn(iconSizes[size], "text-muted-foreground animate-spin")} />
      ) : isDisabled ? (
        <MicOff className={cn(iconSizes[size], "text-muted-foreground")} />
      ) : (
        <Mic className={cn(iconSizes[size], "text-white relative z-10")} />
      )}
    </button>
  );
};

export default PnavimVoiceFab;
