/**
 * Hook pour les données du dashboard agent
 * Migré vers TanStack Query pour standardisation et cache automatique
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { agentService } from "../services/agentService";
import type { AgentDashboardData } from "../types/agent.types";

const defaultStats = {
  today: 0,
  week: 0,
  total: 0,
  validated: 0,
  pending: 0,
  rejected: 0,
  validationRate: 0,
  weeklyEnrollments: [],
};

export function useAgentDashboard() {
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<AgentDashboardData>({
    queryKey: ['agent-dashboard', user?.id],
    queryFn: () => {
      if (!user) throw new Error("User not authenticated");
      return agentService.getDashboardData(user.id);
    },
    enabled: !!user,
    staleTime: 30_000, // 30 secondes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Déterminer si c'est une erreur réseau
  const isNetworkError = error instanceof Error && 
    (error.message.includes('fetch') || error.message.includes('network'));

  return {
    profile: data?.profile ?? null,
    stats: data?.stats ?? defaultStats,
    isAgentRegistered: data?.isAgentRegistered ?? false,
    isLoading,
    error: error instanceof Error ? error : null,
    isNetworkError,
    refetch,
    // Pour compatibilité avec l'ancien hook
    nextRetryIn: null,
    retryCount: 0,
  };
}
