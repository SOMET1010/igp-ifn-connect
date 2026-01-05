/**
 * Service de gestion des producteurs affiliés à la coopérative
 */

import { supabase } from '@/integrations/supabase/client';
import type { Producer } from '@/features/producer/types/producer.types';

export interface AddProducerInput {
  full_name: string;
  phone: string;
  region: string;
  commune: string;
  specialties?: string[];
  igp_certified?: boolean;
}

/**
 * Récupère les producteurs d'une coopérative
 */
export async function fetchCooperativeProducers(
  cooperativeId: string
): Promise<{ data: Producer[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('producers')
      .select('*')
      .eq('cooperative_id', cooperativeId)
      .order('full_name', { ascending: true });

    if (error) throw error;

    return { data: data as Producer[], error: null };
  } catch (err) {
    console.error('Erreur fetchCooperativeProducers:', err);
    return { data: null, error: 'Impossible de charger les producteurs' };
  }
}

/**
 * Ajoute un nouveau producteur à la coopérative
 */
export async function addProducer(
  cooperativeId: string,
  producerData: AddProducerInput
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('producers')
      .insert({
        cooperative_id: cooperativeId,
        full_name: producerData.full_name,
        phone: producerData.phone,
        region: producerData.region,
        commune: producerData.commune,
        specialties: producerData.specialties || [],
        igp_certified: producerData.igp_certified || false,
        is_active: true,
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (err) {
    console.error('Erreur addProducer:', err);
    return { success: false, error: 'Impossible d\'ajouter le producteur' };
  }
}

/**
 * Met à jour un producteur
 */
export async function updateProducer(
  producerId: string,
  updates: Partial<AddProducerInput & { is_active: boolean }>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('producers')
      .update(updates)
      .eq('id', producerId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err) {
    console.error('Erreur updateProducer:', err);
    return { success: false, error: 'Impossible de modifier le producteur' };
  }
}

/**
 * Désactive un producteur
 */
export async function toggleProducerStatus(
  producerId: string,
  isActive: boolean
): Promise<{ success: boolean; error: string | null }> {
  return updateProducer(producerId, { is_active: isActive });
}
