import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AgentRequest {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  organization: string;
  preferred_zone: string | null;
  motivation: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentRequestInput {
  full_name: string;
  phone: string;
  organization: string;
  preferred_zone?: string;
  motivation?: string;
}

export function useAgentRequest() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState<AgentRequest | null>(null);

  const fetchMyRequest = useCallback(async () => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('agent_requests')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      setRequest(data as AgentRequest | null);
      return data as AgentRequest | null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const submitRequest = useCallback(async (input: AgentRequestInput) => {
    if (!user) {
      setError('Vous devez être connecté');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: insertError } = await supabase
        .from('agent_requests')
        .insert({
          user_id: user.id,
          full_name: input.full_name,
          phone: input.phone,
          organization: input.organization,
          preferred_zone: input.preferred_zone || null,
          motivation: input.motivation || null,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Vous avez déjà une demande en cours');
        }
        throw insertError;
      }
      
      setRequest(data as AgentRequest);
      return data as AgentRequest;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la soumission';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const cancelRequest = useCallback(async () => {
    if (!user || !request) {
      setError('Aucune demande à annuler');
      return false;
    }
    
    if (request.status !== 'pending') {
      setError('Seules les demandes en attente peuvent être annulées');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('agent_requests')
        .delete()
        .eq('id', request.id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      setRequest(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'annulation';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, request]);

  return {
    request,
    isLoading,
    error,
    fetchMyRequest,
    submitRequest,
    cancelRequest,
  };
}
