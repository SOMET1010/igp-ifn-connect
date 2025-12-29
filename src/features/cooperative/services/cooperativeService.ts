/**
 * Service API pour les opérations de base de la coopérative
 */
import { supabase } from "@/integrations/supabase/client";
import { coopLogger } from "@/infra/logger";
import { getDateRangeForFilter, type DateFilterValue } from "../types/dateFilter.types";
import type { CooperativeData, DashboardStats, DashboardData } from "../types/cooperative.types";

interface RevenueDataPoint {
  date: string;
  label: string;
  revenue: number;
}

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
   * Récupère les statistiques du dashboard avec filtre temporel
   */
  async getDashboardStats(cooperativeId: string, dateFilter: DateFilterValue = 'all'): Promise<DashboardStats> {
    const { startDate } = getDateRangeForFilter(dateFilter);

    // Requêtes de base
    const stocksQuery = supabase
      .from('stocks')
      .select('quantity, unit_price')
      .eq('cooperative_id', cooperativeId);

    // Requête commandes avec filtre temporel optionnel
    let ordersQuery = supabase
      .from('orders')
      .select('status, total_amount, created_at')
      .eq('cooperative_id', cooperativeId);

    if (startDate) {
      ordersQuery = ordersQuery.gte('created_at', startDate.toISOString());
    }

    const [stocksResult, ordersResult] = await Promise.all([
      stocksQuery,
      ordersQuery,
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
   * Récupère les données de CA des 7 derniers jours
   */
  async getWeeklyRevenue(cooperativeId: string): Promise<RevenueDataPoint[]> {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('cooperative_id', cooperativeId)
      .eq('status', 'delivered')
      .gte('created_at', weekAgo.toISOString());

    // Initialiser les 7 jours
    const days: RevenueDataPoint[] = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        label: dayNames[date.getDay()],
        revenue: 0,
      });
    }

    // Agréger les revenus par jour
    (orders ?? []).forEach(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      const day = days.find(d => d.date === orderDate);
      if (day) {
        day.revenue += Number(order.total_amount) || 0;
      }
    });

    return days;
  },

  /**
   * Récupère toutes les données du dashboard en une seule fois
   */
  async fetchDashboardData(userId: string, dateFilter: DateFilterValue = 'all'): Promise<DashboardData> {
    coopLogger.info('Fetching cooperative dashboard data', { userId, dateFilter });

    const cooperative = await this.getCooperativeByUserId(userId);
    
    if (!cooperative) {
      throw new Error('Coopérative non trouvée');
    }

    const stats = await this.getDashboardStats(cooperative.id, dateFilter);

    coopLogger.info('Dashboard data fetched successfully', {
      cooperativeId: cooperative.id,
      stockCount: stats.products,
      pendingOrders: stats.pendingOrders,
    });

    return { cooperative, stats };
  },
};
