/**
 * Routes Producteur - PNAVIM
 * 
 * Routes protégées pour les producteurs agricoles
 */

import { Route } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// Pages
import ProducerDashboard from '@/pages/producer/ProducerDashboard';
import ProducerHarvests from '@/pages/producer/ProducerHarvests';
import ProducerOrders from '@/pages/producer/ProducerOrders';
import ProducerProfile from '@/pages/producer/ProducerProfile';
import AuthPage from '@/pages/auth/AuthPage';

/**
 * Routes publiques producteur (login)
 */
export const producerPublicRoutes = (
  <>
    <Route path="/producteur/login" element={<AuthPage />} />
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
    <Route path="/producteur/profil" element={<ProducerProfile />} />
  </Route>
);

export default producerProtectedRoutes;
