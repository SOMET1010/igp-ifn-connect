import React from "react";
import { WaxPattern } from "./WaxPattern";

interface ImmersiveBackgroundProps {
  /** Variante du fond */
  variant?: "warm-gradient" | "market-blur";
  /** URL de l'image de fond (pour variant market-blur) */
  backgroundImageUrl?: string | null;
  /** Afficher le pattern Wax */
  showWaxPattern?: boolean;
  /** Afficher les blobs décoratifs */
  showBlobs?: boolean;
  /** Classes additionnelles */
  className?: string;
}

/**
 * Fond de page immersif "L'Âme du Marché"
 * Gradient chaud + WaxPattern + blobs optionnels
 */
export const ImmersiveBackground: React.FC<ImmersiveBackgroundProps> = ({
  variant = "warm-gradient",
  backgroundImageUrl,
  showWaxPattern = true,
  showBlobs = true,
  className = "",
}) => {
  const showMarketImage = variant === "market-blur" && backgroundImageUrl;

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

      {/* Gradient de base chaud (fallback ou warm-gradient) */}
      {!showMarketImage && (
        <div 
          className="absolute inset-0"
          style={{
            background: variant === "warm-gradient" 
              ? "linear-gradient(135deg, hsl(36 100% 95%) 0%, hsl(28 81% 90%) 50%, hsl(36 100% 92%) 100%)"
              : "linear-gradient(180deg, hsl(28 81% 85%) 0%, hsl(36 100% 95%) 100%)"
          }}
        />
      )}

      {/* Overlay chaleureux subtil */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at top, hsl(27 100% 38% / 0.15) 0%, transparent 70%)"
        }}
      />

      {/* Wax Pattern */}
      {showWaxPattern && (
        <WaxPattern 
          variant="kente" 
          opacity={0.06} 
          className="absolute inset-0"
        />
      )}

      {/* Blobs décoratifs */}
      {showBlobs && (
        <>
          {/* Blob en haut à droite */}
          <div 
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl"
            style={{ background: "hsl(28 81% 52% / 0.2)" }}
          />
          {/* Blob en bas à gauche */}
          <div 
            className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full blur-3xl"
            style={{ background: "hsl(27 100% 38% / 0.15)" }}
          />
          {/* Blob central subtil */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
            style={{ background: "hsl(36 100% 95% / 0.5)" }}
          />
        </>
      )}
    </div>
  );
};

export default ImmersiveBackground;
