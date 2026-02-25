import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts';
import { useDemoMode } from '@/shared/hooks';
import type { Database } from '@/integrations/supabase/types';
import { Loader2, User, LogOut, LogIn, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AppRole = Database['public']['Enums']['app_role'];

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrateur',
  agent: 'Agent',
  merchant: 'Marchand',
  cooperative: 'Coopérative',
  producer: 'Producteur',
  client: 'Client', // Deprecated - hors périmètre JÙLABA
  user: 'Utilisateur',
};

interface ProtectedRouteProps {
  requiredRole?: AppRole;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredRole, 
  redirectTo = '/agent/login' 
}) => {
  const { isAuthenticated, isLoading, checkRole, user, signOut } = useAuth();
  const { isDemoMode, demoRole } = useDemoMode();
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if demo mode matches required role
  const isDemoAllowed = isDemoMode && requiredRole && demoRole === requiredRole;

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSwitchAccount = async () => {
    await signOut();
    navigate(redirectTo);
  };

  // Allow access in demo mode if role matches
  if (isDemoAllowed) {
    return <Outlet />;
  }

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

  // Role check failed - improved UI
  if (requiredRole && hasRole === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <span className="text-4xl">🚫</span>
            </div>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Rôle requis : <strong>{ROLE_LABELS[requiredRole]}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Utilisateur connecté */}
            <div className="p-3 rounded-lg bg-muted text-center">
              <p className="text-sm text-muted-foreground">Connecté en tant que :</p>
              <p className="font-medium text-sm break-all">
                {user?.email || user?.phone || user?.id}
              </p>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Votre compte n'a pas le rôle <strong>{ROLE_LABELS[requiredRole]}</strong> nécessaire pour accéder à cette page.
            </p>

            {/* Actions */}
            <div className="grid gap-3 pt-2">
              <Link to="/compte">
                <Button variant="default" className="w-full gap-2">
                  <User className="h-4 w-4" />
                  Voir mon compte
                </Button>
              </Link>

              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleSwitchAccount}
              >
                <LogIn className="h-4 w-4" />
                Se connecter avec un autre compte
              </Button>

              <Button 
                variant="ghost" 
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </Button>

              <Link to="/">
                <Button variant="ghost" className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
