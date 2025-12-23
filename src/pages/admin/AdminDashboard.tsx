import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/shared/DashboardHeader';
import { InstitutionalStatCard } from '@/components/shared/InstitutionalStatCard';
import { InstitutionalBottomNav } from '@/components/shared/InstitutionalBottomNav';
import { InstitutionalActionCard } from '@/components/shared/InstitutionalActionCard';
import { adminLogger } from '@/infra/logger';
import { 
  Users, 
  Store, 
  Wheat, 
  Map as MapIcon, 
  Home,
  TrendingUp,
  Loader2,
  DollarSign,
  Activity,
  BarChart3,
  FileText,
  Mic
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Stats {
  merchants: number;
  pendingMerchants: number;
  agents: number;
  cooperatives: number;
  totalTransactions: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const [stats, setStats] = useState<Stats>({
    merchants: 0,
    pendingMerchants: 0,
    agents: 0,
    cooperatives: 0,
    totalTransactions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<{ date: string; enrollments: number }[]>([]);

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Activity, label: 'Monitoring', path: '/admin/monitoring' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: MapIcon, label: 'Carte', path: '/admin/carte' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { count: merchantsCount } = await supabase
          .from('merchants')
          .select('*', { count: 'exact', head: true });

        const { count: pendingCount } = await supabase
          .from('merchants')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        const { count: agentsCount } = await supabase
          .from('agents')
          .select('*', { count: 'exact', head: true });

        const { count: cooperativesCount } = await supabase
          .from('cooperatives')
          .select('*', { count: 'exact', head: true });

        const { data: transactionsData } = await supabase
          .from('transactions')
          .select('amount');

        const totalAmount = transactionsData?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

        setStats({
          merchants: merchantsCount ?? 0,
          pendingMerchants: pendingCount ?? 0,
          agents: agentsCount ?? 0,
          cooperatives: cooperativesCount ?? 0,
          totalTransactions: totalAmount
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const { data: enrollmentData } = await supabase
          .from('merchants')
          .select('enrolled_at')
          .gte('enrolled_at', sevenDaysAgo.toISOString())
          .order('enrolled_at', { ascending: true });

        const enrollmentsByDate = new Map<string, number>();
        
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dateKey = date.toISOString().split('T')[0];
          enrollmentsByDate.set(dateKey, 0);
        }

        enrollmentData?.forEach((merchant) => {
          const dateKey = merchant.enrolled_at.split('T')[0];
          if (enrollmentsByDate.has(dateKey)) {
            enrollmentsByDate.set(dateKey, (enrollmentsByDate.get(dateKey) ?? 0) + 1);
          }
        });

        const chartDataArray = Array.from(enrollmentsByDate.entries()).map(([dateStr, count]) => {
          const date = new Date(dateStr);
          return {
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            enrollments: count
          };
        });

        setChartData(chartDataArray);
      } catch (error) {
        adminLogger.error('Error fetching admin dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
        </div>
      </div>

      <InstitutionalBottomNav items={navItems} />
    </div>
  );
};

export default AdminDashboard;
