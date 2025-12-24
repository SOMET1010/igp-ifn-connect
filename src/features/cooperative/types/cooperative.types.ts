/**
 * Types et schémas Zod pour la coopérative
 */
import { z } from "zod";

// Schéma Zod pour validation
export const CooperativeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  region: z.string(),
  commune: z.string(),
  igp_certified: z.boolean().optional().nullable(),
  total_members: z.number().int().min(0).nullable(),
  user_id: z.string().uuid().nullable(),
});

export type Cooperative = z.infer<typeof CooperativeSchema>;

export interface CooperativeData {
  id: string;
  name: string;
  region: string;
  commune: string;
  igp_certified?: boolean | null;
  total_members: number | null;
}

export interface DashboardStats {
  products: number;
  pendingOrders: number;
}

export interface DashboardData {
  cooperative: CooperativeData;
  stats: DashboardStats;
}
