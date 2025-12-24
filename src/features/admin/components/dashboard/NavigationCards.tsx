import React from 'react';
import { Store, Users, Wheat, Map as MapIcon } from 'lucide-react';
import { UnifiedActionCard } from '@/components/shared/UnifiedActionCard';
import type { AdminDashboardStats } from '../../types/dashboard.types';

interface NavigationCardsProps {
  stats: AdminDashboardStats;
  onNavigate: (path: string) => void;
}

export const NavigationCards: React.FC<NavigationCardsProps> = ({ stats, onNavigate }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <UnifiedActionCard
        title="Marchands"
        description={`${stats.merchants} inscrits`}
        icon={Store}
        onClick={() => onNavigate('/admin/marchands')}
        badge={stats.pendingMerchants}
        badgeVariant="warning"
      />
      <UnifiedActionCard
        title="Agents"
        description={`${stats.agents} actifs`}
        icon={Users}
        onClick={() => onNavigate('/admin/agents')}
      />
      <UnifiedActionCard
        title="Coopératives"
        description={`${stats.cooperatives} enregistrées`}
        icon={Wheat}
        onClick={() => onNavigate('/admin/cooperatives')}
      />
      <UnifiedActionCard
        title="Cartographie"
        description="Voir la carte"
        icon={MapIcon}
        onClick={() => onNavigate('/admin/carte')}
      />
    </div>
  );
};
