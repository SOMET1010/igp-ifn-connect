/**
 * Types pour la gestion des membres de coopérative
 */

import { z } from 'zod';

export interface CooperativeMember {
  id: string;
  cooperative_id: string | null;
  cooperative_name: string | null;
  full_name: string;
  phone: string | null;
  cmu_status: string | null;
  cnps_status: string | null;
  created_at: string;
}

export interface MemberStats {
  total: number;
  withCMU: number;
  withCNPS: number;
  withBoth: number;
}

export const addMemberSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().regex(/^[0-9+\s-]{8,}$/, 'Numéro de téléphone invalide').optional().or(z.literal('')),
  cmu_status: z.string().optional(),
  cnps_status: z.string().optional(),
});

export type AddMemberFormData = z.infer<typeof addMemberSchema>;
