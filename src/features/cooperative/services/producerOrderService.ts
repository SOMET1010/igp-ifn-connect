/**
 * Service pour les commandes aux producteurs côté coopérative
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  ProducerOrderWithDetails, 
  AvailableHarvest, 
  CreateProducerOrderInput 
} from '../types/producerOrder.types';

/**
 * Récupère les commandes de la coopérative aux producteurs
 */
export async function fetchProducerOrders(
  cooperativeId: string
): Promise<{ data: ProducerOrderWithDetails[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('cooperative_producer_orders')
      .select(`
        *,
        producer:producers(id, full_name, phone),
        product:products(id, name, unit)
      `)
      .eq('cooperative_id', cooperativeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data as ProducerOrderWithDetails[], error: null };
  } catch (err) {
    console.error('Erreur fetchProducerOrders:', err);
    return { data: null, error: 'Impossible de charger les commandes' };
  }
}

/**
 * Récupère les récoltes disponibles des producteurs affiliés
 */
export async function fetchAvailableHarvests(
  cooperativeId: string
): Promise<{ data: AvailableHarvest[] | null; error: string | null }> {
  try {
    // D'abord récupérer les producteurs de la coopérative
    const { data: producers, error: producerError } = await supabase
      .from('producers')
      .select('id')
      .eq('cooperative_id', cooperativeId)
      .eq('is_active', true);

    if (producerError) throw producerError;

    if (!producers || producers.length === 0) {
      return { data: [], error: null };
    }

    const producerIds = producers.map(p => p.id);

    // Récupérer les récoltes disponibles de ces producteurs
    const { data, error } = await supabase
      .from('producer_harvests')
      .select(`
        *,
        producer:producers(id, full_name, phone),
        product:products(id, name, unit)
      `)
      .in('producer_id', producerIds)
      .eq('status', 'available')
      .gt('available_quantity', 0)
      .order('harvest_date', { ascending: false });

    if (error) throw error;

    return { data: data as AvailableHarvest[], error: null };
  } catch (err) {
    console.error('Erreur fetchAvailableHarvests:', err);
    return { data: null, error: 'Impossible de charger les récoltes' };
  }
}

/**
 * Crée une nouvelle commande au producteur
 */
export async function createProducerOrder(
  cooperativeId: string,
  orderData: CreateProducerOrderInput
): Promise<{ success: boolean; error: string | null }> {
  try {
    const totalAmount = orderData.quantity * orderData.unit_price;

    const { error } = await supabase
      .from('cooperative_producer_orders')
      .insert({
        cooperative_id: cooperativeId,
        producer_id: orderData.producer_id,
        product_id: orderData.product_id,
        harvest_id: orderData.harvest_id || null,
        quantity: orderData.quantity,
        unit_price: orderData.unit_price,
        total_amount: totalAmount,
        delivery_date: orderData.delivery_date || null,
        notes: orderData.notes || null,
        status: 'pending',
      });

    if (error) throw error;

    // Si c'est lié à une récolte, mettre à jour la quantité disponible
    if (orderData.harvest_id) {
      // Récupérer la quantité actuelle
      const { data: harvest } = await supabase
        .from('producer_harvests')
        .select('available_quantity')
        .eq('id', orderData.harvest_id)
        .single();
      
      if (harvest) {
        const newQuantity = Math.max(0, harvest.available_quantity - orderData.quantity);
        await supabase
          .from('producer_harvests')
          .update({ 
            available_quantity: newQuantity,
            status: newQuantity === 0 ? 'reserved' : 'available'
          })
          .eq('id', orderData.harvest_id);
      }
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Erreur createProducerOrder:', err);
    return { success: false, error: 'Impossible de créer la commande' };
  }
}

/**
 * Annule une commande
 */
export async function cancelProducerOrder(
  orderId: string,
  reason: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('cooperative_producer_orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', orderId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err) {
    console.error('Erreur cancelProducerOrder:', err);
    return { success: false, error: 'Impossible d\'annuler la commande' };
  }
}
