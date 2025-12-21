import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { LogOut, User, Phone, Briefcase, MapPin, Shield, Loader2, ArrowLeft, Home, Users } from 'lucide-react';
import { NotificationToggle } from '@/components/shared/NotificationToggle';

interface AgentProfileData {
  full_name: string;
  phone: string | null;
  employee_id: string;
  organization: string;
  zone: string | null;
  total_enrollments: number | null;
}

// Bottom Nav component
const BottomNav: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/agent' },
    { icon: Users, label: 'Marchands', path: '/agent/marchands' },
    { icon: User, label: 'Profil', path: '/agent/profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const AgentProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, userRole } = useAuth();
  const [profile, setProfile] = useState<AgentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('user_id', user.id)
        .single();

      const { data: agentData } = await supabase
        .from('agents')
        .select('employee_id, organization, zone, total_enrollments')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name,
          phone: profileData.phone,
          employee_id: agentData?.employee_id ?? 'Non assigné',
          organization: agentData?.organization ?? 'DGE',
          zone: agentData?.zone ?? 'Non assignée',
          total_enrollments: agentData?.total_enrollments ?? 0,
        });
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/agent/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="flex items-center gap-3 px-4 py-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/agent')}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Mon Profil</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{profile?.full_name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="h-4 w-4 text-secondary" />
            <span className="text-secondary font-medium capitalize">{userRole ?? 'Agent'}</span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-semibold text-foreground">{profile?.phone ?? 'Non renseigné'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matricule</p>
                <p className="font-semibold text-foreground">{profile?.employee_id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zone d'affectation</p>
                <p className="font-semibold text-foreground">{profile?.zone ?? 'Non assignée'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Statistiques</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-background rounded-xl">
                <p className="text-3xl font-bold text-primary">{profile?.total_enrollments ?? 0}</p>
                <p className="text-sm text-muted-foreground">Enrôlements</p>
              </div>
              <div className="text-center p-3 bg-background rounded-xl">
                <p className="text-xl font-bold text-secondary">{profile?.organization}</p>
                <p className="text-sm text-muted-foreground">Organisation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Notifications</h3>
            <NotificationToggle className="w-full" />
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="btn-xxl w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default AgentProfile;
