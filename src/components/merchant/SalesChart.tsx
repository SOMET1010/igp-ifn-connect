import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { DailySales } from '@/hooks/useMerchantDashboardData';

interface SalesChartProps {
  data?: DailySales[];
  weeklyTotal?: number;
  trend?: number;
  isLoading?: boolean;
}

export function SalesChart({ data = [], weeklyTotal = 0, trend = 0, isLoading = false }: SalesChartProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Card className="card-institutional overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-8 w-48 mt-2" />
        </CardHeader>
        <CardContent className="pb-4 px-2">
          <div className="h-40 w-full flex items-center justify-center">
            <Skeleton className="h-32 w-full" />
          </div>
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
          {weeklyTotal.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">FCFA / 7 jours</span>
        </p>
      </CardHeader>
      <CardContent className="pb-4 px-2">
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
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
              <YAxis hide />
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
