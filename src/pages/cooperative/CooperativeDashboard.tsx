import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AudioButton } from '@/components/shared/AudioButton';
import { ErrorState, LoadingState } from '@/components/shared/StateComponents';
import { EnhancedHeader } from '@/components/shared/EnhancedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { UnifiedActionCard } from '@/components/shared/UnifiedActionCard';
import { RetryIndicator } from '@/components/shared/RetryIndicator';
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
  Home,
  User,
} from 'lucide-react';

const CooperativeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t("home"), path: '/cooperative' },
    { icon: Package, label: t("stock"), path: '/cooperative/stock' },
    { icon: ClipboardList, label: t("orders"), path: '/cooperative/commandes' },
    { icon: User, label: t("profile"), path: '/cooperative/profil' },
  ];

  const {
    cooperative,
    stats,
    dateFilter,
    setDateFilter,
    weeklyRevenue,
    isLoading,
    error,
    isNetworkError,
    refetch,
    nextRetryIn,
    retryCount,
  } = useCooperativeDashboard();

  const notifications = useCooperativeNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate('/cooperative/login');
  };

  const audioText = `${t("audio_coop_dashboard")} ${cooperative?.total_members ?? 0} ${t("members")}, ${stats.products} ${t("products")}, ${stats.pendingOrders} ${t("pending_orders")}.`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader title={t("cooperative")} subtitle="Plateforme IFN – Espace Coopérative" showSignOut onSignOut={handleSignOut} />
        <LoadingState message="Chargement du tableau de bord..." />
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader title={t("cooperative")} subtitle="Plateforme IFN – Espace Coopérative" showSignOut onSignOut={handleSignOut} />
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          <ErrorState message={error.message || "Erreur de chargement"} onRetry={refetch} isNetworkError={isNetworkError} />
        </div>
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  // Calcul du CA hebdomadaire total
  const weeklyRevenueTotal = weeklyRevenue.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <AudioButton textToRead={audioText} variant="floating" size="lg" className="bottom-24 right-4 z-50" />

      <EnhancedHeader
        title={cooperative?.name ?? t("cooperative")}
        subtitle="Plateforme IFN – Espace Coopérative"
        showSignOut
        onSignOut={handleSignOut}
        rightContent={cooperative?.igp_certified && (
          <Badge variant="secondary" className="text-xs">
            <Award className="w-3 h-3 mr-1" />IFN
          </Badge>
        )}
      />

      <div className="p-4 space-y-5 max-w-2xl mx-auto">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{cooperative?.commune}, {cooperative?.region}</p>
        </div>

        {/* Filtre temporel */}
        <DateFilterTabs value={dateFilter} onChange={setDateFilter} />

        {/* Alertes stock */}
        <CooperativeAlerts notifications={notifications} />

        {/* Statistiques enrichies */}
        <CooperativeStats stats={stats} membersCount={cooperative?.total_members ?? null} />

        {/* Graphique CA hebdomadaire */}
        <CooperativeRevenueChart data={weeklyRevenue} totalRevenue={weeklyRevenueTotal} />

        {/* Graphique des commandes */}
        <CooperativeOrdersChart stats={stats} />

        {/* Action principale */}
        <Button onClick={() => navigate('/cooperative/stock')} className="btn-institutional w-full h-14 text-lg">
          <Package className="h-5 w-5 mr-2" />{t("manage_my_stock")}
        </Button>

        {/* Actions rapides */}
        <div className="space-y-3">
          <UnifiedActionCard title={t("my_stock")} description={`${stats.products} ${t("products")}`} icon={Package} onClick={() => navigate('/cooperative/stock')} />
          <UnifiedActionCard title={t("orders")} description={t("manage_requests")} icon={ClipboardList} onClick={() => navigate('/cooperative/commandes')} badge={stats.pendingOrders} badgeVariant="warning" />
        </div>

        <QuickGuide />
      </div>

      <UnifiedBottomNav items={navItems} />
    </div>
  );
};

export default CooperativeDashboard;
