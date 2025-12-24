/**
 * Service API pour les opérations de base de la coopérative
 */
import { supabase } from "@/integrations/supabase/client";
import { coopLogger } from "@/infra/logger";
import type { CooperativeData, DashboardStats, DashboardData } from "../types/cooperative.types";

export const cooperativeService = {
  /**
   * Récupère l'ID de la coopérative pour un utilisateur
   */
  async getCooperativeId(userId: string): Promise<string | null> {
    const { data } = await supabase
      .from('cooperatives')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    return data?.id ?? null;
  },

  /**
   * Récupère les données complètes de la coopérative
   */
  async getCooperativeByUserId(userId: string): Promise<CooperativeData | null> {
    const { data, error } = await supabase
      .from('cooperatives')
      .select('id, name, region, commune, igp_certified, total_members')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      coopLogger.error('Failed to fetch cooperative', { error });
      throw error;
    }
    
    return data;
  },

  /**
   * Récupère les statistiques du dashboard
   */
  async getDashboardStats(cooperativeId: string): Promise<DashboardStats> {
    const [stockResult, ordersResult] = await Promise.all([
      supabase
        .from('stocks')
        .select('*', { count: 'exact', head: true })
        .eq('cooperative_id', cooperativeId),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('cooperative_id', cooperativeId)
        .eq('status', 'pending'),
    ]);

    return {
      products: stockResult.count ?? 0,
      pendingOrders: ordersResult.count ?? 0,
    };
  },

  /**
   * Récupère toutes les données du dashboard en une seule fois
   */
  async fetchDashboardData(userId: string): Promise<DashboardData> {
    coopLogger.info('Fetching cooperative dashboard data', { userId });

    const cooperative = await this.getCooperativeByUserId(userId);
    
    if (!cooperative) {
      throw new Error('Coopérative non trouvée');
    }

    const stats = await this.getDashboardStats(cooperative.id);

    coopLogger.info('Dashboard data fetched successfully', {
      cooperativeId: cooperative.id,
      stockCount: stats.products,
      pendingOrders: stats.pendingOrders,
    });

    return { cooperative, stats };
  },
};
