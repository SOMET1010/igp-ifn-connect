/**
 * Hook pour les notifications coopérative
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LOW_STOCK_THRESHOLD, EXPIRY_WARNING_DAYS } from "../types/stock.types";

export interface CooperativeNotifications {
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringStockCount: number;
  totalAlerts: number;
  isLoading: boolean;
}

export function useCooperativeNotifications(): CooperativeNotifications {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['cooperative-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: cooperative } = await supabase
        .from('cooperatives')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!cooperative) return null;

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

      const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
      const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;

      const lowStockCount = stocks.filter(s => s.quantity > 0 && s.quantity <= LOW_STOCK_THRESHOLD).length;
      const outOfStockCount = stocks.filter(s => s.quantity === 0).length;

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
    staleTime: 60000,
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
