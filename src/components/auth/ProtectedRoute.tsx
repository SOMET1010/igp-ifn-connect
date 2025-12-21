import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';
import { Loader2 } from 'lucide-react';

type AppRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  requiredRole?: AppRole;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredRole, 
  redirectTo = '/agent/login' 
}) => {
  const { isAuthenticated, isLoading, checkRole, user } = useAuth();
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyRole = async () => {
      if (requiredRole && user) {
        setIsCheckingRole(true);
        const result = await checkRole(requiredRole);
        setHasRole(result);
        setIsCheckingRole(false);
      } else if (!requiredRole) {
        setHasRole(true);
      }
    };

    if (isAuthenticated && user) {
      verifyRole();
    }
  }, [requiredRole, checkRole, isAuthenticated, user]);

  // Show loading while checking auth
  if (isLoading || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role check pending
  if (requiredRole && hasRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Role check failed
  if (requiredRole && hasRole === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Accès refusé</h1>
        <p className="text-muted-foreground text-center mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <a href="/" className="text-primary hover:underline">
          Retour à l'accueil
        </a>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
