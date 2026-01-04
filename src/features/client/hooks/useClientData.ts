import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Client } from '../types/client.types';
import { toast } from 'sonner';

export function useClientData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Client | null;
    },
    enabled: !!user?.id,
  });

  const updateClient = useMutation({
    mutationFn: async (updates: Partial<Client>) => {
      if (!client?.id) throw new Error('Client non trouvé');
      
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', client.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', user?.id] });
      toast.success('Profil mis à jour');
    },
    onError: (error) => {
      console.error('Update client error:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  return {
    client,
    isLoading,
    error,
    updateClient: updateClient.mutate,
    isUpdating: updateClient.isPending,
  };
}

export function useCreateClient() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData: { full_name: string; phone: string; email?: string }) => {
      if (!user?.id) throw new Error('Utilisateur non authentifié');
      
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          full_name: clientData.full_name,
          phone: clientData.phone.replace(/\s/g, ''),
          email: clientData.email,
          status: 'pending',
          kyc_level: 'level_0',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Assign client role
      await supabase.from('user_roles').insert({
        user_id: user.id,
        role: 'client',
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', user?.id] });
      toast.success('Compte client créé avec succès');
    },
    onError: (error) => {
      console.error('Create client error:', error);
      toast.error('Erreur lors de la création du compte');
    },
  });
}
