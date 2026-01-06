import React from 'react';
import { EnhancedHeader, UnifiedBottomNav, type NavItem } from '@/shared/ui';
import { cn } from '@/shared/lib';

// ============================================
// TYPES
// ============================================

export interface PageLayoutProps {
  /** Titre principal affiché dans le header */
  title: string;
  /** Sous-titre optionnel (affiché au-dessus du titre en petit) */
  subtitle?: string;
  /** Afficher le bouton retour */
  showBack?: boolean;
  /** URL de retour (défaut: page précédente) */
  backTo?: string;
  /** Afficher le bouton déconnexion */
  showSignOut?: boolean;
  /** Callback déconnexion */
  onSignOut?: () => void;
  /** Contenu à droite du header (badges, indicateurs, etc.) */
  headerRightContent?: React.ReactNode;
  /** Variante de style du header */
  headerVariant?: 'default' | 'primary' | 'institutional';
  /** Items de navigation bottom (si vide, pas de nav) */
  navItems?: NavItem[];
  /** Contenu principal */
  children: React.ReactNode;
  /** Classes CSS additionnelles pour le conteneur main */
  className?: string;
  /** Padding horizontal du contenu (défaut: true) */
  withPadding?: boolean;
  /** Largeur maximale du contenu (défaut: max-w-5xl) */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '5xl' | 'full';
  /** Afficher un fond de couleur sur le main */
  withBackground?: boolean;
  /** Afficher les logos institutionnels */
  showLogos?: boolean;
  /** Afficher les notifications */
  showNotifications?: boolean;
  /** Afficher le toggle de langue */
  showLanguageToggle?: boolean;
}

// ============================================
// COMPOSANT
// ============================================

/**
 * Template de base pour toutes les pages.
 * Fournit une structure cohérente : Header + Main + BottomNav
 * 
 * @example
 * ```tsx
 * <PageLayout
 *   title="Mon Dashboard"
 *   subtitle="Marchand"
 *   navItems={merchantNavItems}
 *   showSignOut
 *   onSignOut={handleSignOut}
 * >
 *   <div>Contenu de la page</div>
 * </PageLayout>
 * ```
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  showBack = false,
  backTo,
  showSignOut = false,
  onSignOut,
  headerRightContent,
  headerVariant = 'default',
  navItems,
  children,
  className,
  withPadding = true,
  maxWidth = '5xl',
  withBackground = false,
  showLogos = false,
  showNotifications = true,
  showLanguageToggle = true,
}) => {
  const hasBottomNav = navItems && navItems.length > 0;

  const maxWidthClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full',
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Enhanced Header */}
      <EnhancedHeader
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        backTo={backTo}
        showSignOut={showSignOut}
        onSignOut={onSignOut}
        rightContent={headerRightContent}
        variant={headerVariant}
        showLogos={showLogos}
        showNotifications={showNotifications}
        showLanguageToggle={showLanguageToggle}
      />

      {/* Main Content */}
      <main
        className={cn(
          'flex-1',
          hasBottomNav && 'pb-20', // Espace pour la nav bottom
          withPadding && 'px-4',
          withBackground && 'bg-muted/30',
          className
        )}
      >
        <div className={cn('mx-auto w-full', maxWidthClasses[maxWidth])}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {hasBottomNav && <UnifiedBottomNav items={navItems} />}
    </div>
  );
};

export default PageLayout;
