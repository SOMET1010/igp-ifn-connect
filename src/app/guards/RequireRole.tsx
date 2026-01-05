/**
 * RequireRole Guard - Protection des routes par rôle
 * 
 * Utilise le RBAC centralisé pour vérifier les permissions
 * Version PRÉ-PROD : Fallback explicite, jamais d'écran blanc
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert, LogIn } from 'lucide-react';
import type { AppRole } from '@/domain/rbac';
import { getRedirectPath } from '@/domain/rbac';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface RequireRoleProps {
  requiredRole: AppRole;
  redirectTo?: string;
}

export function RequireRole({ requiredRole, redirectTo }: RequireRoleProps) {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  const location = useLocation();

  // TTS for access denied
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          "Tu dois te connecter pour accéder à cette page."
        );
        utterance.lang = "fr-FR";
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    }
  }, [isLoading, isAuthenticated]);

  // Timeout fallback : si bloqué sur "vérification" pendant plus de 5 secondes, forcer reload
  useEffect(() => {
    if (isAuthenticated && userRole === null) {
      const timeout = setTimeout(() => {
        console.warn('[RequireRole] Role check timeout - forcing reload');
        window.location.reload();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, userRole]);

  // Loading state with explicit UI - aussi quand on est authentifié mais le rôle pas encore chargé
  if (isLoading || (isAuthenticated && userRole === null)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Vérification en cours...</p>
      </div>
    );
  }

  // Non authentifié - Afficher UI explicite avant redirection
  if (!isAuthenticated) {
    const redirect = redirectTo || getRedirectPath(requiredRole);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Connexion requise
          </h1>
          <p className="text-muted-foreground mb-6">
            Tu dois te connecter pour accéder à cette page.
          </p>
          
          <Button 
            onClick={() => window.location.href = redirect}
            className="w-full"
          >
            Se connecter
          </Button>
          
          <Navigate to={redirect} state={{ from: location }} replace />
        </div>
      </div>
    );
  }

  // Mauvais rôle - Afficher message explicite
  if (userRole !== requiredRole) {
    const redirect = redirectTo || getRedirectPath(requiredRole);
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Accès non autorisé
          </h1>
          <p className="text-muted-foreground mb-6">
            Tu n'as pas les droits pour accéder à cette page.
            {userRole && (
              <span className="block mt-2 text-sm">
                Ton rôle actuel : <strong>{userRole}</strong>
              </span>
            )}
          </p>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Retour à l'accueil
          </Button>
          
          <Navigate to={redirect} replace />
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export default RequireRole;
