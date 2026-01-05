/**
 * Service de gestion des membres de coopérative
 */

import { supabase } from '@/integrations/supabase/client';
import type { CooperativeMember, MemberStats, AddMemberFormData } from '../types/member.types';

/**
 * Récupère tous les membres d'une coopérative
 */
export async function fetchCooperativeMembers(
  cooperativeId: string,
  cooperativeName: string
): Promise<{ data: CooperativeMember[] | null; error: string | null }> {
  try {
    // On filtre par cooperative_name car vivriers_members utilise ce champ
    const { data, error } = await supabase
      .from('vivriers_members')
      .select('*')
      .eq('cooperative_name', cooperativeName)
      .order('full_name', { ascending: true });

    if (error) throw error;

    return { data: data as CooperativeMember[], error: null };
  } catch (err) {
    console.error('Erreur fetchCooperativeMembers:', err);
    return { data: null, error: 'Impossible de charger les membres' };
  }
}

/**
 * Calcule les statistiques des membres
 */
export function calculateMemberStats(members: CooperativeMember[]): MemberStats {
  const withCMU = members.filter(m => m.cmu_status && m.cmu_status.toLowerCase() !== 'non').length;
  const withCNPS = members.filter(m => m.cnps_status && m.cnps_status.toLowerCase() !== 'non').length;
  const withBoth = members.filter(m => 
    m.cmu_status && m.cmu_status.toLowerCase() !== 'non' &&
    m.cnps_status && m.cnps_status.toLowerCase() !== 'non'
  ).length;

  return {
    total: members.length,
    withCMU,
    withCNPS,
    withBoth,
  };
}

/**
 * Ajoute un nouveau membre à la coopérative
 */
export async function addMember(
  cooperativeId: string,
  cooperativeName: string,
  memberData: AddMemberFormData
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Générer un actor_key unique (requis)
    const actorKey = `MEM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const { error } = await supabase
      .from('vivriers_members')
      .insert({
        actor_key: actorKey,
        cooperative_name: cooperativeName,
        full_name: memberData.full_name,
        phone: memberData.phone || null,
        cmu_status: memberData.cmu_status || 'Non',
        cnps_status: memberData.cnps_status || 'Non',
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (err) {
    console.error('Erreur addMember:', err);
    return { success: false, error: 'Impossible d\'ajouter le membre' };
  }
}

/**
 * Met à jour un membre
 */
export async function updateMember(
  memberId: string,
  updates: Partial<AddMemberFormData>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('vivriers_members')
      .update({
        full_name: updates.full_name,
        phone: updates.phone || null,
        cmu_status: updates.cmu_status,
        cnps_status: updates.cnps_status,
      })
      .eq('id', memberId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err) {
    console.error('Erreur updateMember:', err);
    return { success: false, error: 'Impossible de modifier le membre' };
  }
}

/**
 * Supprime un membre
 */
export async function deleteMember(
  memberId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('vivriers_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (err) {
    console.error('Erreur deleteMember:', err);
    return { success: false, error: 'Impossible de supprimer le membre' };
  }
}
