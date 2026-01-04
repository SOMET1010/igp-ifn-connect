import React from "react";
import { WaxPattern } from "./WaxPattern";

export type TimeVariant = "dawn" | "morning" | "afternoon" | "evening" | "night";

interface ImmersiveBackgroundProps {
  /** Variante du fond */
  variant?: "warm-gradient" | "market-blur" | TimeVariant;
  /** URL de l'image de fond (pour variant market-blur) */
  backgroundImageUrl?: string | null;
  /** Afficher le pattern Wax */
  showWaxPattern?: boolean;
  /** Afficher les blobs décoratifs */
  showBlobs?: boolean;
  /** Classes additionnelles */
  className?: string;
}

// Configuration des gradients temporels
const TIME_GRADIENTS: Record<TimeVariant, {
  gradient: string;
  overlay: string;
  blobs: [string, string, string];
}> = {
  dawn: {
    gradient: "linear-gradient(180deg, hsl(340 40% 90%) 0%, hsl(20 60% 85%) 50%, hsl(30 70% 80%) 100%)",
    overlay: "radial-gradient(ellipse at top, hsl(340 50% 70% / 0.15) 0%, transparent 70%)",
    blobs: ["hsl(340 50% 70% / 0.2)", "hsl(20 60% 60% / 0.15)", "hsl(30 70% 90% / 0.5)"]
  },
  morning: {
    gradient: "linear-gradient(180deg, hsl(45 100% 96%) 0%, hsl(36 100% 90%) 50%, hsl(28 81% 85%) 100%)",
    overlay: "radial-gradient(ellipse at top, hsl(36 100% 50% / 0.2) 0%, transparent 70%)",
    blobs: ["hsl(28 81% 52% / 0.2)", "hsl(27 100% 38% / 0.15)", "hsl(36 100% 95% / 0.5)"]
  },
  afternoon: {
    gradient: "linear-gradient(180deg, hsl(40 100% 95%) 0%, hsl(28 90% 88%) 50%, hsl(20 80% 82%) 100%)",
    overlay: "radial-gradient(ellipse at top, hsl(28 81% 52% / 0.25) 0%, transparent 70%)",
    blobs: ["hsl(20 90% 50% / 0.2)", "hsl(28 81% 44% / 0.18)", "hsl(40 100% 92% / 0.5)"]
  },
  evening: {
    gradient: "linear-gradient(180deg, hsl(25 80% 85%) 0%, hsl(15 70% 70%) 50%, hsl(5 60% 55%) 100%)",
    overlay: "radial-gradient(ellipse at top, hsl(14 100% 50% / 0.2) 0%, transparent 70%)",
    blobs: ["hsl(5 60% 45% / 0.2)", "hsl(15 70% 50% / 0.15)", "hsl(25 80% 80% / 0.4)"]
  },
  night: {
    gradient: "linear-gradient(180deg, hsl(240 40% 20%) 0%, hsl(260 50% 25%) 50%, hsl(280 40% 20%) 100%)",
    overlay: "radial-gradient(ellipse at top, hsl(260 50% 40% / 0.3) 0%, transparent 70%)",
    blobs: ["hsl(240 50% 40% / 0.25)", "hsl(280 40% 35% / 0.2)", "hsl(260 50% 50% / 0.15)"]
  }
};

const isTimeVariant = (variant: string): variant is TimeVariant => {
  return ["dawn", "morning", "afternoon", "evening", "night"].includes(variant);
};

/**
 * Fond de page immersif "L'Âme du Marché"
 * Gradient chaud + WaxPattern + blobs optionnels
 * Supporte les variantes temporelles (dawn, morning, afternoon, evening, night)
 */
export const ImmersiveBackground: React.FC<ImmersiveBackgroundProps> = ({
  variant = "warm-gradient",
  backgroundImageUrl,
  showWaxPattern = true,
  showBlobs = true,
  className = "",
}) => {
  const showMarketImage = variant === "market-blur" && backgroundImageUrl;
  const timeConfig = isTimeVariant(variant) ? TIME_GRADIENTS[variant] : null;

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Image de fond du marché (si disponible) */}
      {showMarketImage && (
        <>
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(8px)",
              transform: "scale(1.1)",
            }}
          />
          {/* Overlay semi-transparent chaleureux sur l'image */}
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, hsl(28 81% 44% / 0.4) 0%, hsl(36 100% 50% / 0.3) 100%)"
            }}
          />
        </>
      )}

      {/* Gradient de base - temporel ou classique */}
      {!showMarketImage && (
        <div 
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: timeConfig 
              ? timeConfig.gradient
              : variant === "warm-gradient" 
                ? "linear-gradient(135deg, hsl(36 100% 95%) 0%, hsl(28 81% 90%) 50%, hsl(36 100% 92%) 100%)"
                : "linear-gradient(180deg, hsl(28 81% 85%) 0%, hsl(36 100% 95%) 100%)"
          }}
        />
      )}

      {/* Overlay - temporel ou classique */}
      <div 
        className="absolute inset-0 opacity-30 transition-all duration-1000"
        style={{
          background: timeConfig 
            ? timeConfig.overlay
            : "radial-gradient(ellipse at top, hsl(27 100% 38% / 0.15) 0%, transparent 70%)"
        }}
      />

      {/* Wax Pattern - opacité réduite la nuit */}
      {showWaxPattern && (
        <WaxPattern 
          variant="kente" 
          opacity={variant === "night" ? 0.03 : 0.06} 
          className="absolute inset-0"
        />
      )}

      {/* Blobs décoratifs - adaptés au moment */}
      {showBlobs && (
        <>
          {/* Blob en haut à droite */}
          <div 
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl transition-all duration-1000"
            style={{ background: timeConfig ? timeConfig.blobs[0] : "hsl(28 81% 52% / 0.2)" }}
          />
          {/* Blob en bas à gauche */}
          <div 
            className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full blur-3xl transition-all duration-1000"
            style={{ background: timeConfig ? timeConfig.blobs[1] : "hsl(27 100% 38% / 0.15)" }}
          />
          {/* Blob central subtil */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl transition-all duration-1000"
            style={{ background: timeConfig ? timeConfig.blobs[2] : "hsl(36 100% 95% / 0.5)" }}
          />
        </>
      )}
    </div>
  );
};

export default ImmersiveBackground;
