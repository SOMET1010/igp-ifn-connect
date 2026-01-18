/**
 * Configuration Navigation Jùlaba
 * 
 * Navigation inclusive avec emojis au lieu d'icônes
 * Max 5 items par rôle
 */

import { JulabaNavItem } from '@/shared/ui/julaba/JulabaBottomNav';

// ============================================
// NAVIGATION MARCHAND (3 items - simplicité)
// ============================================
export const MERCHANT_NAV_ITEMS: JulabaNavItem[] = [
  {
    emoji: '🏠',
    label: 'Accueil',
    path: '/marchand',
  },
  {
    emoji: '💰',
    label: 'Argent',
    path: '/marchand/argent',
  },
  {
    emoji: '👤',
    label: 'Moi',
    path: '/marchand/profil',
  },
];

// Navigation étendue pour marchand (max 5)
export const MERCHANT_NAV_EXTENDED: JulabaNavItem[] = [
  {
    emoji: '🏠',
    label: 'Accueil',
    path: '/marchand',
  },
  {
    emoji: '🛒',
    label: 'Vendre',
    path: '/marchand/vendre',
  },
  {
    emoji: '💰',
    label: 'Argent',
    path: '/marchand/argent',
  },
  {
    emoji: '📦',
    label: 'Stock',
    path: '/marchand/stock',
  },
  {
    emoji: '👤',
    label: 'Moi',
    path: '/marchand/profil',
  },
];

// ============================================
// NAVIGATION AGENT (3 items)
// ============================================
export const AGENT_NAV_ITEMS: JulabaNavItem[] = [
  {
    emoji: '🏠',
    label: 'Accueil',
    path: '/agent',
  },
  {
    emoji: '👥',
    label: 'Mes gens',
    path: '/agent/marchands',
  },
  {
    emoji: '👤',
    label: 'Moi',
    path: '/agent/profil',
  },
];

// ============================================
// NAVIGATION COOPÉRATIVE (4 items)
// ============================================
export const COOPERATIVE_NAV_ITEMS: JulabaNavItem[] = [
  {
    emoji: '🏠',
    label: 'Accueil',
    path: '/cooperative',
  },
  {
    emoji: '📦',
    label: 'Stock',
    path: '/cooperative/stock',
  },
  {
    emoji: '📋',
    label: 'Commandes',
    path: '/cooperative/commandes',
  },
  {
    emoji: '👤',
    label: 'Profil',
    path: '/cooperative/profil',
  },
];

// ============================================
// NAVIGATION PRODUCTEUR (3 items)
// ============================================
export const PRODUCER_NAV_ITEMS: JulabaNavItem[] = [
  {
    emoji: '🏠',
    label: 'Accueil',
    path: '/producteur',
  },
  {
    emoji: '🌾',
    label: 'Récoltes',
    path: '/producteur/recoltes',
  },
  {
    emoji: '👤',
    label: 'Moi',
    path: '/producteur/profil',
  },
];

// ============================================
// HELPERS
// ============================================

/**
 * Obtenir la navigation par rôle
 */
export function getNavigationByRole(role: string): JulabaNavItem[] {
  switch (role) {
    case 'merchant':
      return MERCHANT_NAV_ITEMS;
    case 'agent':
      return AGENT_NAV_ITEMS;
    case 'cooperative':
      return COOPERATIVE_NAV_ITEMS;
    case 'producer':
      return PRODUCER_NAV_ITEMS;
    default:
      return [];
  }
}

/**
 * Obtenir la navigation étendue marchand
 */
export function getMerchantExtendedNav(): JulabaNavItem[] {
  return MERCHANT_NAV_EXTENDED;
}
