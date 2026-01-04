/**
 * Routes Module - Export centralisé des routes
 * 
 * Architecture "industrie" : routes organisées par rôle
 */

// Routes publiques
export { publicRoutes } from './public.routes';

// Routes par rôle
export { merchantPublicRoutes, merchantProtectedRoutes } from './merchant.routes';
export { agentPublicRoutes, agentProtectedRoutes } from './agent.routes';
export { cooperativePublicRoutes, cooperativeProtectedRoutes } from './cooperative.routes';
export { adminPublicRoutes, adminProtectedRoutes } from './admin.routes';
