import { supabase } from "@/integrations/supabase/client";
import type { AgentRequest, AgentRequestInput, AgentDashboardData } from "../types/agent.types";

export const agentService = {
  /**
   * Fetch agent request for a user
   */
  async getAgentRequest(userId: string): Promise<AgentRequest | null> {
    const { data, error } = await supabase
      .from("agent_requests")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as AgentRequest | null;
  },

  /**
   * Submit a new agent request
   */
  async submitAgentRequest(userId: string, input: AgentRequestInput): Promise<AgentRequest> {
    const { data, error } = await supabase
      .from("agent_requests")
      .insert({
        user_id: userId,
        full_name: input.full_name,
        phone: input.phone,
        organization: input.organization,
        preferred_zone: input.preferred_zone || null,
        motivation: input.motivation || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("Vous avez déjà une demande en cours");
      }
      throw error;
    }
    return data as AgentRequest;
  },

  /**
   * Cancel a pending agent request
   */
  async cancelAgentRequest(requestId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("agent_requests")
      .delete()
      .eq("id", requestId)
      .eq("user_id", userId);

    if (error) throw error;
  },

  /**
   * Fetch dashboard data for an agent
   */
  async getDashboardData(userId: string): Promise<AgentDashboardData> {
    // Get profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) throw profileError;

    // Get agent
    const { data: agentData, error: agentError } = await supabase
      .from("agents")
      .select("id, total_enrollments")
      .eq("user_id", userId)
      .maybeSingle();

    if (agentError) throw agentError;

    // If agent doesn't exist, return unregistered state
    if (!agentData) {
      return {
        profile: profileData,
        stats: { today: 0, week: 0, total: 0 },
        isAgentRegistered: false,
      };
    }

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday).toISOString();

    // Get enrollment counts
    const [todayResult, weekResult] = await Promise.all([
      supabase
        .from("merchants")
        .select("id", { count: "exact", head: true })
        .eq("enrolled_by", agentData.id)
        .gte("enrolled_at", todayStart),
      supabase
        .from("merchants")
        .select("id", { count: "exact", head: true })
        .eq("enrolled_by", agentData.id)
        .gte("enrolled_at", weekStart),
    ]);

    return {
      profile: profileData,
      stats: {
        today: todayResult.count ?? 0,
        week: weekResult.count ?? 0,
        total: agentData.total_enrollments ?? 0,
      },
      isAgentRegistered: true,
    };
  },
};
