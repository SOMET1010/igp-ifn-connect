import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { AudioButton } from '@/components/shared/AudioButton';
import { 
  UserPlus, 
  Users, 
  Calendar, 
  TrendingUp, 
  Wifi, 
  WifiOff,
  LogOut,
  Bell,
  Loader2,
  Home,
  User
} from 'lucide-react';

// Simple Stat Card component
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'accent';
}> = ({ title, value, icon, color }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/20 text-accent-foreground'
  };

  return (
    <Card className="text-center">
      <CardContent className="p-3">
        <div className={cn('w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2', colorClasses[color])}>
          {icon}
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
};

// Simple Bottom Nav component
const BottomNav: React.FC<{ t: (key: string) => string }> = ({ t }) => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: t("home"), path: '/agent' },
    { icon: Users, label: t("merchants"), path: '/agent/marchands' },
    { icon: User, label: t("profile"), path: '/agent/profil' },
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

const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { isOnline, pendingCount, isSyncing, syncWithServer } = useOfflineSync();
  
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0 });
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      const { data: agentData } = await supabase
        .from('agents')
        .select('id, total_enrollments')
        .eq('user_id', user.id)
        .single();

      if (agentData) {
        setStats({
          today: 0,
          week: 0,
          total: agentData.total_enrollments ?? 0
        });
      }

      setIsLoadingStats(false);
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/agent/login');
  };

  // Audio text dynamique
  const audioText = `${t("audio_agent_dashboard")}: ${stats.today}. ${t("this_week")}: ${stats.week}. ${t("total")}: ${stats.total}.`;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* AudioButton flottant */}
      <AudioButton 
        textToRead={audioText}
        variant="floating"
        size="lg"
        className="bottom-24 right-4 z-50"
      />

      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-primary-foreground/80">{t("welcome")},</p>
            <h1 className="text-xl font-bold">{profile?.full_name ?? t("agent")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm ${
              isOnline ? 'bg-secondary/20 text-secondary' : 'bg-destructive/20 text-destructive'
            }`}>
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {isOnline ? t("online") : t("offline")}
            </div>
            
            <button className="p-2 rounded-full hover:bg-primary-foreground/10 relative">
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            
            <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-primary-foreground/10">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {pendingCount > 0 && (
          <Card className="border-2 border-warning bg-warning/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">⏳</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
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
                >
                  {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : t("sync")}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-3">
          <StatCard
            title={t("today")}
            value={isLoadingStats ? '-' : stats.today.toString()}
            icon={<Calendar className="h-5 w-5" />}
            color="primary"
          />
          <StatCard
            title={t("this_week")}
            value={isLoadingStats ? '-' : stats.week.toString()}
            icon={<TrendingUp className="h-5 w-5" />}
            color="secondary"
          />
          <StatCard
            title={t("total")}
            value={isLoadingStats ? '-' : stats.total.toString()}
            icon={<Users className="h-5 w-5" />}
            color="accent"
          />
        </div>

        <Button
          onClick={() => navigate('/agent/enrolement')}
          className="btn-xxl w-full bg-primary hover:bg-primary/90 pulse-glow"
        >
          <UserPlus className="h-6 w-6" />
          {t("new_enrollment")}
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/agent/marchands')}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center mb-3">
                <Users className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground">{t("my_merchants")}</h3>
              <p className="text-sm text-muted-foreground">{t("view_list")}</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/agent/profil')}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="font-semibold text-foreground">{t("my_profile")}</h3>
              <p className="text-sm text-muted-foreground">{t("settings")}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span>📋</span> {t("quick_guide")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                <span>{t("guide_agent_1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                <span>{t("guide_agent_2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                <span>{t("guide_agent_3")}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <BottomNav t={t} />
    </div>
  );
};

export default AgentDashboard;