/**
 * Service API pour les opérations de commandes coopérative
 */
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderStatus } from "../types/order.types";

export const orderService = {
  /**
   * Récupère toutes les commandes d'une coopérative
   */
  async getOrders(cooperativeId: string): Promise<Order[]> {
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        id,
        quantity,
        unit_price,
        total_amount,
        status,
        created_at,
        merchant_id,
        product_id,
        cancellation_reason,
        cancelled_at
      `)
      .eq('cooperative_id', cooperativeId)
      .order('created_at', { ascending: false });

    if (!ordersData) return [];

    const merchantIds = ordersData.map(o => o.merchant_id);
    const productIds = ordersData.map(o => o.product_id);

    const [merchantsResult, productsResult] = await Promise.all([
      supabase
        .from('merchants')
        .select('id, full_name')
        .in('id', merchantIds),
      supabase
        .from('products')
        .select('id, name, unit')
        .in('id', productIds)
    ]);

    const merchants = merchantsResult.data ?? [];
    const products = productsResult.data ?? [];

    return ordersData.map(order => ({
      ...order,
      status: order.status as OrderStatus,
      merchant_name: merchants.find(m => m.id === order.merchant_id)?.full_name ?? 'Marchand',
      product_name: products.find(p => p.id === order.product_id)?.name ?? 'Produit',
      product_unit: products.find(p => p.id === order.product_id)?.unit ?? 'kg',
    }));
  },

  /**
   * Met à jour le statut d'une commande
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  },

  /**
   * Annule une commande
   */
  async cancelOrder(orderId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;
  },
};
