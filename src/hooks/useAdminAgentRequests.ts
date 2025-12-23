import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AgentRequest {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  organization: string;
  preferred_zone: string | null;
  motivation: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentRequestsFilters {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  search: string;
}

export interface AgentRequestsStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

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
      let query = supabase
        .from('agent_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setRequests(data as AgentRequest[]);
    } catch (err) {
      console.error('Error fetching agent requests:', err);
      setError('Erreur lors du chargement des demandes');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error: statsError } = await supabase
        .from('agent_requests')
        .select('status');

      if (statsError) throw statsError;

      const stats = (data || []).reduce(
        (acc, req) => {
          acc.total++;
          if (req.status === 'pending') acc.pending++;
          else if (req.status === 'approved') acc.approved++;
          else if (req.status === 'rejected') acc.rejected++;
          return acc;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0 }
      );

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

      // 1. Update request status
      const { error: updateError } = await supabase
        .from('agent_requests')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // 2. Create agent entry
      const employeeId = `AGT-${Date.now().toString(36).toUpperCase()}`;
      const { error: agentError } = await supabase.from('agents').insert({
        user_id: request.user_id,
        employee_id: employeeId,
        organization: request.organization,
        zone: request.preferred_zone,
        is_active: true,
        total_enrollments: 0,
      });

      if (agentError) throw agentError;

      // 3. Assign agent role (via RPC)
      const { error: roleError } = await supabase.rpc('assign_agent_role', {
        p_user_id: request.user_id,
      });

      if (roleError) {
        console.warn('Role assignment warning:', roleError);
        // Continue even if role assignment fails - it might already exist
      }

      toast({
        title: 'Demande approuvée',
        description: `${request.full_name} est maintenant agent (${employeeId})`,
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

  const rejectRequest = async (
    request: AgentRequest,
    reason: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error: updateError } = await supabase
        .from('agent_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

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
