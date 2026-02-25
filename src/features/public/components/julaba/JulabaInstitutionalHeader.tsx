import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib';
import { Volume2, VolumeX, User, Minus, Plus } from 'lucide-react';
import { useSensoryFeedback } from '@/shared/hooks';
import { useLanguage } from '@/shared/contexts';
import { useDesignMode } from '@/shared/contexts';
import { LanguageCode } from '@/shared/lib';

interface PnavimInstitutionalHeaderProps {
  showAccessibility?: boolean;
  showAudioToggle?: boolean;
  showLanguageSelector?: boolean;
  showLoginButton?: boolean;
  isAudioEnabled?: boolean;
  onAudioToggle?: () => void;
  onLoginClick?: () => void;
  variant?: 'full' | 'compact';
  className?: string;
}

export const PnavimInstitutionalHeader: React.FC<PnavimInstitutionalHeaderProps> = ({
  showAccessibility = true,
  showAudioToggle = true,
  showLanguageSelector = true,
  showLoginButton = true,
  isAudioEnabled: controlledAudioEnabled,
  onAudioToggle,
  onLoginClick,
  variant = 'full',
  className,
}) => {
  const [internalAudioEnabled, setInternalAudioEnabled] = useState(true);
  const [zoom, setZoom] = useState(100);
  const { triggerTap } = useSensoryFeedback();
  const { language, setLanguage, languages } = useLanguage();
  const { isInstitutional } = useDesignMode();

  const audioEnabled = controlledAudioEnabled ?? internalAudioEnabled;

  const handleAudioToggle = () => {
    triggerTap();
    if (onAudioToggle) {
      onAudioToggle();
    } else {
      setInternalAudioEnabled(!internalAudioEnabled);
    }
  };

  const handleLanguageChange = (langCode: LanguageCode) => {
    triggerTap();
    setLanguage(langCode);
  };

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.min(150, Math.max(80, newZoom));
    setZoom(clampedZoom);
    document.documentElement.style.fontSize = `${clampedZoom}%`;
    triggerTap();
  };

  const isCompact = variant === 'compact';

  return (
    <header className={cn("sticky top-0 z-50", className)}>
      {/* Main header bar */}
      <div className="bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className={cn(
            "flex items-center justify-between",
            isCompact ? "h-14" : "h-16"
          )}>
            
            {/* Left: Branding */}
            <Link to="/" className="flex items-center gap-2 group">
              {/* Logo - adapté au mode */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform",
                isInstitutional
                  ? "bg-primary"
                  : "bg-gradient-to-br from-orange-sanguine to-terre-battue"
              )}>
                <span className="text-primary-foreground font-bold text-lg">J</span>
              </div>
              
              {/* Title */}
              <div className="flex flex-col">
                <span className={cn(
                  "text-sm sm:text-base font-extrabold leading-none",
                  isInstitutional ? "text-primary" : "text-vert-manioc"
                )}>
                  JÙLABA
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight hidden sm:block">
                  {isInstitutional
                    ? 'Plateforme Nationale · ANSUT'
                    : 'Ton djè est bien géré · par ICONE'}
                </span>
              </div>
            </Link>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              
              {/* Inline Zoom Controls - Desktop only */}
              {showAccessibility && (
                <div 
                  className="hidden md:flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1"
                  role="group"
                  aria-label="Contrôles de zoom"
                >
                  <button
                    onClick={() => handleZoomChange(zoom - 10)}
                    disabled={zoom <= 80}
                    className="p-1 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Diminuer la taille du texte"
                  >
                    <Minus className="h-3.5 w-3.5 text-foreground" />
                  </button>
                  
                  <span className="text-xs font-medium text-foreground min-w-[40px] text-center">
                    {zoom}%
                  </span>
                  
                  <button
                    onClick={() => handleZoomChange(zoom + 10)}
                    disabled={zoom >= 150}
                    className="p-1 rounded-full hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Augmenter la taille du texte"
                  >
                    <Plus className="h-3.5 w-3.5 text-foreground" />
                  </button>
                </div>
              )}

              {/* Language Selector */}
              {showLanguageSelector && (
                <div className="flex items-center gap-0.5 bg-muted/50 rounded-full p-0.5">
                  {languages.slice(0, 3).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={cn(
                        "w-8 h-7 rounded-full flex items-center justify-center text-[10px] font-bold tracking-tight transition-all",
                        language === lang.code
                          ? "bg-card shadow-sm scale-110 text-foreground"
                          : "hover:bg-card/50 opacity-60 hover:opacity-100 text-muted-foreground"
                      )}
                      title={lang.name}
                      aria-label={`Changer la langue en ${lang.name}`}
                      aria-pressed={language === lang.code}
                    >
                      {lang.symbol}
                    </button>
                  ))}
                </div>
              )}

              {/* Audio Toggle */}
              {showAudioToggle && (
                <button
                  onClick={handleAudioToggle}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                    audioEnabled 
                      ? isInstitutional ? "bg-primary text-primary-foreground" : "bg-vert-manioc text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                  aria-label={audioEnabled ? "Désactiver l'audio" : "Activer l'audio"}
                  aria-pressed={audioEnabled}
                >
                  {audioEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </button>
              )}

              {/* Login Button - adapté au mode */}
              {showLoginButton && (
                <button
                  onClick={onLoginClick}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-white rounded-full text-sm font-medium transition-colors shadow-md min-h-[44px]",
                    isInstitutional
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-orange-sanguine hover:bg-orange-sanguine/90"
                  )}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Se connecter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accent Line - adapté au mode */}
      <div 
        className="h-1 w-full"
        style={{
          background: isInstitutional
            ? 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 50%, hsl(var(--accent)) 100%)'
            : 'linear-gradient(90deg, #E67E22 0%, #E67E22 33%, #FFFFFF 33%, #FFFFFF 66%, #2E7D32 66%, #2E7D32 100%)'
        }}
        aria-hidden="true"
      />
    </header>
  );
};

export default PnavimInstitutionalHeader;
