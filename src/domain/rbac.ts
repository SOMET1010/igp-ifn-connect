/**
 * RBAC - Role-Based Access Control
 * Source unique de vérité pour les rôles et permissions
 * 
 * Architecture "industrie" - Centralisé et testable
 */

import type { Database } from '@/integrations/supabase/types';

// Type depuis Supabase
export type AppRole = Database['public']['Enums']['app_role'];

// Pages accessibles par rôle
export const ROLE_PAGES = {
  merchant: [
    'dashboard',
    'cashier',
    'stock',
    'transactions',
    'wallet',
    'credits',
    'promotions',
    'suppliers',
    'invoices',
    'kyc',
    'cmu',
    'scanner',
    'money',
    'help',
    'understand',
    'profile',
  ],
  agent: [
    'dashboard',
    'merchants',
    'enrollment',
    'profile',
  ],
  cooperative: [
    'dashboard',
    'stock',
    'orders',
    'profile',
  ],
  admin: [
    'dashboard',
    'merchants',
    'agents',
    'agent-requests',
    'cooperatives',
    'map',
    'monitoring',
    'analytics',
    'reports',
    'studio',
    'vivriers',
    'users',
    'kyc',
  ],
  client: [], // Deprecated - hors périmètre PNAVIM
  user: [
    'profile',
  ],
} as const satisfies Record<AppRole, readonly string[]>;

// Actions autorisées par rôle
export const ROLE_ACTIONS = {
  merchant: [
    'sell',
    'view_stock',
    'manage_stock',
    'view_transactions',
    'manage_credits',
    'view_wallet',
    'transfer_money',
    'create_invoice',
    'view_promotions',
    'manage_promotions',
  ],
  agent: [
    'enroll_merchant',
    'view_merchants',
    'validate_merchant',
    'validate_kyc',
    'assist_merchant',
  ],
  cooperative: [
    'manage_stock',
    'create_orders',
    'view_orders',
    'view_merchants',
    'manage_profile',
  ],
  admin: ['*'], // Toutes les actions
  client: [], // Deprecated - hors périmètre PNAVIM
  user: ['view_profile'], // Rôle de base
} as const satisfies Record<AppRole, readonly string[]>;

// Permissions complètes par rôle
export const ROLE_PERMISSIONS = {
  merchant: {
    pages: ROLE_PAGES.merchant,
    actions: ROLE_ACTIONS.merchant,
    redirectTo: '/marchand/login',
    basePath: '/marchand',
  },
  agent: {
    pages: ROLE_PAGES.agent,
    actions: ROLE_ACTIONS.agent,
    redirectTo: '/agent/login',
    basePath: '/agent',
  },
  cooperative: {
    pages: ROLE_PAGES.cooperative,
    actions: ROLE_ACTIONS.cooperative,
    redirectTo: '/cooperative/login',
    basePath: '/cooperative',
  },
  admin: {
    pages: ROLE_PAGES.admin,
    actions: ROLE_ACTIONS.admin,
    redirectTo: '/admin/login',
    basePath: '/admin',
  },
  client: {
    pages: [],
    actions: [],
    redirectTo: '/', // Deprecated - hors périmètre PNAVIM
    basePath: '/',
  },
  user: {
    pages: ROLE_PAGES.user,
    actions: ROLE_ACTIONS.user,
    redirectTo: '/auth',
    basePath: '/',
  },
} as const;

/**
 * Vérifie si un rôle a une permission spécifique
 */
export function hasPermission(role: AppRole, action: string): boolean {
  const actions = ROLE_ACTIONS[role] as readonly string[];
  return actions.includes('*') || actions.includes(action);
}

/**
 * Vérifie si un rôle peut accéder à une page
 */
export function canAccessPage(role: AppRole, page: string): boolean {
  const pages = ROLE_PAGES[role] as readonly string[];
  return pages.includes(page);
}

/**
 * Obtient le chemin de redirection pour un rôle
 */
export function getRedirectPath(role: AppRole): string {
  return ROLE_PERMISSIONS[role].redirectTo;
}

/**
 * Obtient le chemin de base pour un rôle
 */
export function getBasePath(role: AppRole): string {
  return ROLE_PERMISSIONS[role].basePath;
}

/**
 * Priorité des rôles pour les utilisateurs multi-rôles
 * Plus la valeur est élevée, plus le rôle est prioritaire
 */
export const ROLE_PRIORITY: Record<AppRole, number> = {
  admin: 5,
  agent: 4,
  cooperative: 3,
  merchant: 2,
  client: 1, // Deprecated - hors périmètre PNAVIM
  user: 1,
};

/**
 * Obtient le rôle le plus prioritaire parmi une liste
 */
export function getHighestPriorityRole(roles: AppRole[]): AppRole | null {
  if (roles.length === 0) return null;
  
  return roles.reduce((highest, current) => 
    ROLE_PRIORITY[current] > ROLE_PRIORITY[highest] ? current : highest
  );
}
