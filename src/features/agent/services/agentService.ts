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

    const defaultStats = {
      today: 0,
      week: 0,
      total: 0,
      validated: 0,
      pending: 0,
      rejected: 0,
      validationRate: 0,
      weeklyEnrollments: [],
    };

    // If agent doesn't exist, return unregistered state
    if (!agentData) {
      return {
        profile: profileData,
        stats: defaultStats,
        isAgentRegistered: false,
      };
    }

    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday).toISOString();
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();

    // Get all stats in parallel
    const [
      todayResult,
      weekResult,
      validatedResult,
      pendingResult,
      rejectedResult,
      weeklyMerchants,
    ] = await Promise.all([
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
      supabase
        .from("merchants")
        .select("id", { count: "exact", head: true })
        .eq("enrolled_by", agentData.id)
        .eq("status", "validated"),
      supabase
        .from("merchants")
        .select("id", { count: "exact", head: true })
        .eq("enrolled_by", agentData.id)
        .eq("status", "pending"),
      supabase
        .from("merchants")
        .select("id", { count: "exact", head: true })
        .eq("enrolled_by", agentData.id)
        .eq("status", "rejected"),
      supabase
        .from("merchants")
        .select("enrolled_at")
        .eq("enrolled_by", agentData.id)
        .gte("enrolled_at", sevenDaysAgo)
        .order("enrolled_at", { ascending: true }),
    ]);

    // Build weekly enrollments array
    const weeklyEnrollments: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = (weeklyMerchants.data || []).filter((m) => {
        const enrollDate = m.enrolled_at?.split("T")[0];
        return enrollDate === dateStr;
      }).length;
      weeklyEnrollments.push({ date: dateStr, count });
    }

    const validated = validatedResult.count ?? 0;
    const total = agentData.total_enrollments ?? 0;
    const validationRate = total > 0 ? Math.round((validated / total) * 100) : 0;

    return {
      profile: profileData,
      stats: {
        today: todayResult.count ?? 0,
        week: weekResult.count ?? 0,
        total,
        validated,
        pending: pendingResult.count ?? 0,
        rejected: rejectedResult.count ?? 0,
        validationRate,
        weeklyEnrollments,
      },
      isAgentRegistered: true,
    };
  },
};
