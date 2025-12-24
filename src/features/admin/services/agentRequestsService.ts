import { supabase } from '@/integrations/supabase/client';
import type { AgentRequest, AgentRequestsFilters, AgentRequestsStats } from '../types/agentRequests.types';

export const agentRequestsService = {
  async getRequests(filters: AgentRequestsFilters): Promise<AgentRequest[]> {
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

    const { data, error } = await query;
    if (error) throw error;
    return data as AgentRequest[];
  },

  async getStats(): Promise<AgentRequestsStats> {
    const { data, error } = await supabase
      .from('agent_requests')
      .select('status');

    if (error) throw error;

    return (data || []).reduce(
      (acc, req) => {
        acc.total++;
        if (req.status === 'pending') acc.pending++;
        else if (req.status === 'approved') acc.approved++;
        else if (req.status === 'rejected') acc.rejected++;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  },

  async approveRequest(request: AgentRequest, adminId: string): Promise<void> {
    // 1. Update request status
    const { error: updateError } = await supabase
      .from('agent_requests')
      .update({
        status: 'approved',
        reviewed_by: adminId,
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
    }
  },

  async rejectRequest(requestId: string, reason: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('agent_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) throw error;
  }
};
