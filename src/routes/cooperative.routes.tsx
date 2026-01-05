/**
 * Routes Coopérative
 * 
 * Routes protégées pour les coopératives agricoles
 */

import { Route } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// Pages publiques
import CooperativeLogin from '@/pages/cooperative/CooperativeLogin';
import CooperativeRegister from '@/pages/cooperative/CooperativeRegister';

// Pages protégées
import CooperativeDashboard from '@/pages/cooperative/CooperativeDashboard';
import CooperativeStock from '@/pages/cooperative/CooperativeStock';
import CooperativeOrders from '@/pages/cooperative/CooperativeOrders';
import CooperativeProfile from '@/pages/cooperative/CooperativeProfile';
import CooperativeMembers from '@/pages/cooperative/CooperativeMembers';
import CooperativeProducers from '@/pages/cooperative/CooperativeProducers';
import CooperativeProducerOrders from '@/pages/cooperative/CooperativeProducerOrders';

/**
 * Routes publiques de la coopérative (login, inscription)
 */
export const cooperativePublicRoutes = (
  <>
    <Route path="/cooperative/login" element={<CooperativeLogin />} />
    <Route path="/cooperative/register" element={<CooperativeRegister />} />
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
    <Route path="/cooperative/membres" element={<CooperativeMembers />} />
    <Route path="/cooperative/producteurs" element={<CooperativeProducers />} />
    <Route path="/cooperative/commandes-producteurs" element={<CooperativeProducerOrders />} />
  </Route>
);

export default cooperativeProtectedRoutes;
