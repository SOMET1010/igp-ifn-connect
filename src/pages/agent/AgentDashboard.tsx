import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useDataFetching } from '@/hooks/useDataFetching';
import { useAgentRequest } from '@/hooks/useAgentRequest';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AudioButton } from '@/components/shared/AudioButton';
import { ErrorState, EmptyState } from '@/components/shared/StateComponents';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedStatCard } from '@/components/shared/UnifiedStatCard';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { UnifiedActionCard } from '@/components/shared/UnifiedActionCard';
import { RetryIndicator } from '@/components/shared/RetryIndicator';
import { AgentRegistrationForm } from '@/components/agent/AgentRegistrationForm';
import { AgentRequestStatus } from '@/components/agent/AgentRequestStatus';
import { Skeleton } from '@/components/ui/skeleton';
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
  AlertCircle,
  UserX
} from 'lucide-react';

interface AgentDashboardData {
  profile: { full_name: string } | null;
  stats: { today: number; week: number; total: number };
  isAgentRegistered: boolean;
}

// Composant pour la section d'inscription agent
function AgentRegistrationSection({ user, onSuccess }: { user: any; onSuccess: () => void }) {
  const { request, isLoading, fetchMyRequest, cancelRequest } = useAgentRequest();
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyRequest();
  }, [fetchMyRequest]);

  const handleCancel = async () => {
    const success = await cancelRequest();
    if (success) {
      toast({
        title: 'Demande annulée',
        description: 'Votre demande a été annulée avec succès.',
      });
      setShowForm(true);
    }
  };

  const handleRetry = () => {
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchMyRequest();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  // Si l'utilisateur a une demande et ne veut pas afficher le formulaire
  if (request && !showForm) {
    return (
      <AgentRequestStatus
        request={request}
        onCancel={request.status === 'pending' ? handleCancel : undefined}
        onRetry={request.status === 'rejected' ? handleRetry : undefined}
        isLoading={isLoading}
      />
    );
  }

  // Afficher le formulaire d'inscription
  return (
    <AgentRegistrationForm 
      onSuccess={handleFormSuccess}
      defaultValues={{
        full_name: '',
        phone: user?.phone || '',
      }}
    />
  );
}
const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { isOnline, pendingCount, isSyncing, syncWithServer } = useOfflineSync();

  const navItems = [
    { icon: Home, label: t("home"), path: '/agent' },
    { icon: Users, label: t("merchants"), path: '/agent/marchands' },
    { icon: User, label: t("profile"), path: '/agent/profil' },
  ];

  const fetchDashboardData = useCallback(async (): Promise<AgentDashboardData> => {
    if (!user) throw new Error('User not authenticated');

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (profileError) {
      throw profileError;
    }

    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('id, total_enrollments')
      .eq('user_id', user.id)
      .maybeSingle();

    if (agentError) throw agentError;

    // Si l'agent n'existe pas, retourner un état indiquant qu'il n'est pas enregistré
    if (!agentData) {
      return { 
        profile: profileData, 
        stats: { today: 0, week: 0, total: 0 },
        isAgentRegistered: false 
      };
    }

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

    return { 
      profile: profileData, 
      stats: {
        today: todayCount ?? 0,
        week: weekCount ?? 0,
        total: agentData.total_enrollments ?? 0
      },
      isAgentRegistered: true
    };
  }, [user]);

  const { 
    data, 
    isLoading, 
    error, 
    isNetworkError, 
    refetch,
    nextRetryIn,
    retryCount,
  } = useDataFetching<AgentDashboardData>({
    fetchFn: fetchDashboardData,
    deps: [user?.id],
    enabled: !!user,
    retryDelay: 2000,
    maxRetries: 3,
  });

  const profile = data?.profile ?? null;
  const stats = data?.stats ?? { today: 0, week: 0, total: 0 };
  const isAgentRegistered = data?.isAgentRegistered ?? false;

  const handleSignOut = async () => {
    await signOut();
    navigate('/agent/login');
  };

  const audioText = `${t("audio_agent_dashboard")}: ${stats.today}. ${t("this_week")}: ${stats.week}. ${t("total")}: ${stats.total}.`;

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <UnifiedHeader
          title={t("agent")}
          subtitle="Plateforme IFN – Espace Agent"
          showSignOut
          onSignOut={handleSignOut}
        />
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          <ErrorState
            message={error.userMessage}
            onRetry={refetch}
            isNetworkError={isNetworkError}
          />
          {nextRetryIn !== null && (
            <RetryIndicator
              nextRetryIn={nextRetryIn}
              retryCount={retryCount}
              maxRetries={3}
            />
          )}
        </div>
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  // État: utilisateur connecté mais pas enregistré comme agent
  if (!isLoading && !isAgentRegistered) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <UnifiedHeader
          title={t("agent")}
          subtitle="Plateforme IFN – Espace Agent"
          showSignOut
          onSignOut={handleSignOut}
        />
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          <AgentRegistrationSection user={user} onSuccess={refetch} />
        </div>
        <UnifiedBottomNav items={navItems} />
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

      <UnifiedHeader
        title={t("agent")}
        subtitle="Plateforme IFN – Espace Agent"
        showSignOut
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
          <UnifiedStatCard
            title={t("today")}
            value={isLoading ? '-' : stats.today.toString()}
            icon={Calendar}
          />
          <UnifiedStatCard
            title={t("this_week")}
            value={isLoading ? '-' : stats.week.toString()}
            icon={TrendingUp}
          />
          <UnifiedStatCard
            title={t("total")}
            value={isLoading ? '-' : stats.total.toString()}
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
          <UnifiedActionCard
            title={t("my_merchants")}
            description={t("view_list")}
            icon={Users}
            onClick={() => navigate('/agent/marchands')}
          />
          <UnifiedActionCard
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

      <UnifiedBottomNav items={navItems} />
    </div>
  );
};

export default AgentDashboard;
