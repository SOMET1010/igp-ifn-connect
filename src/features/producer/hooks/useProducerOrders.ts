/**
 * Hook pour la gestion des commandes reçues par le producteur
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { producerService } from '../services/producerService';
import type { CooperativeOrderStatus } from '../types/producer.types';
import { toast } from 'sonner';

export const useProducerOrders = (producerId: string | undefined) => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['producer-orders', producerId],
    queryFn: () => producerService.getOrders(producerId!),
    enabled: !!producerId,
    staleTime: 30 * 1000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: CooperativeOrderStatus }) =>
      producerService.updateOrderStatus(orderId, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['producer-orders', producerId] });
      queryClient.invalidateQueries({ queryKey: ['producer-stats', producerId] });
      
      const messages: Record<CooperativeOrderStatus, string> = {
        pending: 'Commande en attente',
        confirmed: 'Commande confirmée',
        preparing: 'Préparation en cours',
        ready: 'Commande prête',
        delivered: 'Commande livrée',
        cancelled: 'Commande annulée',
      };
      toast.success(messages[status] || 'Statut mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const pendingOrders = ordersQuery.data?.filter(o => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
  ) || [];

  const completedOrders = ordersQuery.data?.filter(o => 
    ['delivered', 'cancelled'].includes(o.status)
  ) || [];

  return {
    orders: ordersQuery.data || [],
    pendingOrders,
    completedOrders,
    isLoading: ordersQuery.isLoading,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
};
