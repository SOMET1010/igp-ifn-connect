import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminDashboardData } from '@/hooks/useAdminDashboardData';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { InstitutionalStatCard } from '@/components/shared/InstitutionalStatCard';
import { InstitutionalBottomNav } from '@/components/shared/InstitutionalBottomNav';
import { InstitutionalActionCard } from '@/components/shared/InstitutionalActionCard';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';
import { 
  Users, 
  Store, 
  Wheat, 
  Map as MapIcon, 
  Home,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  FileText,
  Mic,
  Leaf,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { stats, chartData, isLoading, error, refetch } = useAdminDashboardData();

  const navItems = useMemo(() => [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Activity, label: 'Monitoring', path: '/admin/monitoring' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: MapIcon, label: 'Carte', path: '/admin/carte' },
  ], []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // Loading state with skeleton
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Erreur de chargement</h2>
        <p className="text-muted-foreground text-center mb-4">
          Impossible de charger les données du tableau de bord.
        </p>
        <Button onClick={() => refetch()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <DashboardHeader
        title="Administration IFN"
        subtitle="Direction Générale des Entreprises"
        onSignOut={handleSignOut}
      />

      <div className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <InstitutionalStatCard
            title="Marchands"
            value={stats.merchants}
            icon={Store}
            subtitle={stats.pendingMerchants > 0 ? `${stats.pendingMerchants} en attente` : undefined}
            variant={stats.pendingMerchants > 0 ? 'warning' : 'default'}
          />
          <InstitutionalStatCard
            title="Agents"
            value={stats.agents}
            icon={Users}
          />
          <InstitutionalStatCard
            title="Coopératives"
            value={stats.cooperatives}
            icon={Wheat}
          />
          <InstitutionalStatCard
            title="Transactions"
            value={`${(stats.totalTransactions / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            subtitle="FCFA"
          />
        </div>

        {/* Chart */}
        <Card className="card-institutional">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Enrôlements (7 derniers jours)
              </h3>
            </div>
            {chartData.reduce((sum, d) => sum + d.enrollments, 0) === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                  <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aucun enrôlement sur les 7 derniers jours
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Les nouveaux marchands apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="enrollments" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#enrollmentGradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation cards */}
        <div className="grid grid-cols-2 gap-3">
          <InstitutionalActionCard
            title="Marchands"
            description={`${stats.merchants} inscrits`}
            icon={Store}
            onClick={() => navigate('/admin/marchands')}
          />
          <InstitutionalActionCard
            title="Agents"
            description={`${stats.agents} actifs`}
            icon={Users}
            onClick={() => navigate('/admin/agents')}
          />
          <InstitutionalActionCard
            title="Coopératives"
            description={`${stats.cooperatives} enregistrées`}
            icon={Wheat}
            onClick={() => navigate('/admin/cooperatives')}
          />
          <InstitutionalActionCard
            title="Cartographie"
            description="Voir la carte"
            icon={MapIcon}
            onClick={() => navigate('/admin/carte')}
          />
        </div>

        {/* Outils avancés */}
        <h3 className="font-semibold text-foreground mt-2">
          Outils avancés
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <InstitutionalActionCard
            title="Monitoring"
            description="Surveillance"
            icon={Activity}
            onClick={() => navigate('/admin/monitoring')}
          />
          <InstitutionalActionCard
            title="Analytics"
            description="Statistiques"
            icon={BarChart3}
            onClick={() => navigate('/admin/analytics')}
          />
          <InstitutionalActionCard
            title="Rapports"
            description="Export"
            icon={FileText}
            onClick={() => navigate('/admin/rapports')}
          />
          <InstitutionalActionCard
            title="Studio Audio"
            description="Enregistrer"
            icon={Mic}
            onClick={() => navigate('/admin/studio')}
          />
          <InstitutionalActionCard
            title="Vivriers"
            description="Import coopératives"
            icon={Leaf}
            onClick={() => navigate('/admin/vivriers')}
          />
        </div>
      </div>

      <InstitutionalBottomNav items={navItems} />
    </div>
  );
};

export default AdminDashboard;
