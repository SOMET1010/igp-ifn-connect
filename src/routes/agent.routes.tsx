/**
 * Routes Agent - Architecture Vertical Slices (Phase 2)
 * 
 * Routes protégées pour les agents terrain
 * Pages importées depuis src/features/agent/
 */

import { Route } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// === IMPORT DEPUIS FEATURE AGENT ===
import {
  AgentDashboard,
  AgentLogin,
  AgentProfilePage,
  EnrollmentWizard,
  MerchantList,
} from '@/features/agent';

/**
 * Routes publiques de l'agent (login)
 */
export const agentPublicRoutes = (
  <>
    <Route path="/agent/login" element={<AgentLogin />} />
  </>
);

/**
 * Routes protégées de l'agent
 */
export const agentProtectedRoutes = (
  <Route element={<RequireRole requiredRole="agent" />}>
    <Route path="/agent" element={<AgentDashboard />} />
    <Route path="/agent/enrolement" element={<EnrollmentWizard />} />
    <Route path="/agent/marchands" element={<MerchantList />} />
    <Route path="/agent/profil" element={<AgentProfilePage />} />
  </Route>
);

export default agentProtectedRoutes;
