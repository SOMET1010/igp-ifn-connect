/**
 * Hook pour les données du producteur connecté
 */

import { useQuery } from '@tanstack/react-query';
import { producerService } from '../services/producerService';

export const useProducerData = () => {
  const producerQuery = useQuery({
    queryKey: ['producer-current'],
    queryFn: () => producerService.getCurrentProducer(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const statsQuery = useQuery({
    queryKey: ['producer-stats', producerQuery.data?.id],
    queryFn: () => producerService.getStats(producerQuery.data!.id),
    enabled: !!producerQuery.data?.id,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    producer: producerQuery.data,
    stats: statsQuery.data,
    isLoading: producerQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    error: producerQuery.error,
    refetch: producerQuery.refetch,
    refetchStats: statsQuery.refetch,
  };
};
