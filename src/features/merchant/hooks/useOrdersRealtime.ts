// ============================================
// Hook - useOrdersRealtime
// Realtime subscription for order status changes (Merchant side)
// ============================================

import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { OrderStatus } from "../types/suppliers.types";
import type { OrderRealtimePayload } from "@/shared/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  in_transit: "En livraison",
  delivered: "Livrée",
  cancelled: "Annulée",
};

interface UseOrdersRealtimeOptions {
  merchantId: string | null;
  onStatusChange?: () => void;
}

export function useOrdersRealtime({
  merchantId,
  onStatusChange,
}: UseOrdersRealtimeOptions) {
  const handleStatusChange = useCallback(
    (payload: { new: { status: OrderStatus }; old: { status: OrderStatus | undefined } }) => {
      const newStatus = payload.new.status;
      const oldStatus = payload.old.status;

      if (newStatus !== oldStatus) {
        // Notify user of status change
        if (newStatus === "confirmed") {
          toast.success("Votre commande a été confirmée !");
        } else if (newStatus === "in_transit") {
          toast.info("Votre commande est en cours de livraison 🚚");
        } else if (newStatus === "delivered") {
          toast.success("Votre commande a été livrée ! ✅");
        } else if (newStatus === "cancelled") {
          toast.error("Une commande a été annulée");
        }

        // Trigger refetch
        onStatusChange?.();
      }
    },
    [onStatusChange]
  );

  useEffect(() => {
    if (!merchantId) return;

    const channel = supabase
      .channel(`merchant-orders-${merchantId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `merchant_id=eq.${merchantId}`,
        },
        (payload) => {
          console.log("Order status changed:", payload);
          const typedPayload = payload as unknown as OrderRealtimePayload;
          handleStatusChange({
            new: { status: typedPayload.new.status as OrderStatus },
            old: { status: typedPayload.old.status as OrderStatus | undefined },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [merchantId, handleStatusChange]);
}
