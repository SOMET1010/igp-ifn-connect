import { supabase } from '@/integrations/supabase/client';
import type { AgentProfileData, AgentProfileEditInput } from '../types/profile.types';
import { agentLogger } from '@/infra/logger';

export const agentProfileService = {
  async fetchProfile(userId: string): Promise<AgentProfileData | null> {
    // Fetch from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      agentLogger.error('Error fetching profile', profileError);
      return null;
    }

    // Fetch from agents table
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('employee_id, organization, zone, total_enrollments, is_active, created_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (agentError) {
      agentLogger.error('Error fetching agent', agentError);
      return null;
    }

    if (!profileData || !agentData) {
      return null;
    }

    return {
      full_name: profileData.full_name,
      phone: profileData.phone,
      avatar_url: profileData.avatar_url,
      employee_id: agentData.employee_id,
      organization: agentData.organization,
      zone: agentData.zone,
      total_enrollments: agentData.total_enrollments ?? 0,
      is_active: agentData.is_active ?? true,
      created_at: agentData.created_at,
    };
  },

  async updateProfile(
    userId: string,
    data: AgentProfileEditInput
  ): Promise<{ success: boolean; error?: string }> {
    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone: data.phone,
      })
      .eq('user_id', userId);

    if (profileError) {
      agentLogger.error('Error updating profile', profileError);
      return { success: false, error: profileError.message };
    }

    // Update agents table (zone only)
    const { error: agentError } = await supabase
      .from('agents')
      .update({
        zone: data.zone,
      })
      .eq('user_id', userId);

    if (agentError) {
      agentLogger.error('Error updating agent', agentError);
      return { success: false, error: agentError.message };
    }

    return { success: true };
  },
};
