/**
 * Cartes de statistiques des membres
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield, Building2, CheckCircle } from 'lucide-react';
import type { MemberStats } from '../../types/member.types';

interface MemberStatsCardsProps {
  stats: MemberStats;
}

export const MemberStatsCards: React.FC<MemberStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total Membres',
      value: stats.total,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Affiliés CMU',
      value: stats.withCMU,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Affiliés CNPS',
      value: stats.withCNPS,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'CMU + CNPS',
      value: stats.withBoth,
      icon: CheckCircle,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
