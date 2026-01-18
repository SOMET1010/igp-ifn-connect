/**
 * Dashboard Coopérative - PNAVIM
 * Phase 6: Migré vers RoleLayout
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/contexts';
import { AudioButton, UnifiedActionCard } from '@/shared/ui';
import { RoleLayout } from '@/app/layouts/RoleLayout';
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
import { 
  Package, 
  ClipboardList,
  Award,
  Users,
  ShoppingCart,
} from 'lucide-react';

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

  // Badge IGP pour le header
  const IGPBadge = cooperative?.igp_certified ? (
    <Badge variant="secondary" className="text-xs">
      <Award className="w-3 h-3 mr-1" />IFN
    </Badge>
  ) : null;

  // Calcul du CA hebdomadaire total
  const weeklyRevenueTotal = weeklyRevenue.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <RoleLayout
      title="Ma coopérative"
      subtitle={cooperative?.name ?? "Espace Coopérative"}
      showSignOut
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      headerRight={IGPBadge}
    >
      <AudioButton 
        textToRead={audioText} 
        variant="floating" 
        size="lg" 
        className="bottom-24 right-4 z-50" 
      />

      <div className="space-y-6">
        {/* Localisation */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{cooperative?.commune}, {cooperative?.region}</p>
        </div>

        {/* Filtre temporel */}
        <DateFilterTabs value={dateFilter} onChange={setDateFilter} />

        {/* Alertes stock */}
        <CooperativeAlerts notifications={notifications} />

        {/* Ce qu'on a */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Ce qu'on a</h2>
          <CooperativeStats stats={stats} membersCount={cooperative?.total_members ?? null} />
        </section>

        {/* Nos chiffres */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Nos chiffres</h2>
          <CooperativeRevenueChart data={weeklyRevenue} totalRevenue={weeklyRevenueTotal} />
          <CooperativeOrdersChart stats={stats} />
        </section>

        {/* Action principale */}
        <Button 
          onClick={() => navigate('/cooperative/stock')} 
          className="w-full h-14 text-lg font-bold rounded-2xl"
        >
          <Package className="h-6 w-6 mr-2" />
          Voir nos produits
        </Button>

        {/* Nos actions */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Nos actions</h2>
          <div className="space-y-2">
            <UnifiedActionCard 
              title="Nos produits" 
              description={`${stats.products} produits`} 
              icon={Package} 
              onClick={() => navigate('/cooperative/stock')} 
            />
            <UnifiedActionCard 
              title="Ce qu'on nous demande" 
              description="Voir les demandes" 
              icon={ClipboardList} 
              onClick={() => navigate('/cooperative/commandes')} 
              badge={stats.pendingOrders} 
              badgeVariant="warning" 
            />
            <UnifiedActionCard 
              title="Nos cultivateurs" 
              description="Gérer les producteurs" 
              icon={Users} 
              onClick={() => navigate('/cooperative/producteurs')} 
            />
            <UnifiedActionCard 
              title="Nos membres" 
              description={`${cooperative?.total_members ?? 0} membres`} 
              icon={Users} 
              onClick={() => navigate('/cooperative/membres')} 
            />
            <UnifiedActionCard 
              title="Acheter aux cultivateurs" 
              description="Commander des récoltes" 
              icon={ShoppingCart} 
              onClick={() => navigate('/cooperative/commandes-producteurs')} 
            />
          </div>
        </section>

        <QuickGuide />
      </div>
    </RoleLayout>
  );
};

export default CooperativeDashboard;
