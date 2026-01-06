import React from "react";
import { cn } from "@/lib/utils";

interface TantieMascotProps {
  /** Message dans la bulle de dialogue */
  message: string;
  /** Taille de la mascotte */
  variant?: "small" | "large";
  /** Nom du marchand pour personnalisation */
  merchantName?: string;
  /** URL de l'image de la mascotte (optionnel, fallback sur emoji) */
  imageUrl?: string | null;
  /** Classes additionnelles */
  className?: string;
  /** Callback au clic sur la mascotte */
  onClick?: () => void;
}

/**
 * Widget mascotte "Tantie Sagesse" avec bulle de dialogue
 * Personnage chaleureux qui accueille l'utilisateur
 */
export const TantieMascot: React.FC<TantieMascotProps> = ({
  message,
  variant = "large",
  merchantName,
  imageUrl,
  className,
  onClick,
}) => {
  const isSmall = variant === "small";
  
  // Remplacer {nom} par le nom du marchand
  const displayMessage = merchantName 
    ? message.replace("{nom}", merchantName)
    : message.replace("{nom} !", "").replace("Bonjour  ", "Bonjour !");

  return (
    <div 
      className={cn(
        "flex items-start gap-3 animate-fade-in",
        isSmall ? "flex-row" : "flex-col sm:flex-row items-center sm:items-start",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Avatar Tantie Sagesse - Image ou Emoji fallback */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Tantie Sagesse"
          className={cn(
            "flex-shrink-0 rounded-full object-cover shadow-lg",
            "ring-4 ring-orange-sanguine/30 bg-gradient-to-br from-orange-sanguine to-terre-battue",
            isSmall ? "w-14 h-14" : "w-20 h-20"
          )}
          onError={(e) => {
            // Fallback: cacher l'image si erreur de chargement
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div 
          className={cn(
            "flex-shrink-0 rounded-full flex items-center justify-center shadow-lg",
            "bg-gradient-to-br from-orange-sanguine to-terre-battue",
            isSmall ? "w-14 h-14 text-2xl" : "w-20 h-20 text-4xl"
          )}
        >
          <span role="img" aria-label="Tantie Sagesse">👩🏾‍🌾</span>
        </div>
      )}

      {/* Bulle de dialogue */}
      <div 
        className={cn(
          "relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-orange-sanguine/20",
          isSmall ? "px-3 py-2 max-w-[200px]" : "px-4 py-3 max-w-xs sm:max-w-sm"
        )}
      >
        {/* Triangle de la bulle */}
        <div 
          className={cn(
            "absolute w-3 h-3 bg-white/90 border-l border-b border-orange-sanguine/20 transform rotate-45",
            isSmall 
              ? "-left-1.5 top-4" 
              : "sm:-left-1.5 sm:top-6 -top-1.5 left-6 sm:rotate-45 -rotate-[135deg]"
          )}
        />
        
        <p 
          className={cn(
            "relative z-10 font-inter",
            isSmall ? "text-sm text-charbon" : "text-base text-charbon leading-relaxed"
          )}
        >
          {displayMessage}
        </p>
      </div>
    </div>
  );
};
