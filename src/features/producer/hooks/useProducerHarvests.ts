/**
 * Hook pour la gestion des récoltes du producteur
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { producerService } from '../services/producerService';
import type { HarvestFormData } from '../types/producer.types';
import { toast } from 'sonner';

export const useProducerHarvests = (producerId: string | undefined) => {
  const queryClient = useQueryClient();

  const harvestsQuery = useQuery({
    queryKey: ['producer-harvests', producerId],
    queryFn: () => producerService.getHarvests(producerId!),
    enabled: !!producerId,
    staleTime: 30 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: HarvestFormData) => 
      producerService.createHarvest(producerId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producer-harvests', producerId] });
      queryClient.invalidateQueries({ queryKey: ['producer-stats', producerId] });
      toast.success('Récolte publiée avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la publication');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ harvestId, data }: { harvestId: string; data: Partial<HarvestFormData> }) =>
      producerService.updateHarvest(harvestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producer-harvests', producerId] });
      toast.success('Récolte mise à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (harvestId: string) => producerService.deleteHarvest(harvestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['producer-harvests', producerId] });
      queryClient.invalidateQueries({ queryKey: ['producer-stats', producerId] });
      toast.success('Récolte supprimée');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  return {
    harvests: harvestsQuery.data || [],
    isLoading: harvestsQuery.isLoading,
    error: harvestsQuery.error,
    refetch: harvestsQuery.refetch,
    createHarvest: createMutation.mutate,
    updateHarvest: updateMutation.mutate,
    deleteHarvest: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
