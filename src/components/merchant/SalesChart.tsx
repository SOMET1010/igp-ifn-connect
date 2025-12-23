import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { merchantLogger } from '@/infra/logger';

interface DailySales {
  date: string;
  total: number;
  displayDate: string;
}

export function SalesChart() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [salesData, setSalesData] = useState<DailySales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trend, setTrend] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesData = async () => {
    if (!user) return;

    try {
      setError(null);
      // Get merchant ID
      const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (merchantError) throw merchantError;

      if (!merchant) {
        setIsLoading(false);
        return;
      }

      // Get last 7 days of transactions
      const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
      
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('merchant_id', merchant.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (txError) throw txError;

      // Group by day
      const dailyTotals: Record<string, number> = {};
      
      // Initialize all 7 days with 0
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateKey = format(date, 'yyyy-MM-dd');
        dailyTotals[dateKey] = 0;
      }

      // Sum transactions by day
      if (transactions) {
        transactions.forEach((tx) => {
          const dateKey = format(new Date(tx.created_at), 'yyyy-MM-dd');
          if (dailyTotals[dateKey] !== undefined) {
            dailyTotals[dateKey] += Number(tx.amount);
          }
        });
      }

      // Convert to array for chart
      const chartData: DailySales[] = Object.entries(dailyTotals).map(([date, total]) => ({
        date,
        total,
        displayDate: format(new Date(date), 'EEE', { locale: fr }),
      }));

      setSalesData(chartData);

      // Calculate trend (compare last 3 days to previous 3 days)
      const last3 = chartData.slice(-3).reduce((sum, d) => sum + d.total, 0);
      const prev3 = chartData.slice(0, 3).reduce((sum, d) => sum + d.total, 0);
      if (prev3 > 0) {
        setTrend(((last3 - prev3) / prev3) * 100);
      } else if (last3 > 0) {
        setTrend(100);
      }
    } catch (err) {
      merchantLogger.error('Error fetching sales data', err);
      setError('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [user]);

  const totalWeek = salesData.reduce((sum, d) => sum + d.total, 0);

  if (isLoading) {
    return (
      <Card className="card-institutional">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-institutional">
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="h-8 w-8 text-destructive/70" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              fetchSalesData();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-institutional overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            {t('sales_evolution') || 'Évolution des ventes'}
          </CardTitle>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend > 0 ? 'text-secondary' : 'text-destructive'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {Math.abs(trend).toFixed(0)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-primary">
          {totalWeek.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">FCFA / 7 jours</span>
        </p>
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="displayDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                hide
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Ventes']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#salesGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
