/**
 * Hook pour les commandes aux producteurs côté coopérative
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchProducerOrders, 
  fetchAvailableHarvests,
  createProducerOrder,
  cancelProducerOrder,
} from '../services/producerOrderService';
import type { CreateProducerOrderInput } from '../types/producerOrder.types';

export function useCooperativeProducerOrders(cooperativeId: string | undefined) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['cooperative-producer-orders', cooperativeId],
    queryFn: async () => {
      if (!cooperativeId) return [];
      const { data, error } = await fetchProducerOrders(cooperativeId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!cooperativeId,
    staleTime: 30 * 1000,
  });

  const harvestsQuery = useQuery({
    queryKey: ['available-harvests', cooperativeId],
    queryFn: async () => {
      if (!cooperativeId) return [];
      const { data, error } = await fetchAvailableHarvests(cooperativeId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!cooperativeId,
    staleTime: 60 * 1000,
  });

  const pendingOrders = ordersQuery.data?.filter(o => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
  ) || [];

  const completedOrders = ordersQuery.data?.filter(o => 
    ['delivered', 'cancelled'].includes(o.status)
  ) || [];

  const createOrderMutation = useMutation({
    mutationFn: (orderData: CreateProducerOrderInput) => {
      if (!cooperativeId) return Promise.reject(new Error('Coopérative non définie'));
      return createProducerOrder(cooperativeId, orderData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cooperative-producer-orders', cooperativeId] });
        queryClient.invalidateQueries({ queryKey: ['available-harvests', cooperativeId] });
        toast.success('Commande créée avec succès');
      } else {
        toast.error(result.error || 'Erreur lors de la création');
      }
    },
    onError: () => {
      toast.error('Erreur lors de la création de la commande');
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) => 
      cancelProducerOrder(orderId, reason),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cooperative-producer-orders', cooperativeId] });
        toast.success('Commande annulée');
      } else {
        toast.error(result.error || 'Erreur lors de l\'annulation');
      }
    },
    onError: () => {
      toast.error('Erreur lors de l\'annulation');
    },
  });

  return {
    orders: ordersQuery.data || [],
    pendingOrders,
    completedOrders,
    harvests: harvestsQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isLoadingHarvests: harvestsQuery.isLoading,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
    createOrder: createOrderMutation.mutate,
    isCreating: createOrderMutation.isPending,
    cancelOrder: cancelOrderMutation.mutate,
    isCancelling: cancelOrderMutation.isPending,
  };
}
