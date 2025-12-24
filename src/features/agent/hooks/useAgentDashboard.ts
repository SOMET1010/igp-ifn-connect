import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDataFetching } from "@/hooks/useDataFetching";
import { agentService } from "../services/agentService";
import type { AgentDashboardData } from "../types/agent.types";

export function useAgentDashboard() {
  const { user } = useAuth();

  const fetchDashboardData = useCallback(async (): Promise<AgentDashboardData> => {
    if (!user) throw new Error("User not authenticated");
    return agentService.getDashboardData(user.id);
  }, [user]);

  const {
    data,
    isLoading,
    error,
    isNetworkError,
    refetch,
    nextRetryIn,
    retryCount,
  } = useDataFetching<AgentDashboardData>({
    fetchFn: fetchDashboardData,
    deps: [user?.id],
    enabled: !!user,
    retryDelay: 2000,
    maxRetries: 3,
  });

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

  return {
    profile: data?.profile ?? null,
    stats: data?.stats ?? defaultStats,
    isAgentRegistered: data?.isAgentRegistered ?? false,
    isLoading,
    error,
    isNetworkError,
    refetch,
    nextRetryIn,
    retryCount,
  };
}
