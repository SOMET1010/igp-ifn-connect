import React from 'react';
import { Store, Users, Wheat, DollarSign } from 'lucide-react';
import { StatCard } from '@/shared/ui';
import type { AdminDashboardStats } from '../../types/dashboard.types';

interface AdminStatsProps {
  stats: AdminDashboardStats;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        title="Marchands"
        value={stats.merchants}
        icon={Store}
        subtitle={stats.pendingMerchants > 0 ? `${stats.pendingMerchants} en attente` : undefined}
        variant={stats.pendingMerchants > 0 ? 'warning' : 'default'}
      />
      <StatCard
        title="Agents"
        value={stats.agents}
        icon={Users}
      />
      <StatCard
        title="Coopératives"
        value={stats.cooperatives}
        icon={Wheat}
      />
      <StatCard
        title="Transactions"
        value={`${(stats.totalTransactions / 1000000).toFixed(1)}M`}
        icon={DollarSign}
        subtitle="FCFA"
      />
    </div>
  );
};
