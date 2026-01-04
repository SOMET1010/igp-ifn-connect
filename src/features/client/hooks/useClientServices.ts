import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { FinancialService, ClientService, KycLevel } from '../types/client.types';

export function useFinancialServices() {
  return useQuery({
    queryKey: ['financial-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as FinancialService[];
    },
  });
}

export function useClientServices(clientId?: string) {
  return useQuery({
    queryKey: ['client-services', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('client_services')
        .select(`
          *,
          service:financial_services(*)
        `)
        .eq('client_id', clientId);
      
      if (error) throw error;
      return data as (ClientService & { service: FinancialService })[];
    },
    enabled: !!clientId,
  });
}

export function useActivateService(clientId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, clientKycLevel }: { serviceId: string; clientKycLevel: KycLevel }) => {
      if (!clientId) throw new Error('Client non trouvé');
      
      // Check KYC eligibility
      const { data: service } = await supabase
        .from('financial_services')
        .select('min_kyc_level, name')
        .eq('id', serviceId)
        .single();
      
      if (service) {
        const kycLevelOrder: KycLevel[] = ['level_0', 'level_1', 'level_2'];
        const clientLevelIndex = kycLevelOrder.indexOf(clientKycLevel);
        const requiredLevelIndex = kycLevelOrder.indexOf(service.min_kyc_level as KycLevel);
        
        if (clientLevelIndex < requiredLevelIndex) {
          throw new Error(`Niveau KYC insuffisant. ${service.name} requiert le niveau ${service.min_kyc_level}`);
        }
      }
      
      const { data, error } = await supabase
        .from('client_services')
        .insert({
          client_id: clientId,
          service_id: serviceId,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') {
          throw new Error('Vous avez déjà activé ce service');
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-services', clientId] });
      toast.success('Demande d\'activation envoyée');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
