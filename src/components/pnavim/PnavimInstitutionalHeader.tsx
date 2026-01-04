import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Volume2, VolumeX, User, Menu } from 'lucide-react';
import { PnavimTricolorLine } from './PnavimTricolorLine';
import { PnavimZoomControls } from './PnavimZoomControls';
import { PnavimNavMenu } from './PnavimNavMenu';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageCode } from '@/lib/translations';

// Icônes de drapeaux pour les langues
const languageFlags: Record<string, string> = {
  fr: '🇫🇷',
  dioula: '🇨🇮',
  baoule: '🇨🇮',
  bete: '🇨🇮',
  senoufo: '🇨🇮',
};

interface PnavimInstitutionalHeaderProps {
  showNavigation?: boolean;
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

/**
 * Header institutionnel PNAVIM complet
 * Branding + Navigation + Accessibilité + Ligne tricolore
 */
export const PnavimInstitutionalHeader: React.FC<PnavimInstitutionalHeaderProps> = ({
  showNavigation = true,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { triggerTap } = useSensoryFeedback();
  const { language, setLanguage, languages } = useLanguage();

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
              {/* Logo P */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-sanguine to-terre-battue flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              
              {/* Title */}
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-extrabold text-vert-manioc leading-none">
                  PNAVIM-CI
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight hidden sm:block">
                  Plateforme Nationale des Acteurs du Vivrier
                </span>
              </div>
            </Link>

            {/* Center: Navigation (Desktop only) */}
            {showNavigation && (
              <PnavimNavMenu className="mx-4" />
            )}

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              
              {/* Zoom Controls - Desktop only */}
              {showAccessibility && (
                <div className="hidden md:block">
                  <PnavimZoomControls />
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
                        "w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all",
                        language === lang.code
                          ? "bg-card shadow-sm scale-110"
                          : "hover:bg-card/50 opacity-60 hover:opacity-100"
                      )}
                      title={lang.name}
                      aria-label={`Changer la langue en ${lang.name}`}
                      aria-pressed={language === lang.code}
                    >
                      {lang.symbol || languageFlags[lang.code] || '🌍'}
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
                      ? "bg-vert-manioc text-white" 
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

              {/* Login Button */}
              {showLoginButton && (
                <button
                  onClick={onLoginClick}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-charbon text-white rounded-full text-sm font-medium hover:bg-charbon/90 transition-colors shadow-md"
                >
                  <User className="h-4 w-4" />
                  <span>Se connecter</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              {showNavigation && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors"
                  aria-label="Menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <Menu className="h-5 w-5 text-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {showNavigation && mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <PnavimNavMenu variant="vertical" />
              
              {/* Mobile Login */}
              {showLoginButton && (
                <button
                  onClick={onLoginClick}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-charbon text-white rounded-xl text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  <span>Se connecter</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tricolor Line */}
      <PnavimTricolorLine />
    </header>
  );
};

export default PnavimInstitutionalHeader;
