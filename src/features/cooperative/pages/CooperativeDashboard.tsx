/**
 * Dashboard Coopérative - JÙLABA
 * Design System Jùlaba
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/contexts';
import { AudioButton } from '@/shared/ui';
import { Loader2 } from 'lucide-react';
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
  useCooperativeDashboard,
  useCooperativeNotifications,
  CooperativeStats,
  CooperativeOrdersChart,
  CooperativeRevenueChart,
  CooperativeAlerts,
  QuickGuide,
  DateFilterTabs,
} from '@/features/cooperative';

// Nav items Coopérative
const COOP_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🏠', label: 'Accueil', path: '/cooperative' },
  { emoji: '📦', label: 'Stock', path: '/cooperative/stock' },
  { emoji: '📋', label: 'Commandes', path: '/cooperative/commandes' },
  { emoji: '👤', label: 'Profil', path: '/cooperative/profil' },
];

const CooperativeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const {
    cooperative,
    stats,
    dateFilter,
    setDateFilter,
    weeklyRevenue,
    isLoading,
    error,
    refetch,
  } = useCooperativeDashboard();

  const notifications = useCooperativeNotifications();

  const audioText = `${t("audio_coop_dashboard")} ${cooperative?.total_members ?? 0} ${t("members")}, ${stats.products} ${t("products")}, ${stats.pendingOrders} ${t("pending_orders")}.`;

  // CA hebdomadaire total
  const weeklyRevenueTotal = weeklyRevenue.reduce((sum, d) => sum + d.revenue, 0);

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
          title="Ma Coopérative" 
          subtitle="JÙLABA"
          showLogout
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
        <JulabaBottomNav items={COOP_NAV_ITEMS} />
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="gradient">
      <JulabaHeader 
        title="Ma Coopérative" 
        subtitle={cooperative?.name ?? "Espace Coopérative"}
        showLogout
        rightAction={cooperative?.igp_certified ? {
          emoji: '🏆',
          onClick: () => {},
          label: 'Certifié IFN'
        } : undefined}
      />

      <AudioButton 
        textToRead={audioText} 
        variant="floating" 
        size="lg" 
        className="bottom-24 right-4 z-50" 
      />

      <div className="p-4 space-y-6">
        {/* Localisation */}
        {cooperative && (
          <JulabaCard accent="green" className="p-3 text-center">
            <span className="text-lg">📍</span>
            <span className="ml-2 text-sm font-medium">
              {cooperative.commune}, {cooperative.region}
            </span>
          </JulabaCard>
        )}

        {/* Filtre temporel */}
        <DateFilterTabs value={dateFilter} onChange={setDateFilter} />

        {/* Alertes stock */}
        <CooperativeAlerts notifications={notifications} />

        {/* Statistiques */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            📊 Ce qu'on a
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <JulabaStatCard
              label="Produits"
              value={stats.products}
              emoji="📦"
              iconBg="orange"
            />
            <JulabaStatCard
              label="Membres"
              value={cooperative?.total_members ?? 0}
              emoji="👥"
              iconBg="blue"
            />
            <JulabaStatCard
              label="En attente"
              value={stats.pendingOrders}
              emoji="⏳"
              iconBg="gold"
            />
            <JulabaStatCard
              label="Livrées"
              value={stats.deliveredOrders}
              emoji="✅"
              iconBg="green"
            />
          </div>
        </section>

        {/* Graphiques */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground px-1">
            📈 Nos chiffres
          </h2>
          <JulabaCard className="p-4">
            <CooperativeRevenueChart data={weeklyRevenue} totalRevenue={weeklyRevenueTotal} />
          </JulabaCard>
          <JulabaCard className="p-4">
            <CooperativeOrdersChart stats={stats} />
          </JulabaCard>
        </section>

        {/* Action principale */}
        <JulabaButton
          variant="hero"
          emoji="📦"
          onClick={() => navigate('/cooperative/stock')}
          className="w-full"
        >
          VOIR NOS PRODUITS
        </JulabaButton>

        {/* Actions rapides */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">
            🎯 Nos actions
          </h2>
          <div className="space-y-2">
            <JulabaListItem
              emoji="📦"
              title="Nos produits"
              subtitle={`${stats.products} produits en stock`}
              onClick={() => navigate('/cooperative/stock')}
            />
            <JulabaListItem
              emoji="📋"
              title="Ce qu'on nous demande"
              subtitle="Voir les demandes"
              badge={stats.pendingOrders > 0 ? {
                text: String(stats.pendingOrders),
                variant: 'warning'
              } : undefined}
              onClick={() => navigate('/cooperative/commandes')}
            />
            <JulabaListItem
              emoji="🌾"
              title="Nos cultivateurs"
              subtitle="Gérer les producteurs"
              onClick={() => navigate('/cooperative/producteurs')}
            />
            <JulabaListItem
              emoji="👥"
              title="Nos membres"
              subtitle={`${cooperative?.total_members ?? 0} membres`}
              onClick={() => navigate('/cooperative/membres')}
            />
            <JulabaListItem
              emoji="🛒"
              title="Acheter aux cultivateurs"
              subtitle="Commander des récoltes"
              onClick={() => navigate('/cooperative/commandes-producteurs')}
            />
          </div>
        </section>

        <QuickGuide />
      </div>

      <JulabaBottomNav items={COOP_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default CooperativeDashboard;
