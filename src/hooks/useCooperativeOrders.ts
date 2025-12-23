import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order, statusLabels } from '@/components/cooperative/orders/types';

export function useCooperativeOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cooperativeId, setCooperativeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (coopId: string) => {
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
      .eq('cooperative_id', coopId)
      .order('created_at', { ascending: false });

    if (ordersData) {
      const merchantIds = ordersData.map(o => o.merchant_id);
      const productIds = ordersData.map(o => o.product_id);

      const { data: merchants } = await supabase
        .from('merchants')
        .select('id, full_name')
        .in('id', merchantIds);

      const { data: products } = await supabase
        .from('products')
        .select('id, name, unit')
        .in('id', productIds);

      const enrichedOrders = ordersData.map(order => ({
        ...order,
        status: order.status as Order['status'],
        merchant_name: merchants?.find(m => m.id === order.merchant_id)?.full_name ?? 'Marchand',
        product_name: products?.find(p => p.id === order.product_id)?.name ?? 'Produit',
        product_unit: products?.find(p => p.id === order.product_id)?.unit ?? 'kg',
        cancellation_reason: order.cancellation_reason,
        cancelled_at: order.cancelled_at,
      }));

      setOrders(enrichedOrders);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const { data: coopData } = await supabase
        .from('cooperatives')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (coopData) {
        setCooperativeId(coopData.id);
        await fetchOrders(coopData.id);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [userId, fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: 'confirmed' | 'in_transit' | 'delivered') => {
    setUpdatingOrderId(orderId);

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      setUpdatingOrderId(null);
      return;
    }

    toast.success(`Commande ${statusLabels[newStatus].label.toLowerCase()}`);
    
    if (cooperativeId) {
      await fetchOrders(cooperativeId);
    }
    
    setUpdatingOrderId(null);
  }, [cooperativeId, fetchOrders]);

  const cancelOrder = useCallback(async (orderId: string, reason: string) => {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      toast.error('Erreur lors de l\'annulation');
      return false;
    }

    toast.success('Commande annulée');
    
    if (cooperativeId) {
      await fetchOrders(cooperativeId);
    }
    
    return true;
  }, [cooperativeId, fetchOrders]);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed' || o.status === 'in_transit');
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  return {
    orders,
    isLoading,
    updatingOrderId,
    updateOrderStatus,
    cancelOrder,
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    cancelledOrders,
  };
}
