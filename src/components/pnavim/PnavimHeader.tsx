import React from "react";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageCode, LANGUAGES } from "@/lib/translations";

interface PnavimHeaderProps {
  /** Titre (optionnel) */
  title?: string;
  /** Afficher le sélecteur de langue */
  showLanguageSelector?: boolean;
  /** Afficher le toggle audio */
  showAudioToggle?: boolean;
  /** État audio */
  isAudioEnabled?: boolean;
  /** Toggle audio callback */
  onAudioToggle?: () => void;
  /** Classes additionnelles */
  className?: string;
}

/**
 * Header minimaliste PNAVIM
 * Logos institutionnels, langue par icônes, toggle audio
 */
export const PnavimHeader: React.FC<PnavimHeaderProps> = ({
  title,
  showLanguageSelector = true,
  showAudioToggle = false,
  isAudioEnabled = true,
  onAudioToggle,
  className,
}) => {
  const { language, setLanguage } = useLanguage();

  // Prendre les 3 premières langues
  const displayLanguages = LANGUAGES.slice(0, 3);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-40",
      "bg-white/80 backdrop-blur-lg border-b border-white/20",
      "px-4 py-3",
      className
    )}>
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Logos institutionnels */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-charbon/70 bg-orange-sanguine/10 px-2 py-1 rounded">
            PNAVIM
          </span>
        </div>

        {/* Titre (si fourni) */}
        {title && (
          <h1 className="text-lg font-nunito font-bold text-charbon absolute left-1/2 -translate-x-1/2">
            {title}
          </h1>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle audio */}
          {showAudioToggle && (
            <button
              onClick={onAudioToggle}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                "transition-colors",
                isAudioEnabled 
                  ? "bg-vert-manioc/20 text-vert-manioc" 
                  : "bg-muted text-muted-foreground"
              )}
              aria-label={isAudioEnabled ? "Désactiver le son" : "Activer le son"}
            >
              {isAudioEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Sélecteur langue */}
          {showLanguageSelector && (
            <div className="flex items-center gap-1 bg-white/50 rounded-full px-1 py-0.5">
              {displayLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-lg",
                    "transition-all duration-200",
                    language === lang.code
                      ? "bg-orange-sanguine/20 scale-110"
                      : "hover:bg-white/50"
                  )}
                  aria-label={lang.name}
                  title={lang.name}
                >
                  {lang.symbol}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PnavimHeader;
