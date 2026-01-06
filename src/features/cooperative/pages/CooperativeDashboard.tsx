/**
 * Dashboard Coopérative - PNAVIM
 * Phase 6: Migré vers RoleLayout
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
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
      title={cooperative?.name ?? t("cooperative")}
      subtitle="Plateforme IFN – Espace Coopérative"
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

        {/* Statistiques */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Statistiques</h2>
          <CooperativeStats stats={stats} membersCount={cooperative?.total_members ?? null} />
        </section>

        {/* Graphiques */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Analyse</h2>
          <CooperativeRevenueChart data={weeklyRevenue} totalRevenue={weeklyRevenueTotal} />
          <CooperativeOrdersChart stats={stats} />
        </section>

        {/* Action principale */}
        <Button 
          onClick={() => navigate('/cooperative/stock')} 
          className="w-full h-12 text-base font-medium"
        >
          <Package className="h-5 w-5 mr-2" />
          {t("manage_my_stock")}
        </Button>

        {/* Actions rapides */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">Actions rapides</h2>
          <div className="space-y-2">
            <UnifiedActionCard 
              title={t("my_stock")} 
              description={`${stats.products} ${t("products")}`} 
              icon={Package} 
              onClick={() => navigate('/cooperative/stock')} 
            />
            <UnifiedActionCard 
              title={t("orders")} 
              description={t("manage_requests")} 
              icon={ClipboardList} 
              onClick={() => navigate('/cooperative/commandes')} 
              badge={stats.pendingOrders} 
              badgeVariant="warning" 
            />
            <UnifiedActionCard 
              title="Producteurs" 
              description="Gérer les producteurs affiliés" 
              icon={Users} 
              onClick={() => navigate('/cooperative/producteurs')} 
            />
            <UnifiedActionCard 
              title="Membres" 
              description={`${cooperative?.total_members ?? 0} membres`} 
              icon={Users} 
              onClick={() => navigate('/cooperative/membres')} 
            />
            <UnifiedActionCard 
              title="Commandes Producteurs" 
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
