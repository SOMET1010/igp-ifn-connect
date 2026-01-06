/**
 * RoleLayout - Layout avec navigation contextuelle par rôle
 * 
 * Wrapper autour de PageLayout qui injecte automatiquement
 * la navigation appropriée selon le rôle utilisateur.
 * 
 * Phase 6: Ajout headerRight, showSignOut, onSignOut pour migration dashboards
 */

import React from 'react';
import { Home, Leaf, User, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts';
import { PageLayout, type BreadcrumbItem } from './PageLayout';
import { type NavItem } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import {
  merchantNavItems,
  agentNavItems,
  cooperativeNavItems,
  adminNavItems,
} from '@/config/navigation';

// Navigation producteur
const producerNavItems: NavItem[] = [
  { icon: Home, label: 'Accueil', path: '/producteur' },
  { icon: Leaf, label: 'Récoltes', path: '/producteur/recoltes' },
  { icon: User, label: 'Profil', path: '/producteur/profil' },
];

const roleNavMap: Record<string, NavItem[]> = {
  merchant: merchantNavItems,
  agent: agentNavItems,
  cooperative: cooperativeNavItems,
  producer: producerNavItems,
  admin: adminNavItems,
};

// Chemins de redirection après déconnexion par rôle
const roleLogoutPaths: Record<string, string> = {
  merchant: '/marchand/login',
  agent: '/agent/login',
  cooperative: '/cooperative/login',
  producer: '/producteur/login',
  admin: '/admin/login',
};

interface RoleLayoutProps {
  /** Titre de la page */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Fil d'Ariane (sera préfixé par l'accueil du rôle) */
  breadcrumb?: BreadcrumbItem[];
  /** Override de la navigation (sinon utilise celle du rôle) */
  navItems?: NavItem[];
  /** Afficher le header institutionnel */
  showHeader?: boolean;
  /** Afficher le bouton retour */
  showBackButton?: boolean;
  /** Action personnalisée pour le retour */
  onBack?: () => void;
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
  /** Classes CSS additionnelles */
  className?: string;
  
  // Nouvelles props Phase 6
  /** Contenu supplémentaire à droite du header (badges, status) */
  headerRight?: React.ReactNode;
  /** Afficher le bouton de déconnexion */
  showSignOut?: boolean;
  /** Action personnalisée de déconnexion (sinon utilise auth.signOut) */
  onSignOut?: () => void | Promise<void>;
  /** Largeur maximale du contenu */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function RoleLayout({
  title,
  subtitle,
  breadcrumb,
  navItems: customNavItems,
  showHeader = true,
  showBackButton = false,
  onBack,
  isLoading = false,
  error = null,
  onRetry,
  isEmpty = false,
  emptyMessage,
  emptyAction,
  children,
  className,
  // Nouvelles props
  headerRight,
  showSignOut = false,
  onSignOut,
  maxWidth = 'lg',
}: RoleLayoutProps) {
  const { userRole, signOut } = useAuth();
  const navigate = useNavigate();

  // Déterminer la navigation selon le rôle
  const navItems = customNavItems || (userRole ? roleNavMap[userRole] : undefined);

  // Gestion de la déconnexion
  const handleSignOut = async () => {
    if (onSignOut) {
      await onSignOut();
    } else {
      await signOut();
      const logoutPath = userRole ? roleLogoutPaths[userRole] : '/';
      navigate(logoutPath);
    }
  };

  // Construire le breadcrumb avec préfixe du rôle
  const fullBreadcrumb = React.useMemo(() => {
    if (!breadcrumb || breadcrumb.length === 0) return undefined;
    
    // Ajouter l'accueil du rôle en premier
    const roleHomePaths: Record<string, { label: string; href: string }> = {
      merchant: { label: 'Accueil', href: '/marchand' },
      agent: { label: 'Accueil', href: '/agent' },
      cooperative: { label: 'Accueil', href: '/cooperative' },
      producer: { label: 'Accueil', href: '/producteur' },
      admin: { label: 'Dashboard', href: '/admin' },
    };

    const homeItem = userRole ? roleHomePaths[userRole] : null;
    if (homeItem) {
      return [homeItem, ...breadcrumb];
    }
    return breadcrumb;
  }, [breadcrumb, userRole]);

  // Composer le headerRight avec le bouton signOut si nécessaire
  const composedHeaderRight = React.useMemo(() => {
    if (!showSignOut && !headerRight) return undefined;
    
    return (
      <div className="flex items-center gap-2">
        {headerRight}
        {showSignOut && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Déconnexion</span>
          </Button>
        )}
      </div>
    );
  }, [showSignOut, headerRight, handleSignOut]);

  // Mapper maxWidth vers les classes CSS
  const maxWidthClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      breadcrumb={fullBreadcrumb}
      navItems={navItems}
      showHeader={showHeader}
      showBackButton={showBackButton}
      onBack={onBack}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
      emptyAction={emptyAction}
      className={className}
      maxWidth={maxWidth}
    >
      {children}
    </PageLayout>
  );
}

export default RoleLayout;
