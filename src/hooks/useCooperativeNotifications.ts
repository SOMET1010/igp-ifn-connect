import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CooperativeNotifications {
  // Orders
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  
  // Stock
  lowStockCount: number;
  outOfStockCount: number;
  expiringStockCount: number;
  
  // Totals
  totalAlerts: number;
  
  // State
  isLoading: boolean;
}

const LOW_STOCK_THRESHOLD = 10;
const EXPIRY_WARNING_DAYS = 7;

export function useCooperativeNotifications(): CooperativeNotifications {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['cooperative-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get cooperative ID
      const { data: cooperative } = await supabase
        .from('cooperatives')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cooperative) return null;

      // Fetch orders and stocks in parallel
      const [ordersResult, stocksResult] = await Promise.all([
        supabase
          .from('orders')
          .select('status')
          .eq('cooperative_id', cooperative.id),
        supabase
          .from('stocks')
          .select('quantity, expiry_date')
          .eq('cooperative_id', cooperative.id)
      ]);

      const orders = ordersResult.data || [];
      const stocks = stocksResult.data || [];

      // Count order alerts
      const pendingOrdersCount = orders.filter(
        o => o.status === 'pending'
      ).length;
      
      const cancelledOrdersCount = orders.filter(
        o => o.status === 'cancelled'
      ).length;

      // Count stock alerts
      const lowStockCount = stocks.filter(
        s => s.quantity > 0 && s.quantity <= LOW_STOCK_THRESHOLD
      ).length;
      
      const outOfStockCount = stocks.filter(
        s => s.quantity === 0
      ).length;

      // Products expiring soon (within 7 days)
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + EXPIRY_WARNING_DAYS);
      const warningDateStr = warningDate.toISOString().split('T')[0];

      const expiringStockCount = stocks.filter(
        s => s.expiry_date && s.expiry_date <= warningDateStr && s.quantity > 0
      ).length;

      return {
        pendingOrdersCount,
        cancelledOrdersCount,
        lowStockCount,
        outOfStockCount,
        expiringStockCount
      };
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true
  });

  const lowStockCount = data?.lowStockCount ?? 0;
  const outOfStockCount = data?.outOfStockCount ?? 0;
  const expiringStockCount = data?.expiringStockCount ?? 0;

  return {
    pendingOrdersCount: data?.pendingOrdersCount ?? 0,
    cancelledOrdersCount: data?.cancelledOrdersCount ?? 0,
    lowStockCount,
    outOfStockCount,
    expiringStockCount,
    totalAlerts: lowStockCount + outOfStockCount + expiringStockCount,
    isLoading
  };
}
