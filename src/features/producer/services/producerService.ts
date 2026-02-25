/**
 * Service pour les opérations producteur - JÙLABA
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  Producer, 
  ProducerHarvest, 
  CooperativeProducerOrder,
  ProducerStats,
  HarvestFormData 
} from '../types/producer.types';

export const producerService = {
  /**
   * Récupère le profil producteur de l'utilisateur connecté
   */
  async getCurrentProducer(): Promise<Producer | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('producers')
      .select(`
        *,
        cooperative:cooperatives(id, name, code)
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching producer:', error);
      return null;
    }

    return data as Producer;
  },

  /**
   * Met à jour le profil producteur
   */
  async updateProducer(producerId: string, updates: Partial<Producer>): Promise<boolean> {
    const { error } = await supabase
      .from('producers')
      .update(updates)
      .eq('id', producerId);

    if (error) {
      console.error('Error updating producer:', error);
      return false;
    }

    return true;
  },

  /**
   * Récupère les récoltes du producteur
   */
  async getHarvests(producerId: string): Promise<ProducerHarvest[]> {
    const { data, error } = await supabase
      .from('producer_harvests')
      .select(`
        *,
        product:products(id, name, unit, image_url)
      `)
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching harvests:', error);
      return [];
    }

    return data as ProducerHarvest[];
  },

  /**
   * Crée une nouvelle récolte
   */
  async createHarvest(producerId: string, harvest: HarvestFormData): Promise<ProducerHarvest | null> {
    const { data, error } = await supabase
      .from('producer_harvests')
      .insert({
        producer_id: producerId,
        product_id: harvest.product_id,
        quantity: harvest.quantity,
        available_quantity: harvest.quantity,
        unit_price: harvest.unit_price,
        harvest_date: harvest.harvest_date,
        expiry_date: harvest.expiry_date || null,
        quality_grade: harvest.quality_grade || null,
        notes: harvest.notes || null,
        status: 'available'
      })
      .select(`
        *,
        product:products(id, name, unit, image_url)
      `)
      .single();

    if (error) {
      console.error('Error creating harvest:', error);
      return null;
    }

    return data as ProducerHarvest;
  },

  /**
   * Met à jour une récolte
   */
  async updateHarvest(harvestId: string, updates: Partial<HarvestFormData>): Promise<boolean> {
    const { error } = await supabase
      .from('producer_harvests')
      .update(updates)
      .eq('id', harvestId);

    if (error) {
      console.error('Error updating harvest:', error);
      return false;
    }

    return true;
  },

  /**
   * Supprime une récolte (si disponible)
   */
  async deleteHarvest(harvestId: string): Promise<boolean> {
    const { error } = await supabase
      .from('producer_harvests')
      .delete()
      .eq('id', harvestId)
      .eq('status', 'available');

    if (error) {
      console.error('Error deleting harvest:', error);
      return false;
    }

    return true;
  },

  /**
   * Récupère les commandes reçues par le producteur
   */
  async getOrders(producerId: string): Promise<CooperativeProducerOrder[]> {
    const { data, error } = await supabase
      .from('cooperative_producer_orders')
      .select(`
        *,
        cooperative:cooperatives(id, name, code, phone),
        product:products(id, name, unit)
      `)
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data as CooperativeProducerOrder[];
  },

  /**
   * Met à jour le statut d'une commande
   */
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    const updates: Record<string, unknown> = { status };
    
    if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('cooperative_producer_orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }

    return true;
  },

  /**
   * Calcule les statistiques du producteur
   */
  async getStats(producerId: string): Promise<ProducerStats> {
    const [harvestsResult, ordersResult] = await Promise.all([
      supabase
        .from('producer_harvests')
        .select('id, status, available_quantity')
        .eq('producer_id', producerId),
      supabase
        .from('cooperative_producer_orders')
        .select('id, status, total_amount, created_at')
        .eq('producer_id', producerId)
    ]);

    const harvests = harvestsResult.data || [];
    const orders = ordersResult.data || [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const monthlyOrders = deliveredOrders.filter(o => 
      new Date(o.created_at) >= startOfMonth
    );

    return {
      totalHarvests: harvests.length,
      availableHarvests: harvests.filter(h => h.status === 'available').length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => 
        ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
      ).length,
      totalRevenue: deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      monthlyRevenue: monthlyOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
    };
  }
};
