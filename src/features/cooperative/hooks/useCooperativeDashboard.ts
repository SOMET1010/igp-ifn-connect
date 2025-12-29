/**
 * Hook pour les données du dashboard coopérative avec filtre temporel et realtime
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataFetching } from "@/hooks/useDataFetching";
import { supabase } from "@/integrations/supabase/client";
import { cooperativeService } from "../services/cooperativeService";
import type { DashboardData } from "../types/cooperative.types";
import type { DateFilterValue } from "../types/dateFilter.types";

interface RevenueDataPoint {
  date: string;
  label: string;
  revenue: number;
}

export function useCooperativeDashboard() {
  const { user } = useAuth();
  const [dateFilter, setDateFilter] = useState<DateFilterValue>('all');
  const [weeklyRevenue, setWeeklyRevenue] = useState<RevenueDataPoint[]>([]);

  const { 
    data, 
    isLoading, 
    error, 
    isNetworkError, 
    refetch,
    nextRetryIn,
    retryCount,
  } = useDataFetching<DashboardData>({
    fetchFn: () => {
      if (!user) throw new Error('Utilisateur non connecté');
      return cooperativeService.fetchDashboardData(user.id, dateFilter);
    },
    deps: [user?.id, dateFilter],
    enabled: !!user,
    retryDelay: 2000,
    maxRetries: 3,
  });

  const cooperative = data?.cooperative ?? null;
  const stats = data?.stats ?? { 
    products: 0, 
    pendingOrders: 0,
    confirmedOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    totalStockQuantity: 0,
    stockValue: 0,
    totalRevenue: 0,
  };

  // Charger les données de revenu hebdomadaire
  const loadWeeklyRevenue = useCallback(async () => {
    if (!cooperative?.id) return;
    try {
      const revenue = await cooperativeService.getWeeklyRevenue(cooperative.id);
      setWeeklyRevenue(revenue);
    } catch (err) {
      console.error('Failed to load weekly revenue:', err);
    }
  }, [cooperative?.id]);

  useEffect(() => {
    loadWeeklyRevenue();
  }, [loadWeeklyRevenue]);

  // Subscription Realtime pour les commandes
  useEffect(() => {
    if (!cooperative?.id) return;

    const channel = supabase
      .channel('cooperative-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `cooperative_id=eq.${cooperative.id}`,
        },
        () => {
          // Rafraîchir les données quand une commande change
          refetch();
          loadWeeklyRevenue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cooperative?.id, refetch, loadWeeklyRevenue]);

  return {
    cooperative,
    stats,
    dateFilter,
    setDateFilter,
    weeklyRevenue,
    isLoading,
    error,
    isNetworkError,
    refetch,
    nextRetryIn,
    retryCount,
  };
}
