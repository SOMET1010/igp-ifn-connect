import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

interface UnifiedHeaderProps {
  /** Titre principal */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Afficher le bouton retour */
  showBack?: boolean;
  /** URL de retour (défaut: -1 = page précédente) */
  backTo?: string;
  /** Afficher le bouton déconnexion */
  showSignOut?: boolean;
  /** Callback déconnexion */
  onSignOut?: () => void;
  /** Contenu à droite (badges, indicateurs, etc.) */
  rightContent?: React.ReactNode;
  /** Variante de style */
  variant?: 'default' | 'primary';
}

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  backTo,
  showSignOut = false,
  onSignOut,
  rightContent,
  variant = 'default',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const isPrimary = variant === 'primary';

  return (
    <header
      className={`sticky top-0 z-40 ${
        isPrimary
          ? 'bg-primary text-primary-foreground'
          : 'bg-card border-b border-border'
      }`}
    >
      <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className={`shrink-0 ${
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
                className={`text-xs uppercase tracking-wide truncate ${
                  isPrimary ? 'opacity-80' : 'text-muted-foreground'
                }`}
              >
                {subtitle}
              </p>
            )}
            <h1
              className={`text-lg font-semibold truncate ${
                isPrimary ? '' : 'text-foreground'
              }`}
            >
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {rightContent}
          {!isPrimary && <ThemeToggle />}
          {showSignOut && onSignOut && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSignOut}
              className={`h-8 w-8 ${
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
