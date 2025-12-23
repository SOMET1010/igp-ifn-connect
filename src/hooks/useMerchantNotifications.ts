import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MerchantNotifications {
  lowStockCount: number;
  outOfStockCount: number;
  overdueCreditsCount: number;
  pendingCreditsCount: number;
  isLoading: boolean;
}

export function useMerchantNotifications(): MerchantNotifications {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['merchant-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get merchant ID
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!merchant) return null;

      // Fetch stock alerts and credits in parallel
      const [stockResult, creditsResult] = await Promise.all([
        supabase
          .from('merchant_stocks')
          .select('quantity, min_threshold')
          .eq('merchant_id', merchant.id),
        supabase
          .from('customer_credits')
          .select('status, due_date')
          .eq('merchant_id', merchant.id)
          .neq('status', 'paid')
      ]);

      const stocks = stockResult.data || [];
      const credits = creditsResult.data || [];

      // Count stock alerts
      const lowStockCount = stocks.filter(
        s => s.quantity > 0 && s.quantity <= (s.min_threshold || 5)
      ).length;
      
      const outOfStockCount = stocks.filter(s => s.quantity === 0).length;

      // Count credit alerts
      const today = new Date().toISOString().split('T')[0];
      const overdueCreditsCount = credits.filter(
        c => c.due_date && c.due_date < today
      ).length;
      
      const pendingCreditsCount = credits.length;

      return {
        lowStockCount,
        outOfStockCount,
        overdueCreditsCount,
        pendingCreditsCount
      };
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true
  });

  return {
    lowStockCount: data?.lowStockCount ?? 0,
    outOfStockCount: data?.outOfStockCount ?? 0,
    overdueCreditsCount: data?.overdueCreditsCount ?? 0,
    pendingCreditsCount: data?.pendingCreditsCount ?? 0,
    isLoading
  };
}
