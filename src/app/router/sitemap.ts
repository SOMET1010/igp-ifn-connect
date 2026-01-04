/**
 * Sitemap interne P.NA.VIM
 * Table des routes pour validation zero-404
 */

export interface RouteEntry {
  path: string;
  name: string;
  requiresAuth: boolean;
  roles?: string[];
}

export const SITEMAP = {
  public: [
    { path: '/', name: 'Accueil', requiresAuth: false },
    { path: '/auth', name: 'Connexion', requiresAuth: false },
    { path: '/health', name: 'Santé système', requiresAuth: false },
    // Marchands publiques
    { path: '/marchand/login', name: 'Connexion Marchand', requiresAuth: false },
    { path: '/marchand/connexion', name: 'Connexion Vocale', requiresAuth: false },
    { path: '/marchand/securite', name: 'Sécurité Fallback', requiresAuth: false },
    { path: '/marchand/inscription-vocale', name: 'Inscription Vocale', requiresAuth: false },
    // Admin public
    { path: '/admin/login', name: 'Connexion Admin', requiresAuth: false },
    // Agent public
    { path: '/agent/login', name: 'Connexion Agent', requiresAuth: false },
    // Cooperative public
    { path: '/cooperative/login', name: 'Connexion Coopérative', requiresAuth: false },
    // Producer public
    { path: '/producteur/login', name: 'Connexion Producteur', requiresAuth: false },
  ] as RouteEntry[],

  merchant: [
    { path: '/marchand', name: 'Tableau de bord', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/encaisser', name: 'Encaisser', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/vente-rapide', name: 'Vente Rapide Vocale', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/historique', name: 'Historique', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/argent', name: 'Argent', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/aide', name: 'Aide', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/profil', name: 'Profil', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/stock', name: 'Stock', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/cmu', name: 'CMU', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/credits', name: 'Crédits', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/scanner', name: 'Scanner', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/promotions', name: 'Promotions', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/fournisseurs', name: 'Fournisseurs', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/comprendre', name: 'Comprendre', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/factures', name: 'Factures', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/wallet', name: 'Wallet', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/kyc', name: 'KYC', requiresAuth: true, roles: ['merchant'] },
    { path: '/marchand/assistant-vocal', name: 'Assistant Vocal', requiresAuth: true, roles: ['merchant'] },
  ] as RouteEntry[],

  admin: [
    { path: '/admin', name: 'Dashboard Admin', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/marchands', name: 'Marchands', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/agents', name: 'Agents', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/demandes-agents', name: 'Demandes Agents', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/cooperatives', name: 'Coopératives', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/carte', name: 'Carte', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/monitoring', name: 'Monitoring', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/analytics', name: 'Analytics', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/rapports', name: 'Rapports', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/studio', name: 'Studio', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/vivriers', name: 'Vivriers', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/utilisateurs', name: 'Utilisateurs', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/kyc', name: 'Revue KYC', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/diagnostics', name: 'Diagnostics', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/cartes/import', name: 'Import Cartes', requiresAuth: true, roles: ['admin'] },
    { path: '/admin/cartes/recherche', name: 'Recherche Cartes', requiresAuth: true, roles: ['admin'] },
  ] as RouteEntry[],

  agent: [
    { path: '/agent', name: 'Dashboard Agent', requiresAuth: true, roles: ['agent'] },
    { path: '/agent/enrollment', name: 'Enrôlement', requiresAuth: true, roles: ['agent'] },
    { path: '/agent/validation', name: 'Validation', requiresAuth: true, roles: ['agent'] },
    { path: '/agent/marchands', name: 'Mes Marchands', requiresAuth: true, roles: ['agent'] },
    { path: '/agent/sync', name: 'Synchronisation', requiresAuth: true, roles: ['agent'] },
    { path: '/agent/historique', name: 'Historique', requiresAuth: true, roles: ['agent'] },
    { path: '/agent/aide', name: 'Aide', requiresAuth: true, roles: ['agent'] },
  ] as RouteEntry[],

  cooperative: [
    { path: '/cooperative', name: 'Dashboard Coopérative', requiresAuth: true, roles: ['cooperative'] },
    { path: '/cooperative/products', name: 'Produits', requiresAuth: true, roles: ['cooperative'] },
    { path: '/cooperative/stock', name: 'Stock', requiresAuth: true, roles: ['cooperative'] },
    { path: '/cooperative/orders', name: 'Commandes', requiresAuth: true, roles: ['cooperative'] },
    { path: '/cooperative/members', name: 'Membres', requiresAuth: true, roles: ['cooperative'] },
    { path: '/cooperative/producers', name: 'Producteurs', requiresAuth: true, roles: ['cooperative'] },
    { path: '/cooperative/transactions', name: 'Transactions', requiresAuth: true, roles: ['cooperative'] },
    { path: '/cooperative/reports', name: 'Rapports', requiresAuth: true, roles: ['cooperative'] },
  ] as RouteEntry[],

  producer: [
    { path: '/producteur', name: 'Dashboard Producteur', requiresAuth: true, roles: ['producer'] },
    { path: '/producteur/recoltes', name: 'Récoltes', requiresAuth: true, roles: ['producer'] },
    { path: '/producteur/commandes', name: 'Commandes', requiresAuth: true, roles: ['producer'] },
    { path: '/producteur/profil', name: 'Profil', requiresAuth: true, roles: ['producer'] },
  ] as RouteEntry[],
};

/**
 * Obtenir toutes les routes
 */
export function getAllRoutes(): RouteEntry[] {
  return [
    ...SITEMAP.public,
    ...SITEMAP.merchant,
    ...SITEMAP.admin,
    ...SITEMAP.agent,
    ...SITEMAP.cooperative,
    ...SITEMAP.producer,
  ];
}

/**
 * Vérifier si une route existe
 */
export function isValidRoute(path: string): boolean {
  const routes = getAllRoutes();
  return routes.some(route => {
    // Gérer les routes dynamiques avec :param
    if (route.path.includes(':')) {
      const pattern = route.path.replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(path);
    }
    return route.path === path;
  });
}

/**
 * Obtenir les routes par rôle
 */
export function getRoutesByRole(role: string): RouteEntry[] {
  const allProtected = [
    ...SITEMAP.merchant,
    ...SITEMAP.admin,
    ...SITEMAP.agent,
    ...SITEMAP.cooperative,
    ...SITEMAP.producer,
  ];
  
  return allProtected.filter(route => route.roles?.includes(role));
}
