import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { supabase } from '@/integrations/supabase/client';
import { AudioButton } from '@/components/shared/AudioButton';
import { ErrorState } from '@/components/shared/StateComponents';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { InstitutionalStatCard } from '@/components/shared/InstitutionalStatCard';
import { InstitutionalBottomNav } from '@/components/shared/InstitutionalBottomNav';
import { InstitutionalActionCard } from '@/components/shared/InstitutionalActionCard';
import { 
  UserPlus, 
  Users, 
  Calendar, 
  TrendingUp, 
  Wifi, 
  WifiOff,
  Loader2,
  Home,
  User,
  AlertCircle
} from 'lucide-react';

const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { isOnline, pendingCount, isSyncing, syncWithServer } = useOfflineSync();
  
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0 });
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navItems = [
    { icon: Home, label: t("home"), path: '/agent' },
    { icon: Users, label: t("merchants"), path: '/agent/marchands' },
    { icon: User, label: t("profile"), path: '/agent/profil' },
  ];

  const fetchData = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      if (profileData) setProfile(profileData);

      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('id, total_enrollments')
        .eq('user_id', user.id)
        .single();

      if (agentError) throw agentError;

      if (agentData) {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday).toISOString();

        const { count: todayCount } = await supabase
          .from('merchants')
          .select('id', { count: 'exact', head: true })
          .eq('enrolled_by', agentData.id)
          .gte('enrolled_at', todayStart);

        const { count: weekCount } = await supabase
          .from('merchants')
          .select('id', { count: 'exact', head: true })
          .eq('enrolled_by', agentData.id)
          .gte('enrolled_at', weekStart);

        setStats({
          today: todayCount ?? 0,
          week: weekCount ?? 0,
          total: agentData.total_enrollments ?? 0
        });
      }
    } catch (err) {
      console.error('Error fetching agent data:', err);
      setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/agent/login');
  };

  const audioText = `${t("audio_agent_dashboard")}: ${stats.today}. ${t("this_week")}: ${stats.week}. ${t("total")}: ${stats.total}.`;

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <DashboardHeader
          title={t("agent")}
          subtitle="Plateforme IFN – Espace Agent"
          onSignOut={handleSignOut}
        />
        <ErrorState
          message={error}
          onRetry={() => {
            setIsLoadingStats(true);
            fetchData();
          }}
          isNetworkError={!isOnline}
        />
        <InstitutionalBottomNav items={navItems} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AudioButton 
        textToRead={audioText}
        variant="floating"
        size="lg"
        className="bottom-24 right-4 z-50"
      />

      <DashboardHeader
        title={t("agent")}
        subtitle="Plateforme IFN – Espace Agent"
        userName={profile?.full_name}
        onSignOut={handleSignOut}
        rightContent={
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
            isOnline ? 'text-secondary' : 'text-destructive'
          }`}>
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? t("online") : t("offline")}
          </div>
        }
      />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {pendingCount > 0 && (
          <Card className="card-institutional border-primary/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {pendingCount} {t("pending_enrollments")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline ? t("ready_to_sync") : t("waiting_connection")}
                  </p>
                </div>
              </div>
              {isOnline && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={syncWithServer}
                  disabled={isSyncing}
                  className="btn-institutional-outline"
                >
                  {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : t("sync")}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-3">
          <InstitutionalStatCard
            title={t("today")}
            value={isLoadingStats ? '-' : stats.today.toString()}
            icon={Calendar}
          />
          <InstitutionalStatCard
            title={t("this_week")}
            value={isLoadingStats ? '-' : stats.week.toString()}
            icon={TrendingUp}
          />
          <InstitutionalStatCard
            title={t("total")}
            value={isLoadingStats ? '-' : stats.total.toString()}
            icon={Users}
          />
        </div>

        <Button
          onClick={() => navigate('/agent/enrolement')}
          className="btn-institutional w-full h-14 text-lg"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          {t("new_enrollment")}
        </Button>

        <div className="space-y-3">
          <InstitutionalActionCard
            title={t("my_merchants")}
            description={t("view_list")}
            icon={Users}
            onClick={() => navigate('/agent/marchands')}
          />
          <InstitutionalActionCard
            title={t("my_profile")}
            description={t("settings")}
            icon={User}
            onClick={() => navigate('/agent/profil')}
          />
        </div>

        <Card className="card-institutional">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">
              {t("quick_guide")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">1.</span>
                <span>{t("guide_agent_1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">2.</span>
                <span>{t("guide_agent_2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">3.</span>
                <span>{t("guide_agent_3")}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <InstitutionalBottomNav items={navItems} />
    </div>
  );
};

export default AgentDashboard;
