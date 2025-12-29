import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import { LanguageToggle } from './LanguageToggle';
import { NotificationToggle } from './NotificationToggle';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';
import logoAnsut from '@/assets/logo-ansut.png';
import logoDge from '@/assets/logo-dge.png';

interface EnhancedHeaderProps {
  /** Titre principal */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Afficher le bouton retour */
  showBack?: boolean;
  /** URL de retour (défaut: -1 = page précédente) */
  backTo?: string;
  /** Afficher les logos institutionnels (DGE/ANSUT) */
  showLogos?: boolean;
  /** Afficher le dropdown de notifications */
  showNotifications?: boolean;
  /** Afficher le toggle FR/Dioula */
  showLanguageToggle?: boolean;
  /** Afficher le toggle de thème */
  showThemeToggle?: boolean;
  /** Afficher le toggle push notifications */
  showPushToggle?: boolean;
  /** Afficher le bouton déconnexion */
  showSignOut?: boolean;
  /** Callback déconnexion */
  onSignOut?: () => void;
  /** Contenu à droite (badges, indicateurs, etc.) */
  rightContent?: React.ReactNode;
  /** Variante de style */
  variant?: 'default' | 'primary' | 'institutional';
}

export const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  backTo,
  showLogos = false,
  showNotifications = true,
  showLanguageToggle = true,
  showThemeToggle = true,
  showPushToggle = false,
  showSignOut = false,
  onSignOut,
  rightContent,
  variant = 'default',
}) => {
  const navigate = useNavigate();
  const { triggerTap } = useSensoryFeedback();

  const handleBack = () => {
    triggerTap();
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const handleSignOut = () => {
    triggerTap();
    onSignOut?.();
  };

  const isPrimary = variant === 'primary';
  const isInstitutional = variant === 'institutional';

  return (
    <header
      className={`sticky top-0 z-40 ${
        isPrimary
          ? 'bg-primary text-primary-foreground'
          : isInstitutional
          ? 'bg-gradient-to-r from-primary/10 via-background to-orange-500/10 border-b border-border'
          : 'bg-card border-b border-border'
      }`}
    >
      {/* Logos institutionnels (optionnel) */}
      {showLogos && (
        <div className="flex items-center justify-center gap-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <img src={logoDge} alt="Direction Générale des Entreprises" className="h-8 object-contain" />
          <div className="w-px h-6 bg-border" />
          <img src={logoAnsut} alt="ANSUT" className="h-8 object-contain" />
        </div>
      )}

      {/* Header principal */}
      <div className="flex items-center justify-between p-3 max-w-5xl mx-auto">
        {/* Gauche: Retour + Titre */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className={`shrink-0 h-9 w-9 ${
                isPrimary
                  ? 'text-primary-foreground hover:bg-primary-foreground/10'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            {subtitle && (
              <p
                className={`text-[10px] uppercase tracking-wider truncate ${
                  isPrimary ? 'opacity-70' : 'text-muted-foreground'
                }`}
              >
                {subtitle}
              </p>
            )}
            <h1
              className={`text-base font-semibold truncate leading-tight ${
                isPrimary ? '' : 'text-foreground'
              }`}
            >
              {title}
            </h1>
          </div>
        </div>

        {/* Droite: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {rightContent}
          
          {showNotifications && <NotificationDropdown />}
          
          {showLanguageToggle && <LanguageToggle variant="pill" />}
          
          {showThemeToggle && !isPrimary && <ThemeToggle />}

          {showPushToggle && <NotificationToggle showLabel={false} />}

          {showSignOut && onSignOut && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className={`h-9 w-9 ${
                isPrimary
                  ? 'text-primary-foreground hover:bg-primary-foreground/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
