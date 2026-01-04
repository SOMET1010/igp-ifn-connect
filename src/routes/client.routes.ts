/**
 * Routes Client/Bénéficiaire
 */
import { lazy } from 'react';

// Lazy load client pages
const ClientDashboard = lazy(() => import('@/pages/client/ClientDashboard'));
const ClientServices = lazy(() => import('@/pages/client/ClientServices'));
const ClientTransactions = lazy(() => import('@/pages/client/ClientTransactions'));
const ClientWallet = lazy(() => import('@/pages/client/ClientWallet'));
const ClientKyc = lazy(() => import('@/pages/client/ClientKyc'));
const ClientProfile = lazy(() => import('@/pages/client/ClientProfile'));

// Public routes (no auth required)
export const clientPublicRoutes = [
  // Client login is handled by AuthPage with ?role=client
];

// Protected routes (auth + client role required)
export const clientProtectedRoutes = [
  { path: '/client', element: ClientDashboard },
  { path: '/client/services', element: ClientServices },
  { path: '/client/transactions', element: ClientTransactions },
  { path: '/client/wallet', element: ClientWallet },
  { path: '/client/kyc', element: ClientKyc },
  { path: '/client/profile', element: ClientProfile },
];

// Navigation items for client bottom nav
export const clientNavItems = [
  { path: '/client', label: 'Accueil', icon: 'home' },
  { path: '/client/services', label: 'Services', icon: 'grid' },
  { path: '/client/wallet', label: 'Portefeuille', icon: 'wallet' },
  { path: '/client/transactions', label: 'Historique', icon: 'file-text' },
  { path: '/client/profile', label: 'Profil', icon: 'user' },
];
