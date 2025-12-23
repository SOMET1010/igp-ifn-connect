import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, User, Phone, Briefcase, MapPin, Loader2 } from 'lucide-react';
import { NotificationToggle } from '@/components/shared/NotificationToggle';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { ProfileInfoCard } from '@/components/shared/ProfileInfoCard';
import { InstitutionalStatCard } from '@/components/shared/InstitutionalStatCard';
import { agentNavItems } from '@/config/navigation';

interface AgentProfileData {
  full_name: string;
  phone: string | null;
  employee_id: string;
  organization: string;
  zone: string | null;
  total_enrollments: number | null;
}

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
      <UnifiedHeader
        title="Mon Profil"
        showBack
        backTo="/agent"
      />

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center text-center pt-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-3">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{profile?.full_name}</h2>
          <p className="text-sm text-muted-foreground capitalize">{userRole ?? 'Agent'}</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          <ProfileInfoCard
            icon={Phone}
            label="Téléphone"
            value={profile?.phone ?? 'Non renseigné'}
          />
          <ProfileInfoCard
            icon={Briefcase}
            label="Matricule"
            value={profile?.employee_id ?? 'Non assigné'}
          />
          <ProfileInfoCard
            icon={MapPin}
            label="Zone d'affectation"
            value={profile?.zone ?? 'Non assignée'}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <InstitutionalStatCard
            title="Enrôlements"
            value={profile?.total_enrollments ?? 0}
          />
          <InstitutionalStatCard
            title="Organisation"
            value={profile?.organization ?? 'DGE'}
          />
        </div>

        {/* Notifications */}
        <Card className="card-institutional">
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-3">Notifications</h3>
            <NotificationToggle className="w-full" />
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      <UnifiedBottomNav items={agentNavItems} />
    </div>
  );
};

export default AgentProfile;