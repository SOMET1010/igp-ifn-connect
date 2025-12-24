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
    const [stocksResult, ordersResult] = await Promise.all([
      supabase
        .from('stocks')
        .select('quantity, unit_price')
        .eq('cooperative_id', cooperativeId),
      supabase
        .from('orders')
        .select('status, total_amount')
        .eq('cooperative_id', cooperativeId),
    ]);

    const stocks = stocksResult.data ?? [];
    const orders = ordersResult.data ?? [];

    // Calculs stocks
    const products = stocks.length;
    const totalStockQuantity = stocks.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
    const stockValue = stocks.reduce((sum, s) => {
      const qty = Number(s.quantity) || 0;
      const price = Number(s.unit_price) || 0;
      return sum + (qty * price);
    }, 0);

    // Calculs commandes par statut
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
    const inTransitOrders = orders.filter(o => o.status === 'in_transit').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;

    // Chiffre d'affaires (commandes livrées uniquement)
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    return {
      products,
      pendingOrders,
      confirmedOrders,
      inTransitOrders,
      deliveredOrders,
      totalStockQuantity,
      stockValue,
      totalRevenue,
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
