/**
 * Routes Admin - Architecture Vertical Slices (Phase 2)
 * 
 * Routes protégées pour les administrateurs
 * Pages importées depuis src/features/admin/
 */

import React from 'react';
import { Route } from 'react-router-dom';
import { RequireRole } from '@/app/guards';

// === IMPORT DEPUIS FEATURE ADMIN ===
import {
  AdminDashboard,
  AdminLogin,
  AdminMerchants,
  AdminAgents,
  AdminAgentRequests,
  AdminCooperatives,
  AdminProducers,
  AdminMonitoring,
  AdminAnalytics,
  AdminReports,
  AdminStudio,
  AdminVivriers,
  AdminUsers,
  AdminUserDetail,
  AdminKycReview,
  AdminDiagnostics,
  AdminCardsImport,
  AdminCardsSearch,
} from '@/features/admin';

// Lazy load for documentation generator
const AdminDocumentation = React.lazy(() => import('@/features/admin/pages/AdminDocumentation'));

// Lazy load for heavy components (Map)
const AdminMapLazy = React.lazy(() => import('@/features/admin/pages/AdminMap'));

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
    <Route path="/admin/producteurs" element={<AdminProducers />} />
    <Route path="/admin/carte" element={<AdminMapLazy />} />
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
    <Route path="/admin/documentation" element={<AdminDocumentation />} />
  </Route>
);

export default adminProtectedRoutes;
