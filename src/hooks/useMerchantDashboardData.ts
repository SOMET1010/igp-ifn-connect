import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { merchantLogger } from '@/infra/logger';
import type { MerchantDashboardViewData } from '@/shared/types';

export interface DailySales {
  date: string;
  total: number;
  displayDate: string;
}

export interface MerchantDashboardData {
  merchant: MerchantDashboardViewData;
  todayTotal: number;
  chartData: DailySales[];
  weeklyTotal: number;
  trend: number;
}

async function fetchMerchantDashboardData(userId: string): Promise<MerchantDashboardData> {
  merchantLogger.debug('Fetching merchant dashboard data', { userId });

  // Step 1: Get merchant (required first)
  const { data: merchantData, error: merchantError } = await supabase
    .from('merchants')
    .select('id, full_name, activity_type, market_id')
    .eq('user_id', userId)
    .single();

  if (merchantError) throw merchantError;
  if (!merchantData) throw new Error('Marchand non trouvé');

  // Step 2: Parallel fetch all dependent data
  const sevenDaysAgo = startOfDay(subDays(new Date(), 6));

  const [marketResult, todayTotalResult, weeklyTransactionsResult] = await Promise.all([
    // Fetch market name (if exists)
    merchantData.market_id
      ? supabase.from('markets').select('name').eq('id', merchantData.market_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    
    // RPC for today's total (server-side aggregation)
    supabase.rpc('get_merchant_today_total', { _merchant_id: merchantData.id }),
    
    // Weekly transactions for chart
    supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('merchant_id', merchantData.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true }),
  ]);

  // Handle errors
  if (todayTotalResult.error) throw todayTotalResult.error;
  if (weeklyTransactionsResult.error) throw weeklyTransactionsResult.error;

  const marketName = marketResult.data?.name || '';
  const todayTotal = Number(todayTotalResult.data) || 0;

  // Process chart data
  const dailyTotals: Record<string, number> = {};
  
  // Initialize all 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateKey = format(date, 'yyyy-MM-dd');
    dailyTotals[dateKey] = 0;
  }

  // Sum transactions by day
  const transactions = weeklyTransactionsResult.data || [];
  transactions.forEach((tx) => {
    const dateKey = format(new Date(tx.created_at), 'yyyy-MM-dd');
    if (dailyTotals[dateKey] !== undefined) {
      dailyTotals[dateKey] += Number(tx.amount);
    }
  });

  // Convert to array for chart
  const chartData: DailySales[] = Object.entries(dailyTotals).map(([date, total]) => ({
    date,
    total,
    displayDate: format(new Date(date), 'EEE', { locale: fr }),
  }));

  const weeklyTotal = chartData.reduce((sum, d) => sum + d.total, 0);

  // Calculate trend (compare last 3 days to previous 3 days)
  let trend = 0;
  const last3 = chartData.slice(-3).reduce((sum, d) => sum + d.total, 0);
  const prev3 = chartData.slice(0, 3).reduce((sum, d) => sum + d.total, 0);
  if (prev3 > 0) {
    trend = ((last3 - prev3) / prev3) * 100;
  } else if (last3 > 0) {
    trend = 100;
  }

  merchantLogger.info('Merchant dashboard data loaded', {
    merchantName: merchantData.full_name,
    todayTotal,
    weeklyTotal,
  });

  return {
    merchant: {
      full_name: merchantData.full_name,
      activity_type: merchantData.activity_type,
      market_name: marketName,
    },
    todayTotal,
    chartData,
    weeklyTotal,
    trend,
  };
}

export function useMerchantDashboardData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['merchant-dashboard', user?.id],
    queryFn: () => fetchMerchantDashboardData(user!.id),
    enabled: !!user,
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}
