/**
 * Graphique des commandes par statut pour le dashboard coopérative
 * Design unifié avec le système institutionnel
 */
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ClipboardList } from 'lucide-react';
import type { DashboardStats } from '../../types/cooperative.types';
import { cn } from '@/shared/lib';

interface CooperativeOrdersChartProps {
  stats: DashboardStats;
  className?: string;
}

const chartColors = {
  pending: 'hsl(var(--warning))',
  confirmed: 'hsl(var(--primary))',
  inTransit: 'hsl(var(--secondary))',
  delivered: 'hsl(var(--success))',
};

export const CooperativeOrdersChart: React.FC<CooperativeOrdersChartProps> = ({ 
  stats,
  className
}) => {
  const data = [
    { name: 'Attente', value: stats.pendingOrders, color: chartColors.pending },
    { name: 'Confirmées', value: stats.confirmedOrders, color: chartColors.confirmed },
    { name: 'Transit', value: stats.inTransitOrders, color: chartColors.inTransit },
    { name: 'Livrées', value: stats.deliveredOrders, color: chartColors.delivered },
  ];

  const totalOrders = stats.pendingOrders + stats.confirmedOrders + stats.inTransitOrders + stats.deliveredOrders;

  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      {/* Header unifié */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <ClipboardList className="h-4 w-4 text-primary" />
          <span>Commandes par statut</span>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {totalOrders === 0 ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Aucune commande pour le moment
          </div>
        ) : (
          <>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    width={70}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center pt-2 border-t border-border mt-2">
              <span className="text-xs text-muted-foreground">
                Total: <strong className="text-foreground">{totalOrders}</strong> commandes
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
