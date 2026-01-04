/**
 * Routes Agent
 * 
 * Routes protégées pour les agents terrain
 */

import { Route } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// Pages publiques
import AgentLogin from '@/pages/agent/AgentLogin';

// Pages protégées
import AgentDashboard from '@/pages/agent/AgentDashboard';
import MerchantList from '@/pages/agent/MerchantList';
import AgentProfile from '@/pages/agent/AgentProfile';
import EnrollmentWizard from '@/pages/agent/EnrollmentWizard';

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
    <Route path="/agent/profil" element={<AgentProfile />} />
  </Route>
);

export default agentProtectedRoutes;
