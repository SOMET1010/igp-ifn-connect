/**
 * Routes Producteur - Architecture Vertical Slices (Phase 2)
 * 
 * Routes protégées pour les producteurs agricoles
 * Pages importées depuis src/features/producer/
 */

import { Route, Navigate } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// === IMPORT DEPUIS FEATURES ===
import {
  ProducerDashboard,
  ProducerHarvests,
  ProducerOrders,
  ProducerProfilePage,
} from '@/features/producer';

import { AuthPage } from '@/features/auth';

/**
 * Routes publiques producteur (login)
 */
export const producerPublicRoutes = (
  <>
    <Route path="/producteur/login" element={<AuthPage />} />
    <Route path="/producteur/connexion" element={<Navigate to="/producteur/login" replace />} />
  </>
);

/**
 * Routes protégées producteur
 */
export const producerProtectedRoutes = (
  <Route element={<RequireRole requiredRole="producer" />}>
    <Route path="/producteur" element={<ProducerDashboard />} />
    <Route path="/producteur/recoltes" element={<ProducerHarvests />} />
    <Route path="/producteur/commandes" element={<ProducerOrders />} />
    <Route path="/producteur/profil" element={<ProducerProfilePage />} />
    
    {/* === ALIAS UX INCLUSIFS === */}
    <Route path="/producteur/demandes" element={<Navigate to="/producteur/commandes" replace />} />
    <Route path="/producteur/ventes" element={<Navigate to="/producteur/recoltes" replace />} />
  </Route>
);

export default producerProtectedRoutes;
