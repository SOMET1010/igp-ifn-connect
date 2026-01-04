/**
 * Routes Module - Export centralisé des routes
 * 
 * Architecture "industrie" : routes organisées par rôle
 */

// Routes publiques
export { publicRoutes } from './public.routes.tsx';

// Routes par rôle
export { merchantPublicRoutes, merchantProtectedRoutes } from './merchant.routes.tsx';
export { agentPublicRoutes, agentProtectedRoutes } from './agent.routes.tsx';
export { cooperativePublicRoutes, cooperativeProtectedRoutes } from './cooperative.routes.tsx';
export { producerPublicRoutes, producerProtectedRoutes } from './producer.routes.tsx';
export { adminPublicRoutes, adminProtectedRoutes } from './admin.routes.tsx';
