/**
 * Routes Coopérative
 * 
 * Routes protégées pour les coopératives agricoles
 */

import { Route } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// Pages publiques
import CooperativeLogin from '@/pages/cooperative/CooperativeLogin';

// Pages protégées
import CooperativeDashboard from '@/pages/cooperative/CooperativeDashboard';
import CooperativeStock from '@/pages/cooperative/CooperativeStock';
import CooperativeOrders from '@/pages/cooperative/CooperativeOrders';
import CooperativeProfile from '@/pages/cooperative/CooperativeProfile';

/**
 * Routes publiques de la coopérative (login)
 */
export const cooperativePublicRoutes = (
  <>
    <Route path="/cooperative/login" element={<CooperativeLogin />} />
  </>
);

/**
 * Routes protégées de la coopérative
 */
export const cooperativeProtectedRoutes = (
  <Route element={<RequireRole requiredRole="cooperative" />}>
    <Route path="/cooperative" element={<CooperativeDashboard />} />
    <Route path="/cooperative/stock" element={<CooperativeStock />} />
    <Route path="/cooperative/commandes" element={<CooperativeOrders />} />
    <Route path="/cooperative/profil" element={<CooperativeProfile />} />
  </Route>
);

export default cooperativeProtectedRoutes;
