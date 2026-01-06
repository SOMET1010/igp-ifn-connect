/**
 * RequireAuth Guard - Protection des routes authentifiées
 * 
 * Vérifie uniquement l'authentification, pas le rôle
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/contexts';
import { Loader2 } from 'lucide-react';

interface RequireAuthProps {
  redirectTo?: string;
}

export function RequireAuth({ redirectTo = '/auth' }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default RequireAuth;
