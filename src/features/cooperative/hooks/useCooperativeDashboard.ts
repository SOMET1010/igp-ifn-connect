/**
 * Hook pour les données du dashboard coopérative
 */
import { useAuth } from "@/contexts/AuthContext";
import { useDataFetching } from "@/hooks/useDataFetching";
import { cooperativeService } from "../services/cooperativeService";
import type { DashboardData } from "../types/cooperative.types";

export function useCooperativeDashboard() {
  const { user } = useAuth();

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
      return cooperativeService.fetchDashboardData(user.id);
    },
    deps: [user?.id],
    enabled: !!user,
    retryDelay: 2000,
    maxRetries: 3,
  });

  const cooperative = data?.cooperative ?? null;
  const stats = data?.stats ?? { products: 0, pendingOrders: 0 };

  return {
    cooperative,
    stats,
    isLoading,
    error,
    isNetworkError,
    refetch,
    nextRetryIn,
    retryCount,
  };
}
