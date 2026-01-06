/**
 * Dashboard Agent - PNAVIM
 * Phase 6: Migré vers RoleLayout
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { AudioButton, UnifiedActionCard } from '@/shared/ui';
import { RoleLayout } from '@/app/layouts/RoleLayout';
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
  User,
} from 'lucide-react';

const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isOnline, pendingCount, isSyncing, syncWithServer } = useOfflineSync();
  const {
    stats,
    isAgentRegistered,
    isLoading,
    error,
    refetch,
  } = useAgentDashboard();

  const audioText = `${t("audio_agent_dashboard")}: ${stats.today}. ${t("this_week")}: ${stats.week}. ${t("total")}: ${stats.total}. ${t("validated")}: ${stats.validated}.`;

  // Status indicateur online/offline pour le header
  const OnlineStatusBadge = (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
      isOnline ? 'text-secondary' : 'text-destructive'
    }`}>
      {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {isOnline ? t("online") : t("offline")}
    </div>
  );

  // Cas: Erreur
  if (error) {
    return (
      <RoleLayout
        title={t("agent")}
        subtitle="Plateforme IFN – Espace Agent"
        showSignOut
        error={error}
        onRetry={refetch}
        headerRight={OnlineStatusBadge}
      >
        <div />
      </RoleLayout>
    );
  }

  // Cas: Non enregistré comme agent
  if (!isLoading && !isAgentRegistered) {
    return (
      <RoleLayout
        title={t("agent")}
        subtitle="Plateforme IFN – Espace Agent"
        showSignOut
        headerRight={OnlineStatusBadge}
      >
        <div className="space-y-4">
          <AgentRegistrationSection user={user} onSuccess={refetch} />
        </div>
      </RoleLayout>
    );
  }

  // Cas: Normal
  return (
    <RoleLayout
      title={t("agent")}
      subtitle="Plateforme IFN – Espace Agent"
      showSignOut
      isLoading={isLoading}
      headerRight={OnlineStatusBadge}
    >
      <AudioButton 
        textToRead={audioText}
        variant="floating"
        size="lg"
        className="bottom-24 right-4 z-50"
      />

      <div className="space-y-6">
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
      </div>
    </RoleLayout>
  );
};

export default AgentDashboard;
