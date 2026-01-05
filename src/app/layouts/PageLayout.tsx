/**
 * PageLayout - Template unifié pour toutes les pages
 * 
 * Fournit une structure cohérente avec:
 * - Header contextuel (optionnel)
 * - Breadcrumb automatique
 * - Contenu principal avec gestion d'états (loading/error/empty)
 * - Navigation bottom (pour mobile)
 * - Footer institutionnel (optionnel)
 */

import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { InstitutionalFooter } from '@/components/shared/InstitutionalFooter';
import { UnifiedBottomNav, type NavItem } from '@/components/shared/UnifiedBottomNav';
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateComponents';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  /** Titre de la page (affichage et SEO) */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Fil d'Ariane */
  breadcrumb?: BreadcrumbItem[];
  /** Items de navigation (bottom nav mobile) */
  navItems?: NavItem[];
  /** Afficher le header institutionnel */
  showHeader?: boolean;
  /** Afficher le footer institutionnel */
  showFooter?: boolean;
  /** Afficher le bouton retour */
  showBackButton?: boolean;
  /** Action personnalisée pour le retour */
  onBack?: () => void;
  /** Afficher le bouton audio */
  showAudioButton?: boolean;
  /** État de chargement */
  isLoading?: boolean;
  /** État d'erreur */
  error?: Error | string | null;
  /** Fonction de retry pour les erreurs */
  onRetry?: () => void;
  /** Données vides */
  isEmpty?: boolean;
  /** Message pour l'état vide */
  emptyMessage?: string;
  /** Action pour l'état vide */
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  /** Contenu principal */
  children: React.ReactNode;
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
  /** Padding du contenu */
  contentPadding?: 'none' | 'sm' | 'md' | 'lg';
  /** Max-width du contenu */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const paddingStyles = {
  none: '',
  sm: 'px-2 py-2',
  md: 'px-4 py-4',
  lg: 'px-6 py-6',
};

const maxWidthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

export function PageLayout({
  title,
  subtitle,
  breadcrumb,
  navItems,
  showHeader = false,
  showFooter = false,
  showBackButton = false,
  onBack,
  isLoading = false,
  error = null,
  onRetry,
  isEmpty = false,
  emptyMessage = "Aucune donnée disponible",
  emptyAction,
  children,
  className,
  contentPadding = 'md',
  maxWidth = 'md',
}: PageLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Rendu des états
  const renderContent = () => {
    if (isLoading) {
      return <LoadingState message="Chargement en cours..." />;
    }

    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return (
        <ErrorState 
          message={errorMessage}
          onRetry={onRetry}
        />
      );
    }

    if (isEmpty) {
      return (
        <EmptyState 
          title={emptyMessage}
          actionLabel={emptyAction?.label}
          onAction={emptyAction?.onClick}
        />
      );
    }

    return children;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header institutionnel */}
      {showHeader && (
        <InstitutionalHeader 
          subtitle={title}
          showBackButton={showBackButton}
          onBack={handleBack}
        />
      )}

      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="bg-muted/30 border-b border-border px-4 py-2">
          <div className={cn(maxWidthStyles[maxWidth], 'mx-auto')}>
            <ol className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
              {breadcrumb.map((item, index) => (
                <li key={index} className="flex items-center gap-1 whitespace-nowrap">
                  {index > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                  {item.href ? (
                    <Link 
                      to={item.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}

      {/* Page Header (si pas de header institutionnel mais avec back button) */}
      {!showHeader && showBackButton && (
        <div className="bg-card border-b border-border px-4 py-3">
          <div className={cn(maxWidthStyles[maxWidth], 'mx-auto flex items-center gap-3')}>
            <button 
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main 
        className={cn(
          'flex-1',
          paddingStyles[contentPadding],
          navItems && 'pb-20', // Espace pour la bottom nav
          className
        )}
      >
        <div className={cn(maxWidthStyles[maxWidth], 'mx-auto h-full')}>
          {renderContent()}
        </div>
      </main>

      {/* Footer institutionnel */}
      {showFooter && !navItems && (
        <InstitutionalFooter />
      )}

      {/* Bottom Navigation */}
      {navItems && navItems.length > 0 && (
        <UnifiedBottomNav items={navItems} />
      )}
    </div>
  );
}

export default PageLayout;
