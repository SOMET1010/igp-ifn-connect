import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { AudioButton } from '@/components/shared/AudioButton';
import { ErrorState } from '@/components/shared/StateComponents';
import { EnhancedHeader } from '@/components/shared/EnhancedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { UnifiedActionCard } from '@/components/shared/UnifiedActionCard';
import { RetryIndicator } from '@/components/shared/RetryIndicator';
import { 
  useAgentDashboard,
  AgentStats,
  AgentAlerts,
  AgentEnrollmentsChart,
  PendingSyncAlert,
  AgentQuickGuide,
  AgentRegistrationSection,
} from '@/features/agent';
import { 
  UserPlus, 
  Users, 
  Wifi, 
  WifiOff,
  Home,
  User,
} from 'lucide-react';

const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { isOnline, pendingCount, isSyncing, syncWithServer } = useOfflineSync();
  const {
    stats,
    isAgentRegistered,
    isLoading,
    error,
    isNetworkError,
    refetch,
    nextRetryIn,
    retryCount,
  } = useAgentDashboard();

  const navItems = [
    { icon: Home, label: t("home"), path: '/agent' },
    { icon: Users, label: t("merchants"), path: '/agent/marchands' },
    { icon: User, label: t("profile"), path: '/agent/profil' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/agent/login');
  };

  const audioText = `${t("audio_agent_dashboard")}: ${stats.today}. ${t("this_week")}: ${stats.week}. ${t("total")}: ${stats.total}. ${t("validated")}: ${stats.validated}.`;

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader
          title={t("agent")}
          subtitle="Plateforme IFN – Espace Agent"
          showSignOut
          onSignOut={handleSignOut}
        />
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          <ErrorState
            message={error.message || "Erreur de chargement"}
            onRetry={refetch}
            isNetworkError={isNetworkError}
          />
        </div>
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  // User logged in but not registered as agent
  if (!isLoading && !isAgentRegistered) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader
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

      <EnhancedHeader
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

      <main className="p-4 space-y-6 max-w-2xl mx-auto">
        <PendingSyncAlert
          pendingCount={pendingCount}
          isOnline={isOnline}
          isSyncing={isSyncing}
          onSync={syncWithServer}
        />

        <AgentAlerts 
          pendingMerchants={stats.pending} 
          todayEnrollments={stats.today} 
        />

        {/* Statistiques */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Statistiques</h2>
          <AgentStats stats={stats} isLoading={isLoading} />
        </section>

        {/* Analyse */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Analyse</h2>
          <AgentEnrollmentsChart 
            data={stats.weeklyEnrollments} 
            isLoading={isLoading} 
          />
        </section>

        {/* Action principale */}
        <Button
          onClick={() => navigate('/agent/enrolement')}
          className="w-full h-12 text-base font-medium"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          {t("new_enrollment")}
        </Button>

        {/* Actions rapides */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Actions rapides</h2>
          <div className="space-y-2">
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
        </section>

        <AgentQuickGuide />
      </main>

      <UnifiedBottomNav items={navItems} />
    </div>
  );
};

export default AgentDashboard;
