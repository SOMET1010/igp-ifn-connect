/**
 * Composant affichant les statistiques du producteur
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import type { ProducerStats as ProducerStatsType } from '../types/producer.types';

interface ProducerStatsProps {
  stats: ProducerStatsType | undefined;
  isLoading?: boolean;
}

export const ProducerStats: React.FC<ProducerStatsProps> = ({ stats, isLoading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const items = [
    {
      label: 'Récoltes disponibles',
      value: stats?.availableHarvests || 0,
      icon: Sprout,
      color: 'text-emerald-600 bg-emerald-100',
    },
    {
      label: 'Récoltes totales',
      value: stats?.totalHarvests || 0,
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Commandes en cours',
      value: stats?.pendingOrders || 0,
      icon: ShoppingCart,
      color: 'text-amber-600 bg-amber-100',
    },
    {
      label: 'Revenus du mois',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <Card key={item.label} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
