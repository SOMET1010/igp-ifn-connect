import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, LogOut, Home, Store, Users, Building2, Shield, LogIn } from 'lucide-react';

type AppRole = Database['public']['Enums']['app_role'];

interface PortalConfig {
  role: AppRole;
  label: string;
  icon: React.ReactNode;
  dashboardPath: string;
  loginPath: string;
  color: string;
}

const PORTALS: PortalConfig[] = [
  { 
    role: 'merchant', 
    label: 'Marchand', 
    icon: <Store className="h-5 w-5" />, 
    dashboardPath: '/marchand',
    loginPath: '/marchand/login',
    color: 'bg-orange-500'
  },
  { 
    role: 'agent', 
    label: 'Agent', 
    icon: <Users className="h-5 w-5" />, 
    dashboardPath: '/agent',
    loginPath: '/agent/login',
    color: 'bg-blue-500'
  },
  { 
    role: 'cooperative', 
    label: 'Coopérative', 
    icon: <Building2 className="h-5 w-5" />, 
    dashboardPath: '/cooperative',
    loginPath: '/cooperative/login',
    color: 'bg-green-500'
  },
  { 
    role: 'admin', 
    label: 'Administration', 
    icon: <Shield className="h-5 w-5" />, 
    dashboardPath: '/admin',
    loginPath: '/admin/login',
    color: 'bg-purple-500'
  },
];

const MyAccount: React.FC = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        return;
      }
      
      setIsLoadingRoles(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching roles:', error);
          setRoles([]);
        } else {
          setRoles(data?.map(r => r.role) ?? []);
        }
      } catch (err) {
        console.error('Error:', err);
        setRoles([]);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSwitchAccount = async (loginPath: string) => {
    await signOut();
    navigate(loginPath);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Non connecté
  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto pt-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>Mon Compte</CardTitle>
              <CardDescription>Aucun utilisateur connecté</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Connectez-vous pour accéder à votre espace
              </p>
              
              <div className="grid gap-3">
                {PORTALS.map((portal) => (
                  <Link key={portal.role} to={portal.loginPath}>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <div className={`p-1.5 rounded ${portal.color} text-white`}>
                        {portal.icon}
                      </div>
                      Se connecter - {portal.label}
                    </Button>
                  </Link>
                ))}
              </div>

              <div className="pt-4 border-t">
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
      </div>
    );
  }

  // Connecté
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto pt-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Mon Compte</CardTitle>
            <CardDescription className="break-all">{user.email || user.phone || user.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rôles */}
            <div>
              <h3 className="text-sm font-medium mb-2">Mes rôles</h3>
              {isLoadingRoles ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun rôle spécifique</p>
              )}
            </div>

            {/* Portails */}
            <div>
              <h3 className="text-sm font-medium mb-3">Accès aux portails</h3>
              <div className="grid gap-3">
                {PORTALS.map((portal) => {
                  const userHasRole = hasRole(portal.role);
                  
                  return (
                    <div 
                      key={portal.role} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${portal.color} text-white`}>
                          {portal.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{portal.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {userHasRole ? '✅ Accès autorisé' : '❌ Accès non configuré'}
                          </p>
                        </div>
                      </div>
                      
                      {userHasRole ? (
                        <Link to={portal.dashboardPath}>
                          <Button size="sm" variant="default">
                            Accéder
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSwitchAccount(portal.loginPath)}
                          className="gap-1"
                        >
                          <LogIn className="h-3 w-3" />
                          Autre compte
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t space-y-3">
              <Button 
                variant="destructive" 
                className="w-full gap-2"
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
    </div>
  );
};

export default MyAccount;
