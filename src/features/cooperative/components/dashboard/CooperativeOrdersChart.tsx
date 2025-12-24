/**
 * Graphique des commandes par statut pour le dashboard coopérative
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import type { DashboardStats } from '../../types/cooperative.types';

interface CooperativeOrdersChartProps {
  stats: DashboardStats;
}

const chartConfig = {
  pending: {
    label: "En attente",
    color: "hsl(var(--chart-3))",
  },
  confirmed: {
    label: "Confirmées",
    color: "hsl(var(--chart-2))",
  },
  inTransit: {
    label: "En transit",
    color: "hsl(var(--chart-1))",
  },
  delivered: {
    label: "Livrées",
    color: "hsl(var(--chart-4))",
  },
};

export const CooperativeOrdersChart: React.FC<CooperativeOrdersChartProps> = ({ 
  stats 
}) => {
  const data = [
    { name: 'Attente', value: stats.pendingOrders, color: chartConfig.pending.color },
    { name: 'Confirmées', value: stats.confirmedOrders, color: chartConfig.confirmed.color },
    { name: 'Transit', value: stats.inTransitOrders, color: chartConfig.inTransit.color },
    { name: 'Livrées', value: stats.deliveredOrders, color: chartConfig.delivered.color },
  ];

  const totalOrders = stats.pendingOrders + stats.confirmedOrders + stats.inTransitOrders + stats.deliveredOrders;

  if (totalOrders === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Commandes par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-6">
            Aucune commande pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Commandes par statut</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                width={70}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>Total: <strong>{totalOrders}</strong> commandes</span>
        </div>
      </CardContent>
    </Card>
  );
};
