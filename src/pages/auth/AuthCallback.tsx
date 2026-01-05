/**
 * AuthCallback - Callback OAuth pour redirection basée sur le rôle
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

// Map des redirections par rôle
const ROLE_REDIRECT_MAP: Record<string, string> = {
  admin: '/admin',
  cooperative: '/cooperative',
  merchant: '/marchand',
  agent: '/agent',
  producer: '/producteur',
  client: '/',
  user: '/',
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Récupérer la session après OAuth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          setError('Erreur de connexion. Veuillez réessayer.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!session?.user) {
          console.warn('[AuthCallback] No session found');
          navigate('/');
          return;
        }

        // Récupérer le rôle de l'utilisateur
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (roleError) {
          console.error('[AuthCallback] Role fetch error:', roleError);
        }

        const userRole = roleData?.role as string | undefined;
        const redirectPath = userRole ? (ROLE_REDIRECT_MAP[userRole] || '/') : '/';

        console.log('[AuthCallback] Redirecting to:', redirectPath, 'Role:', userRole);
        navigate(redirectPath, { replace: true });
      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        setError('Une erreur est survenue.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-destructive mb-2">{error}</p>
        <p className="text-muted-foreground text-sm">Redirection en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Connexion en cours...</p>
    </div>
  );
};

export default AuthCallback;
