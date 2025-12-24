import { supabase } from '@/integrations/supabase/client';
import type { CooperativeProfileData, CooperativeProfileFormData } from '../types/profile.types';

/**
 * Fetch cooperative profile by user ID
 */
export async function fetchCooperativeProfile(
  userId: string
): Promise<{ data: CooperativeProfileData | null; error: string | null }> {
  const { data, error } = await supabase
    .from('cooperatives')
    .select('id, name, code, region, commune, address, phone, email, igp_certified, total_members, latitude, longitude')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No cooperative found for this user
      return { data: null, error: null };
    }
    return { data: null, error: 'Erreur lors du chargement du profil' };
  }

  return {
    data: {
      ...data,
      igp_certified: data.igp_certified ?? false,
      total_members: data.total_members ?? 0,
    },
    error: null,
  };
}

/**
 * Update cooperative profile
 */
export async function updateCooperativeProfile(
  cooperativeId: string,
  formData: CooperativeProfileFormData
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from('cooperatives')
    .update({
      address: formData.address || null,
      region: formData.region,
      commune: formData.commune,
      phone: formData.phone || null,
      email: formData.email || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cooperativeId);

  if (error) {
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }

  return { success: true, error: null };
}
