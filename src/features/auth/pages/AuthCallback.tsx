/**
 * AuthCallback - Callback OAuth pour redirection basée sur le rôle
 * Design System Jùlaba
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { JulabaPageLayout, JulabaCard } from '@/shared/ui/julaba';

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

const ROLE_EMOJIS: Record<string, string> = {
  admin: '🏛️',
  cooperative: '🤝',
  merchant: '🏪',
  agent: '👔',
  producer: '🌾',
  client: '👤',
  user: '👤',
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Récupérer la session après OAuth
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthCallback] Session error:', sessionError);
          setError('Erreur de connexion. Veuillez réessayer.');
          setStatus('error');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!session?.user) {
          console.warn('[AuthCallback] No session found');
          navigate('/');
          return;
        }

        setStatus('success');

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
        const emoji = userRole ? (ROLE_EMOJIS[userRole] || '👤') : '👤';

        console.log('[AuthCallback] Redirecting to:', redirectPath, 'Role:', userRole);
        
        // Petite pause pour l'animation
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 500);
      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        setError('Une erreur est survenue.');
        setStatus('error');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <JulabaPageLayout background="gradient" withBottomNav={false}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <JulabaCard className="max-w-sm w-full text-center">
          {status === 'error' ? (
            <>
              <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-destructive font-medium mb-2">{error}</p>
              <p className="text-muted-foreground text-sm">Redirection en cours...</p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="text-lg font-semibold text-foreground mb-1">
                {status === 'success' ? '✅ Connexion réussie !' : '🔄 Connexion en cours...'}
              </p>
              <p className="text-muted-foreground text-sm">
                {status === 'success' ? 'Redirection vers votre espace...' : 'Veuillez patienter'}
              </p>
            </>
          )}
        </JulabaCard>
      </div>
    </JulabaPageLayout>
  );
};

export default AuthCallback;
