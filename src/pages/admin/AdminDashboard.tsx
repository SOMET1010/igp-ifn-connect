import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Store, 
  Wheat, 
  Map, 
  LogOut,
  Home,
  Settings,
  TrendingUp,
  Loader2,
  DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Map, label: 'Carte', path: '/admin/carte' },
    { icon: Settings, label: 'Paramètres', path: '/admin' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-violet-700 bg-violet-100" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

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

  useEffect(() => {
    const fetchData = async () => {
      // Fetch merchants count
      const { count: merchantsCount } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true });

      const { count: pendingCount } = await supabase
        .from('merchants')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch agents count
      const { count: agentsCount } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true });

      // Fetch cooperatives count
      const { count: cooperativesCount } = await supabase
        .from('cooperatives')
        .select('*', { count: 'exact', head: true });

      // Fetch total transactions
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

      // Generate mock chart data for enrollments
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          enrollments: Math.floor(Math.random() * 20) + 5
        };
      });
      setChartData(last7Days);

      setIsLoading(false);
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
        <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-violet-800 to-violet-700 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏛️</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Administration IFN</h1>
              <p className="text-sm text-white/80">Direction Générale des Entreprises</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-white/10">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                <Store className="h-5 w-5 text-green-700" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.merchants}</p>
              <p className="text-xs text-muted-foreground">Marchands</p>
              {stats.pendingMerchants > 0 && (
                <p className="text-xs text-amber-600 mt-1">{stats.pendingMerchants} en attente</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.agents}</p>
              <p className="text-xs text-muted-foreground">Agents</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="w-10 h-10 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-2">
                <Wheat className="h-5 w-5 text-amber-700" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.cooperatives}</p>
              <p className="text-xs text-muted-foreground">Coopératives</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-3">
              <div className="w-10 h-10 mx-auto bg-violet-100 rounded-full flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-violet-700" />
              </div>
              <p className="text-xl font-bold text-foreground">
                {(stats.totalTransactions / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground">FCFA Transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-600" />
                Enrôlements (7 derniers jours)
              </h3>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="enrollments" 
                    stroke="#7c3aed" 
                    fill="url(#enrollmentGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Navigation cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/marchands')}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Store className="h-7 w-7 text-green-700" />
              </div>
              <h3 className="font-semibold text-foreground">Marchands</h3>
              <p className="text-sm text-muted-foreground">{stats.merchants} inscrits</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/agents')}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Users className="h-7 w-7 text-blue-700" />
              </div>
              <h3 className="font-semibold text-foreground">Agents</h3>
              <p className="text-sm text-muted-foreground">{stats.agents} actifs</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/cooperatives')}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                <Wheat className="h-7 w-7 text-amber-700" />
              </div>
              <h3 className="font-semibold text-foreground">Coopératives</h3>
              <p className="text-sm text-muted-foreground">{stats.cooperatives} enregistrées</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/carte')}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mb-3">
                <Map className="h-7 w-7 text-violet-700" />
              </div>
              <h3 className="font-semibold text-foreground">Cartographie</h3>
              <p className="text-sm text-muted-foreground">Voir la carte</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminDashboard;
