import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Wallet,
  ShoppingCart,
  Loader2,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface AnalyticsData {
  totalMerchants: number;
  activeMerchants: number;
  totalAgents: number;
  totalTransactions: number;
  totalVolume: number;
  avgTransaction: number;
  cmuCollected: number;
  rstiGenerated: number;
}

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [data, setData] = useState<AnalyticsData>({
    totalMerchants: 0,
    activeMerchants: 0,
    totalAgents: 0,
    totalTransactions: 0,
    totalVolume: 0,
    avgTransaction: 0,
    cmuCollected: 0,
    rstiGenerated: 0
  });

  // Chart data
  const [transactionsByDay, setTransactionsByDay] = useState<Array<{date: string, amount: number, count: number}>>([]);
  const [paymentTypes, setPaymentTypes] = useState<Array<{name: string, value: number}>>([]);
  const [topMerchants, setTopMerchants] = useState<Array<{name: string, volume: number}>>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [user, period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case "week": startDate.setDate(now.getDate() - 7); break;
      case "month": startDate.setMonth(now.getMonth() - 1); break;
      case "year": startDate.setFullYear(now.getFullYear() - 1); break;
    }

    // Fetch merchants count
    const { count: merchantsCount } = await supabase
      .from("merchants")
      .select("*", { count: "exact", head: true });

    const { count: activeCount } = await supabase
      .from("merchants")
      .select("*", { count: "exact", head: true })
      .eq("status", "validated");

    // Fetch agents count
    const { count: agentsCount } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true });

    // Fetch transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, created_at, transaction_type, cmu_deduction, rsti_deduction, merchant_id")
      .gte("created_at", startDate.toISOString());

    const totalVolume = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const cmuCollected = transactions?.reduce((sum, t) => sum + Number(t.cmu_deduction || 0), 0) || 0;
    const rstiGenerated = transactions?.reduce((sum, t) => sum + Number(t.rsti_deduction || 0), 0) || 0;

    setData({
      totalMerchants: merchantsCount || 0,
      activeMerchants: activeCount || 0,
      totalAgents: agentsCount || 0,
      totalTransactions: transactions?.length || 0,
      totalVolume,
      avgTransaction: transactions?.length ? totalVolume / transactions.length : 0,
      cmuCollected,
      rstiGenerated
    });

    // Generate transactions by day chart data
    const byDay: Record<string, { amount: number; count: number }> = {};
    transactions?.forEach(t => {
      const date = new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      if (!byDay[date]) byDay[date] = { amount: 0, count: 0 };
      byDay[date].amount += Number(t.amount);
      byDay[date].count += 1;
    });
    setTransactionsByDay(Object.entries(byDay).map(([date, vals]) => ({ date, ...vals })));

    // Payment types distribution
    const types: Record<string, number> = { cash: 0, mobile_money: 0, card: 0 };
    transactions?.forEach(t => {
      types[t.transaction_type] = (types[t.transaction_type] || 0) + Number(t.amount);
    });
    setPaymentTypes([
      { name: "Espèces", value: types.cash || 0 },
      { name: "Mobile Money", value: types.mobile_money || 0 },
      { name: "Carte", value: types.card || 0 }
    ]);

    // Top merchants
    const merchantVolumes: Record<string, number> = {};
    transactions?.forEach(t => {
      merchantVolumes[t.merchant_id] = (merchantVolumes[t.merchant_id] || 0) + Number(t.amount);
    });
    
    const merchantIds = Object.keys(merchantVolumes).slice(0, 5);
    if (merchantIds.length > 0) {
      const { data: merchantNames } = await supabase
        .from("merchants")
        .select("id, full_name")
        .in("id", merchantIds);
      
      const topData = merchantIds.map(id => ({
        name: merchantNames?.find(m => m.id === id)?.full_name || "Inconnu",
        volume: merchantVolumes[id]
      })).sort((a, b) => b.volume - a.volume);
      setTopMerchants(topData);
    }

    setIsLoading(false);
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  const chartConfig = {
    amount: { label: "Montant", color: "hsl(var(--primary))" },
    count: { label: "Nombre", color: "hsl(var(--secondary))" }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Analytics</h1>
            <p className="text-sm text-sidebar-foreground/70">Tableaux de bord détaillés</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32 bg-sidebar-accent border-sidebar-border">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
              <SelectItem value="year">Année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Volume total</p>
                  <p className="text-lg font-bold text-foreground">{(data.totalVolume / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <ShoppingCart className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold text-foreground">{data.totalTransactions}</p>
                  <p className="text-xs text-muted-foreground">Moy: {Math.round(data.avgTransaction).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Wallet className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CMU collecté</p>
                  <p className="text-lg font-bold text-foreground">{data.cmuCollected.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Marchands</p>
                  <p className="text-lg font-bold text-foreground">{data.totalMerchants}</p>
                  <p className="text-xs text-secondary">{data.activeMerchants} actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Évolution des transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsByDay.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <AreaChart data={transactionsByDay}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Aucune donnée pour cette période
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Payment Types */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" />
                Répartition des paiements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentTypes.some(p => p.value > 0) ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentTypes.filter(p => p.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentTypes.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Aucune donnée
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Merchants */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Marchands
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topMerchants.length > 0 ? (
                <div className="space-y-3">
                  {topMerchants.map((merchant, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary w-6">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{merchant.name}</p>
                        <div className="w-full bg-muted rounded-full h-2 mt-1">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(merchant.volume / topMerchants[0].volume) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-foreground whitespace-nowrap">
                        {(merchant.volume / 1000).toFixed(0)}k
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Aucune donnée
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
