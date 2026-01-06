/**
 * Composant de statistiques enrichies du dashboard coopérative
 * Design unifié avec le système institutionnel
 */
import React from 'react';
import { StatCard } from '@/shared/ui';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Truck,
  Warehouse
} from 'lucide-react';
import { useLanguage } from '@/shared/contexts';
import type { DashboardStats } from '../../types/cooperative.types';
import { cn } from '@/shared/lib';

interface CooperativeStatsProps {
  stats: DashboardStats;
  membersCount: number | null;
  className?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR').format(Math.round(value));
};

export const CooperativeStats: React.FC<CooperativeStatsProps> = ({ 
  stats, 
  membersCount,
  className
}) => {
  const { t } = useLanguage();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Première ligne - Membres et Stock */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title={t("members")}
          value={membersCount ?? 0}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title={t("products")}
          value={stats.products}
          icon={Package}
        />
      </div>

      {/* Deuxième ligne - Valeur stock et quantité */}
      <div className="grid grid-cols-2 gap-4">
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

      {/* Troisième ligne - Commandes (3 colonnes) */}
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

      {/* Chiffre d'affaires - Affichage conditionnel */}
      {stats.totalRevenue > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Chiffre d'affaires</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(stats.totalRevenue)} FCFA
          </p>
        </div>
      )}
    </div>
  );
};
