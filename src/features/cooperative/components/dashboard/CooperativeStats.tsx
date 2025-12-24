/**
 * Composant de statistiques du dashboard coopérative
 */
import React from 'react';
import { UnifiedStatCard } from '@/components/shared/UnifiedStatCard';
import { Users, Package, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DashboardStats } from '../../types/cooperative.types';

interface CooperativeStatsProps {
  stats: DashboardStats;
  membersCount: number | null;
}

export const CooperativeStats: React.FC<CooperativeStatsProps> = ({ 
  stats, 
  membersCount 
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-3 gap-3">
      <UnifiedStatCard
        title={t("members")}
        value={membersCount ?? 0}
        icon={Users}
      />
      <UnifiedStatCard
        title={t("products")}
        value={stats.products}
        icon={Package}
      />
      <UnifiedStatCard
        title={t("pending")}
        value={stats.pendingOrders}
        icon={ShoppingCart}
      />
    </div>
  );
};
