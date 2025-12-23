import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { AudioButton } from '@/components/shared/AudioButton';
import { ErrorState, LoadingState } from '@/components/shared/StateComponents';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedStatCard } from '@/components/shared/UnifiedStatCard';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { UnifiedActionCard } from '@/components/shared/UnifiedActionCard';
import { useDataFetching } from '@/hooks/useDataFetching';
import { RetryIndicator } from '@/components/shared/RetryIndicator';
import { coopLogger } from '@/infra/logger';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  ClipboardList,
  Award,
  Home,
  User,
  AlertCircle
} from 'lucide-react';

interface CooperativeData {
  id: string;
  name: string;
  region: string;
  commune: string;
  igp_certified?: boolean;
  total_members: number;
}

interface Stats {
  products: number;
  pendingOrders: number;
}

interface DashboardData {
  cooperative: CooperativeData;
  stats: Stats;
}

const CooperativeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t("home"), path: '/cooperative' },
    { icon: Package, label: t("stock"), path: '/cooperative/stock' },
    { icon: ClipboardList, label: t("orders"), path: '/cooperative/commandes' },
    { icon: User, label: t("profile"), path: '/cooperative/profil' },
  ];

  const fetchDashboardData = async (): Promise<DashboardData> => {
    if (!user) throw new Error('Utilisateur non connecté');

    coopLogger.info('Fetching cooperative dashboard data', { userId: user.id });

    const { data: coopData, error: coopError } = await supabase
      .from('cooperatives')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (coopError) {
      coopLogger.error('Failed to fetch cooperative', { error: coopError });
      throw coopError;
    }
    
    if (!coopData) {
      throw new Error('Coopérative non trouvée');
    }

    const [stockResult, ordersResult] = await Promise.all([
      supabase
        .from('stocks')
        .select('*', { count: 'exact', head: true })
        .eq('cooperative_id', coopData.id),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('cooperative_id', coopData.id)
        .eq('status', 'pending'),
    ]);

    coopLogger.info('Dashboard data fetched successfully', {
      cooperativeId: coopData.id,
      stockCount: stockResult.count,
      pendingOrders: ordersResult.count,
    });

    return {
      cooperative: coopData,
      stats: {
        products: stockResult.count ?? 0,
        pendingOrders: ordersResult.count ?? 0,
      },
    };
  };

  const { 
    data, 
    isLoading, 
    error, 
    isNetworkError, 
    refetch,
    nextRetryIn,
    retryCount,
  } = useDataFetching<DashboardData>({
    fetchFn: fetchDashboardData,
    deps: [user?.id],
    enabled: !!user,
    retryDelay: 2000,
    maxRetries: 3,
  });

  const cooperative = data?.cooperative ?? null;
  const stats = data?.stats ?? { products: 0, pendingOrders: 0 };

  const handleSignOut = async () => {
    await signOut();
    navigate('/cooperative/login');
  };

  const audioText = `${t("audio_coop_dashboard")} ${cooperative?.total_members ?? 0} ${t("members")}, ${stats.products} ${t("products")}, ${stats.pendingOrders} ${t("pending_orders")}.`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <UnifiedHeader
          title={t("cooperative")}
          subtitle="Plateforme IFN – Espace Coopérative"
          showSignOut
          onSignOut={handleSignOut}
        />
        <LoadingState message="Chargement du tableau de bord..." />
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <UnifiedHeader
          title={t("cooperative")}
          subtitle="Plateforme IFN – Espace Coopérative"
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <AudioButton 
        textToRead={audioText}
        variant="floating"
        size="lg"
        className="bottom-24 right-4 z-50"
      />

      <UnifiedHeader
        title={cooperative?.name ?? t("cooperative")}
        subtitle="Plateforme IFN – Espace Coopérative"
        showSignOut
        onSignOut={handleSignOut}
        rightContent={
          cooperative?.igp_certified && (
            <Badge variant="secondary" className="text-xs">
              <Award className="w-3 h-3 mr-1" />
              IFN
            </Badge>
          )
        }
      />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Location info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {cooperative?.commune}, {cooperative?.region}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <UnifiedStatCard
            title={t("members")}
            value={cooperative?.total_members ?? 0}
            icon={Users}
          />
          <UnifiedStatCard
            title={t("products")}
            value={stats.products}
            icon={Package}
          />
          <UnifiedStatCard
            title={t("pending")}
            value={stats.pendingOrders}
            icon={ShoppingCart}
          />
        </div>

        {/* Pending orders alert */}
        {stats.pendingOrders > 0 && (
          <Card className="card-institutional border-primary/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {stats.pendingOrders} {t("pending_orders")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("to_confirm_or_process")}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/cooperative/commandes')}
              >
                {t("view")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Action button */}
        <Button
          onClick={() => navigate('/cooperative/stock')}
          className="btn-institutional w-full h-14 text-lg"
        >
          <Package className="h-5 w-5 mr-2" />
          {t("manage_my_stock")}
        </Button>

        {/* Navigation cards */}
        <div className="space-y-3">
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
        </div>

        {/* Quick guide */}
        <Card className="card-institutional">
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">
              {t("quick_guide")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">1.</span>
                <span>{t("guide_coop_1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">2.</span>
                <span>{t("guide_coop_2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-medium">3.</span>
                <span>{t("guide_coop_3")}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <UnifiedBottomNav items={navItems} />
    </div>
  );
};

export default CooperativeDashboard;
