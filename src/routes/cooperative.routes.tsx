/**
 * Routes Coopérative - Architecture Vertical Slices (Phase 2)
 * 
 * Routes protégées pour les coopératives agricoles
 * Pages importées depuis src/features/cooperative/
 */

import { Route } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// === IMPORT DEPUIS FEATURE COOPERATIVE ===
import {
  CooperativeDashboard,
  CooperativeLogin,
  CooperativeRegister,
  CooperativeStock,
  CooperativeOrders,
  CooperativeProfilePage,
  CooperativeMembers,
  CooperativeProducers,
  CooperativeProducerOrders,
} from '@/features/cooperative';

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
    <Route path="/cooperative/profil" element={<CooperativeProfilePage />} />
    <Route path="/cooperative/membres" element={<CooperativeMembers />} />
    <Route path="/cooperative/producteurs" element={<CooperativeProducers />} />
    <Route path="/cooperative/commandes-producteurs" element={<CooperativeProducerOrders />} />
  </Route>
);

export default cooperativeProtectedRoutes;
