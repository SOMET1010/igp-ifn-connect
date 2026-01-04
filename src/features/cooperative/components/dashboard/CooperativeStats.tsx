/**
 * Composant de statistiques enrichies du dashboard coopérative
 */
import React from 'react';
import { StatCard } from '@/components/shared/StatCard';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Truck,
  Warehouse
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DashboardStats } from '../../types/cooperative.types';

interface CooperativeStatsProps {
  stats: DashboardStats;
  membersCount: number | null;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR').format(Math.round(value));
};

export const CooperativeStats: React.FC<CooperativeStatsProps> = ({ 
  stats, 
  membersCount 
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      {/* Première ligne - Membres et Stock */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title={t("members")}
          value={membersCount ?? 0}
          icon={Users}
        />
        <StatCard
          title={t("products")}
          value={stats.products}
          icon={Package}
        />
      </div>

      {/* Deuxième ligne - Valeur stock et quantité */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Valeur stock"
          value={`${formatCurrency(stats.stockValue)} F`}
          icon={Warehouse}
        />
        <StatCard
          title="Quantité totale"
          value={`${formatCurrency(stats.totalStockQuantity)} kg`}
          icon={Package}
        />
      </div>

      {/* Troisième ligne - Commandes */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          title={t("pending")}
          value={stats.pendingOrders}
          icon={ShoppingCart}
          variant={stats.pendingOrders > 0 ? "warning" : "default"}
        />
        <StatCard
          title="En transit"
          value={stats.inTransitOrders}
          icon={Truck}
          variant={stats.inTransitOrders > 0 ? "primary" : "default"}
        />
        <StatCard
          title="Livrées"
          value={stats.deliveredOrders}
          icon={TrendingUp}
          variant={stats.deliveredOrders > 0 ? "success" : "default"}
        />
      </div>

      {/* Chiffre d'affaires */}
      {stats.totalRevenue > 0 && (
        <div className="bg-primary/10 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Chiffre d'affaires</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(stats.totalRevenue)} FCFA
          </p>
        </div>
      )}
    </div>
  );
};
