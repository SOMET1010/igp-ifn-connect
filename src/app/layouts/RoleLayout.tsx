/**
 * RoleLayout - Layout avec navigation contextuelle par rôle
 * 
 * Wrapper autour de PageLayout qui injecte automatiquement
 * la navigation appropriée selon le rôle utilisateur.
 */

import React from 'react';
import { Home, Leaf, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageLayout, type BreadcrumbItem } from './PageLayout';
import type { NavItem } from '@/components/shared/UnifiedBottomNav';
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
}: RoleLayoutProps) {
  const { userRole } = useAuth();

  // Déterminer la navigation selon le rôle
  const navItems = customNavItems || (userRole ? roleNavMap[userRole] : undefined);

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
    >
      {children}
    </PageLayout>
  );
}

export default RoleLayout;
