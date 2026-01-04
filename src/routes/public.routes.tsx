/**
 * Routes Publiques
 * 
 * Routes accessibles sans authentification
 */

import React from 'react';
import { Route } from 'react-router-dom';

// Lazy load for performance
const AuthPage = React.lazy(() => import('@/pages/auth/AuthPage'));

// Direct imports for critical paths
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import DemoAccess from '@/pages/DemoAccess';
import MyAccount from '@/pages/account/MyAccount';

/**
 * Définition des routes publiques
 */
export const publicRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/demo" element={<DemoAccess />} />
    <Route path="/compte" element={<MyAccount />} />
    <Route path="*" element={<NotFound />} />
  </>
);

export default publicRoutes;
