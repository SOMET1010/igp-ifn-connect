/**
 * Graphique du chiffre d'affaires hebdomadaire de la coopérative
 * Design unifié avec le système institutionnel
 */
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib';

interface RevenueDataPoint {
  date: string;
  label: string;
  revenue: number;
}

interface CooperativeRevenueChartProps {
  data: RevenueDataPoint[];
  totalRevenue: number;
  className?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(value) + ' F';
};

export const CooperativeRevenueChart: React.FC<CooperativeRevenueChartProps> = ({ 
  data, 
  totalRevenue,
  className
}) => {
  const hasData = data.some(d => d.revenue > 0);

  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      {/* Header unifié */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Chiffre d'affaires (7 jours)</span>
        </div>
        {hasData && (
          <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(totalRevenue)}</p>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        {!hasData ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Aucune vente cette semaine
          </div>
        ) : (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'CA']}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
};
