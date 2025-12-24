import { z } from "zod";

// === Agent Request Types ===

export const AgentRequestSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  full_name: z.string().min(3),
  phone: z.string().min(8),
  organization: z.string(),
  preferred_zone: z.string().nullable(),
  motivation: z.string().nullable(),
  status: z.enum(["pending", "approved", "rejected"]),
  reviewed_by: z.string().uuid().nullable(),
  reviewed_at: z.string().nullable(),
  rejection_reason: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type AgentRequest = z.infer<typeof AgentRequestSchema>;

export const AgentRequestInputSchema = z.object({
  full_name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  phone: z.string().min(8, "Le téléphone doit contenir au moins 8 chiffres"),
  organization: z.string().min(1),
  preferred_zone: z.string().optional(),
  motivation: z.string().optional(),
});

export type AgentRequestInput = z.infer<typeof AgentRequestInputSchema>;

// === Agent Profile Types ===

export interface AgentProfile {
  id: string;
  user_id: string;
  employee_id: string;
  organization: string;
  zone: string | null;
  total_enrollments: number;
  is_active: boolean;
  created_at: string;
}

// === Dashboard Types ===

export interface AgentDashboardStats {
  today: number;
  week: number;
  total: number;
}

export interface AgentDashboardData {
  profile: { full_name: string } | null;
  stats: AgentDashboardStats;
  isAgentRegistered: boolean;
}
