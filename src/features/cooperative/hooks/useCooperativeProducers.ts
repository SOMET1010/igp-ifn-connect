/**
 * Hook pour la gestion des producteurs de la coopérative
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  fetchCooperativeProducers, 
  addProducer, 
  updateProducer,
  toggleProducerStatus,
  type AddProducerInput 
} from '../services/producerManagementService';

export function useCooperativeProducers(cooperativeId: string | undefined) {
  const queryClient = useQueryClient();

  const producersQuery = useQuery({
    queryKey: ['cooperative-producers', cooperativeId],
    queryFn: async () => {
      if (!cooperativeId) return [];
      const { data, error } = await fetchCooperativeProducers(cooperativeId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!cooperativeId,
    staleTime: 60 * 1000,
  });

  const stats = {
    total: producersQuery.data?.length || 0,
    active: producersQuery.data?.filter(p => p.is_active).length || 0,
    certified: producersQuery.data?.filter(p => p.igp_certified).length || 0,
  };

  const addProducerMutation = useMutation({
    mutationFn: (producerData: AddProducerInput) => {
      if (!cooperativeId) return Promise.reject(new Error('Coopérative non définie'));
      return addProducer(cooperativeId, producerData);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cooperative-producers', cooperativeId] });
        toast.success('Producteur ajouté avec succès');
      } else {
        toast.error(result.error || 'Erreur lors de l\'ajout');
      }
    },
    onError: () => {
      toast.error('Erreur lors de l\'ajout du producteur');
    },
  });

  const updateProducerMutation = useMutation({
    mutationFn: ({ producerId, updates }: { producerId: string; updates: Partial<AddProducerInput> }) => 
      updateProducer(producerId, updates),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cooperative-producers', cooperativeId] });
        toast.success('Producteur modifié');
      } else {
        toast.error(result.error || 'Erreur lors de la modification');
      }
    },
    onError: () => {
      toast.error('Erreur lors de la modification');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ producerId, isActive }: { producerId: string; isActive: boolean }) => 
      toggleProducerStatus(producerId, isActive),
    onSuccess: (result, { isActive }) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['cooperative-producers', cooperativeId] });
        toast.success(isActive ? 'Producteur activé' : 'Producteur désactivé');
      } else {
        toast.error(result.error || 'Erreur');
      }
    },
    onError: () => {
      toast.error('Erreur lors du changement de statut');
    },
  });

  return {
    producers: producersQuery.data || [],
    stats,
    isLoading: producersQuery.isLoading,
    error: producersQuery.error,
    refetch: producersQuery.refetch,
    addProducer: addProducerMutation.mutate,
    isAdding: addProducerMutation.isPending,
    updateProducer: updateProducerMutation.mutate,
    isUpdating: updateProducerMutation.isPending,
    toggleStatus: toggleStatusMutation.mutate,
    isToggling: toggleStatusMutation.isPending,
  };
}
