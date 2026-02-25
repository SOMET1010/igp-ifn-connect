/**
 * Dashboard Agent - JÙLABA
 * Refonte Jùlaba Design System
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '@/shared/contexts';
import { useOfflineSync } from '@/shared/hooks';
import { AudioButton } from '@/shared/ui';
import { 
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
  JulabaListItem,
  JulabaStatCard,
  JulabaBottomNav,
  JulabaEmptyState,
  type JulabaNavItem,
} from '@/shared/ui/julaba';
import { 
  useAgentDashboard,
  AgentAlerts,
  AgentEnrollmentsChart,
  AgentQuickGuide,
  AgentRegistrationSection,
} from '@/features/agent';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

// Nav items Agent
const AGENT_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🏠', label: 'Accueil', path: '/agent' },
  { emoji: '✍️', label: 'Inscrire', path: '/agent/enrolement' },
  { emoji: '👥', label: 'Marchands', path: '/agent/marchands' },
  { emoji: '👤', label: 'Profil', path: '/agent/profil' },
];

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
    refetch,
  } = useAgentDashboard();

  const audioText = `${t("audio_agent_dashboard")}: ${stats.today}. ${t("this_week")}: ${stats.week}. ${t("total")}: ${stats.total}. ${t("validated")}: ${stats.validated}.`;

  const handleLogout = async () => {
    await signOut();
    navigate('/agent/login');
  };

  // Loading
  if (isLoading) {
    return (
      <JulabaPageLayout background="gradient">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </JulabaPageLayout>
    );
  }

  // Erreur
  if (error) {
    return (
      <JulabaPageLayout background="gradient">
        <JulabaHeader 
          title="Espace Agent" 
           subtitle="IFN - JÙLABA"
          showLogout
          onLogout={handleLogout}
        />
        <div className="p-4 space-y-4">
          <JulabaEmptyState
            emoji="😕"
            title="Erreur de chargement"
            description={String(error)}
          />
          <JulabaButton 
            variant="primary" 
            onClick={() => refetch()}
            className="w-full"
          >
            Réessayer
          </JulabaButton>
        </div>
        <JulabaBottomNav items={AGENT_NAV_ITEMS} />
      </JulabaPageLayout>
    );
  }

  // Non enregistré comme agent
  if (!isAgentRegistered) {
    return (
      <JulabaPageLayout background="gradient">
        <JulabaHeader 
          title="Espace Agent" 
          subtitle="IFN - JÙLABA"
          showLogout
          onLogout={handleLogout}
        />
        <div className="p-4 space-y-4">
          <AgentRegistrationSection user={user} onSuccess={refetch} />
        </div>
        <JulabaBottomNav items={AGENT_NAV_ITEMS} />
      </JulabaPageLayout>
    );
  }

  // Dashboard normal
  return (
    <JulabaPageLayout background="gradient">
      <JulabaHeader 
        title="Mes inscriptions" 
        subtitle="Agent terrain IFN"
        showLogout
        onLogout={handleLogout}
        rightAction={{
          emoji: isOnline ? '🟢' : '🔴',
          onClick: () => {},
          label: isOnline ? 'En ligne' : 'Hors ligne'
        }}
      />

      <AudioButton 
        textToRead={audioText}
        variant="floating"
        size="lg"
        className="bottom-24 right-4 z-50"
      />

      <div className="p-4 space-y-6">
        {/* Alerte sync offline */}
        {pendingCount > 0 && (
          <JulabaCard accent="orange" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📤</span>
                <div>
                  <p className="font-semibold">{pendingCount} en attente</p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline ? 'Prêt à synchroniser' : 'En attente de connexion'}
                  </p>
                </div>
              </div>
              {isOnline && (
                <JulabaButton 
                  variant="secondary" 
                  size="sm"
                  onClick={syncWithServer}
                  isLoading={isSyncing}
                >
                  Sync
                </JulabaButton>
              )}
            </div>
          </JulabaCard>
        )}

        {/* Alertes */}
        <AgentAlerts 
          pendingMerchants={stats.pending} 
          todayEnrollments={stats.today} 
        />

        {/* Statistiques rapides */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            📊 Mes statistiques
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <JulabaStatCard
              label="Aujourd'hui"
              value={stats.today}
              emoji="📅"
              iconBg="orange"
            />
            <JulabaStatCard
              label="Cette semaine"
              value={stats.week}
              emoji="📈"
              iconBg="blue"
            />
            <JulabaStatCard
              label="Total"
              value={stats.total}
              emoji="👥"
              iconBg="green"
            />
            <JulabaStatCard
              label="Validés"
              value={stats.validated}
              emoji="✅"
              iconBg="gold"
            />
          </div>
        </section>

        {/* Graphique */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">
            📊 Mes progrès
          </h2>
          <JulabaCard className="p-4">
            <AgentEnrollmentsChart 
              data={stats.weeklyEnrollments} 
              isLoading={false} 
            />
          </JulabaCard>
        </section>

        {/* Action principale XXL */}
        <JulabaButton
          variant="hero"
          emoji="✍️"
          onClick={() => navigate('/agent/enrolement')}
          className="w-full"
        >
          INSCRIRE QUELQU'UN
        </JulabaButton>

        {/* Actions rapides */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">
            🎯 Actions rapides
          </h2>
          <div className="space-y-2">
            <JulabaListItem
              emoji="👥"
              title="Mes marchands"
              subtitle="Voir la liste"
              onClick={() => navigate('/agent/marchands')}
            />
            <JulabaListItem
              emoji="👤"
              title="Mon profil"
              subtitle="Mes réglages"
              onClick={() => navigate('/agent/profil')}
            />
          </div>
        </section>

        {/* Guide rapide */}
        <AgentQuickGuide />
      </div>

      <JulabaBottomNav items={AGENT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default AgentDashboard;
