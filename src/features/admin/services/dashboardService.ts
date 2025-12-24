import { supabase } from '@/integrations/supabase/client';
import { adminLogger } from '@/infra/logger';
import type { AdminDashboardStats, AdminDashboardData } from '../types/dashboard.types';

export const dashboardService = {
  async fetchDashboardData(): Promise<AdminDashboardData> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      merchantsRes,
      pendingRes,
      agentsRes,
      cooperativesRes,
      totalAmountRes,
      enrollmentRes
    ] = await Promise.all([
      supabase.from('merchants').select('*', { count: 'exact', head: true }),
      supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('agents').select('*', { count: 'exact', head: true }),
      supabase.from('cooperatives').select('*', { count: 'exact', head: true }),
      supabase.rpc('get_total_transactions_amount'),
      supabase
        .from('merchants')
        .select('enrolled_at')
        .gte('enrolled_at', sevenDaysAgo.toISOString())
        .order('enrolled_at', { ascending: true })
    ]);

    if (merchantsRes.error) adminLogger.error('Error fetching merchants count', merchantsRes.error);
    if (pendingRes.error) adminLogger.error('Error fetching pending count', pendingRes.error);
    if (agentsRes.error) adminLogger.error('Error fetching agents count', agentsRes.error);
    if (cooperativesRes.error) adminLogger.error('Error fetching cooperatives count', cooperativesRes.error);
    if (totalAmountRes.error) adminLogger.error('Error fetching total amount', totalAmountRes.error);
    if (enrollmentRes.error) adminLogger.error('Error fetching enrollments', enrollmentRes.error);

    return {
      stats: {
        merchants: merchantsRes.count ?? 0,
        pendingMerchants: pendingRes.count ?? 0,
        agents: agentsRes.count ?? 0,
        cooperatives: cooperativesRes.count ?? 0,
        totalTransactions: Number(totalAmountRes.data) || 0
      },
      enrollments: enrollmentRes.data ?? []
    };
  },

  calculateChartData(enrollments: { enrolled_at: string }[]): { date: string; enrollments: number }[] {
    const enrollmentsByDate = new Map<string, number>();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateKey = date.toISOString().split('T')[0];
      enrollmentsByDate.set(dateKey, 0);
    }

    enrollments.forEach((merchant) => {
      const dateKey = merchant.enrolled_at.split('T')[0];
      if (enrollmentsByDate.has(dateKey)) {
        enrollmentsByDate.set(dateKey, (enrollmentsByDate.get(dateKey) ?? 0) + 1);
      }
    });

    return Array.from(enrollmentsByDate.entries()).map(([dateStr, count]) => {
      const date = new Date(dateStr);
      return {
        date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        enrollments: count
      };
    });
  }
};
