/**
 * RequireRole Guard - Protection des routes par rôle
 * 
 * Utilise le RBAC centralisé pour vérifier les permissions
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import type { AppRole } from '@/domain/rbac';
import { getRedirectPath } from '@/domain/rbac';

interface RequireRoleProps {
  requiredRole: AppRole;
  redirectTo?: string;
}

export function RequireRole({ requiredRole, redirectTo }: RequireRoleProps) {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const location = useLocation();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Non authentifié
  if (!isAuthenticated) {
    const redirect = redirectTo || getRedirectPath(requiredRole);
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  // Mauvais rôle
  if (userRole !== requiredRole) {
    const redirect = redirectTo || getRedirectPath(requiredRole);
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}

export default RequireRole;
