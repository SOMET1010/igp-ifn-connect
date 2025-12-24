/**
 * Hook pour la gestion des commandes coopérative
 */
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { orderService } from '../services/orderService';
import { stockService } from '../services/stockService';
import type { Order, OrderStatus } from '../types/order.types';
import { statusLabels } from '../types/order.types';

export function useCooperativeOrders(userId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cooperativeId, setCooperativeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const refreshOrders = useCallback(async (coopId: string) => {
    const ordersData = await orderService.getOrders(coopId);
    setOrders(ordersData);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const coopId = await stockService.getCooperativeId(userId);
      
      if (coopId) {
        setCooperativeId(coopId);
        await refreshOrders(coopId);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [userId, refreshOrders]);

  const updateOrderStatus = useCallback(async (
    orderId: string, 
    newStatus: Exclude<OrderStatus, 'pending' | 'cancelled'>
  ) => {
    setUpdatingOrderId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Commande ${statusLabels[newStatus].label.toLowerCase()}`);
      
      if (cooperativeId) {
        await refreshOrders(cooperativeId);
      }
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdatingOrderId(null);
    }
  }, [cooperativeId, refreshOrders]);

  const cancelOrder = useCallback(async (orderId: string, reason: string): Promise<boolean> => {
    try {
      await orderService.cancelOrder(orderId, reason);
      toast.success('Commande annulée');
      
      if (cooperativeId) {
        await refreshOrders(cooperativeId);
      }
      return true;
    } catch {
      toast.error('Erreur lors de l\'annulation');
      return false;
    }
  }, [cooperativeId, refreshOrders]);

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
