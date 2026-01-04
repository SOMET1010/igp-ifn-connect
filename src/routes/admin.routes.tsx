/**
 * Routes Admin
 * 
 * Routes protégées pour les administrateurs
 */

import React from 'react';
import { Route } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// Pages publiques
import AdminLogin from '@/pages/admin/AdminLogin';

// Lazy load for heavy components
const AdminMap = React.lazy(() => import('@/pages/admin/AdminMap'));

// Pages protégées
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminMerchants from '@/pages/admin/AdminMerchants';
import AdminAgents from '@/pages/admin/AdminAgents';
import AdminAgentRequests from '@/pages/admin/AdminAgentRequests';
import AdminCooperatives from '@/pages/admin/AdminCooperatives';
import AdminMonitoring from '@/pages/admin/AdminMonitoring';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminReports from '@/pages/admin/AdminReports';
import AdminStudio from '@/pages/admin/AdminStudio';
import AdminVivriers from '@/pages/admin/AdminVivriers';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminUserDetail from '@/pages/admin/AdminUserDetail';
import AdminKycReview from '@/pages/admin/AdminKycReview';
import AdminDiagnostics from '@/pages/admin/AdminDiagnostics';
import AdminCardsImport from '@/pages/admin/AdminCardsImport';
import AdminCardsSearch from '@/pages/admin/AdminCardsSearch';

/**
 * Routes publiques de l'admin (login)
 */
export const adminPublicRoutes = (
  <>
    <Route path="/admin/login" element={<AdminLogin />} />
  </>
);

/**
 * Routes protégées de l'admin
 */
export const adminProtectedRoutes = (
  <Route element={<RequireRole requiredRole="admin" />}>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/marchands" element={<AdminMerchants />} />
    <Route path="/admin/agents" element={<AdminAgents />} />
    <Route path="/admin/demandes-agents" element={<AdminAgentRequests />} />
    <Route path="/admin/cooperatives" element={<AdminCooperatives />} />
    <Route path="/admin/carte" element={<AdminMap />} />
    <Route path="/admin/monitoring" element={<AdminMonitoring />} />
    <Route path="/admin/analytics" element={<AdminAnalytics />} />
    <Route path="/admin/rapports" element={<AdminReports />} />
    <Route path="/admin/studio" element={<AdminStudio />} />
    <Route path="/admin/vivriers" element={<AdminVivriers />} />
    <Route path="/admin/utilisateurs" element={<AdminUsers />} />
    <Route path="/admin/utilisateurs/:userId" element={<AdminUserDetail />} />
    <Route path="/admin/kyc" element={<AdminKycReview />} />
    <Route path="/admin/diagnostics" element={<AdminDiagnostics />} />
    <Route path="/admin/cartes/import" element={<AdminCardsImport />} />
    <Route path="/admin/cartes/recherche" element={<AdminCardsSearch />} />
  </Route>
);

export default adminProtectedRoutes;
