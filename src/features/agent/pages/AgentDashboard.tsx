/**
 * Dashboard Agent - PNAVIM
 * Phase 6: Migré vers RoleLayout
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth, useLanguage } from '@/shared/contexts';
import { useOfflineSync } from '@/shared/hooks';
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
      title="Mes inscriptions"
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

        {/* Ce que j'ai fait */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Ce que j'ai fait</h2>
          <AgentStats stats={stats} isLoading={isLoading} />
        </section>

        {/* Mes progrès */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Mes progrès</h2>
          <AgentEnrollmentsChart 
            data={stats.weeklyEnrollments} 
            isLoading={isLoading} 
          />
        </section>

        {/* Action principale XXL */}
        <Button
          onClick={() => navigate('/agent/enrolement')}
          className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 rounded-2xl"
        >
          <UserPlus className="h-6 w-6 mr-2" />
          INSCRIRE QUELQU'UN
        </Button>

        {/* Actions */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Mes actions</h2>
          <div className="space-y-2">
            <UnifiedActionCard
              title="Les gens que j'aide"
              description="Voir la liste"
              icon={Users}
              onClick={() => navigate('/agent/marchands')}
            />
            <UnifiedActionCard
              title="Moi"
              description="Mes réglages"
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
