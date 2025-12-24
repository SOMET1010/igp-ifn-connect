import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { AdminDashboardStats, ChartDataPoint } from '../types/dashboard.types';

export const useAdminDashboard = () => {
  const query = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => dashboardService.fetchDashboardData(),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!query.data?.enrollments) return [];
    return dashboardService.calculateChartData(query.data.enrollments);
  }, [query.data?.enrollments]);

  const defaultStats: AdminDashboardStats = {
    merchants: 0,
    pendingMerchants: 0,
    agents: 0,
    cooperatives: 0,
    totalTransactions: 0
  };

  return {
    stats: query.data?.stats ?? defaultStats,
    chartData,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
