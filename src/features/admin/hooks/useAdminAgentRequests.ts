import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { agentRequestsService } from '../services/agentRequestsService';
import type { AgentRequest, AgentRequestsFilters, AgentRequestsStats } from '../types/agentRequests.types';

export function useAdminAgentRequests() {
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AgentRequestsFilters>({
    status: 'pending',
    search: '',
  });
  const [stats, setStats] = useState<AgentRequestsStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const { toast } = useToast();

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await agentRequestsService.getRequests(filters);
      setRequests(data);
    } catch (err) {
      console.error('Error fetching agent requests:', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const stats = await agentRequestsService.getStats();
      setStats(stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const approveRequest = async (request: AgentRequest): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      await agentRequestsService.approveRequest(request, user.id);

      toast({
        title: 'Demande approuvée',
        description: `${request.full_name} est maintenant agent`,
      });

      fetchRequests();
      fetchStats();
      return true;
    } catch (err) {
      console.error('Error approving request:', err);
      toast({
        title: 'Erreur',
        description: "Impossible d'approuver la demande",
        variant: 'destructive',
      });
      return false;
    }
  };

  const rejectRequest = async (request: AgentRequest, reason: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      await agentRequestsService.rejectRequest(request.id, reason, user.id);

      toast({
        title: 'Demande rejetée',
        description: `La demande de ${request.full_name} a été rejetée`,
      });

      fetchRequests();
      fetchStats();
      return true;
    } catch (err) {
      console.error('Error rejecting request:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter la demande',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    requests,
    isLoading,
    error,
    filters,
    setFilters,
    stats,
    approveRequest,
    rejectRequest,
    refetch: fetchRequests,
  };
}
