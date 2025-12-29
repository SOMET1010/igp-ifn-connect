// ============================================
// Hook - useOrdersRealtime
// Realtime subscription for new orders (Cooperative side)
// ============================================

import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { coopLogger } from "@/infra/logger";

interface UseOrdersRealtimeOptions {
  cooperativeId: string | null;
  onNewOrder?: () => void;
}

export function useOrdersRealtime({
  cooperativeId,
  onNewOrder,
}: UseOrdersRealtimeOptions) {
  const handleNewOrder = useCallback(() => {
    // Notify cooperative of new order
    toast.info("📦 Nouvelle commande reçue !", {
      duration: 5000,
      action: {
        label: "Voir",
        onClick: () => {
          // Will trigger refetch which will show new orders
          onNewOrder?.();
        },
      },
    });

    // Play notification sound if available
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Trigger refetch
    onNewOrder?.();
  }, [onNewOrder]);

  useEffect(() => {
    if (!cooperativeId) return;

    const channel = supabase
      .channel(`cooperative-orders-${cooperativeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `cooperative_id=eq.${cooperativeId}`,
        },
        (payload) => {
          coopLogger.debug("New order received", { orderId: payload.new });
          handleNewOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cooperativeId, handleNewOrder]);
}
