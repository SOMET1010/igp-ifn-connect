/**
 * Hook pour les données du dashboard coopérative avec filtre temporel et realtime
 * Migré vers TanStack Query pour standardisation et cache automatique
 */
import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cooperativeService } from "../services/cooperativeService";
import type { DateFilterValue } from "../types/dateFilter.types";

interface RevenueDataPoint {
  date: string;
  label: string;
  revenue: number;
}

export function useCooperativeDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dateFilter, setDateFilter] = useState<DateFilterValue>('all');

  // Query principale pour les données du dashboard
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cooperative-dashboard', user?.id, dateFilter],
    queryFn: () => {
      if (!user) throw new Error('Utilisateur non connecté');
      return cooperativeService.fetchDashboardData(user.id, dateFilter);
    },
    enabled: !!user,
    staleTime: 30_000, // 30 secondes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
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

  // Query pour les revenus hebdomadaires
  const { data: weeklyRevenue = [] } = useQuery<RevenueDataPoint[]>({
    queryKey: ['cooperative-weekly-revenue', cooperative?.id],
    queryFn: () => {
      if (!cooperative?.id) return [];
      return cooperativeService.getWeeklyRevenue(cooperative.id);
    },
    enabled: !!cooperative?.id,
    staleTime: 60_000, // 1 minute
  });

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
          // Invalider les queries pour forcer le refetch
          queryClient.invalidateQueries({ queryKey: ['cooperative-dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['cooperative-weekly-revenue'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cooperative?.id, queryClient]);

  // Déterminer si c'est une erreur réseau
  const isNetworkError = error instanceof Error && 
    (error.message.includes('fetch') || error.message.includes('network'));

  return {
    cooperative,
    stats,
    dateFilter,
    setDateFilter,
    weeklyRevenue,
    isLoading,
    error: error instanceof Error ? error : null,
    isNetworkError,
    refetch,
    // Pour compatibilité avec l'ancien hook
    nextRetryIn: null,
    retryCount: 0,
  };
}
