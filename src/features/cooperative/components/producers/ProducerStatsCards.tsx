/**
 * Cartes de statistiques des producteurs
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Award } from 'lucide-react';

interface ProducerStatsCardsProps {
  stats: {
    total: number;
    active: number;
    certified: number;
  };
}

export const ProducerStatsCards: React.FC<ProducerStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total',
      value: stats.total,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Actifs',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Certifiés IGP',
      value: stats.certified,
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className={`p-2 rounded-lg ${card.bgColor} inline-block mb-2`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
