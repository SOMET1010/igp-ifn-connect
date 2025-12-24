import { z } from 'zod';
import { phoneLocalOptionalSchema } from '@/lib/validationSchemas';

// Données complètes du profil agent
export interface AgentProfileData {
  // Depuis profiles
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  // Depuis agents
  employee_id: string;
  organization: string;
  zone: string | null;
  total_enrollments: number;
  is_active: boolean;
  created_at: string;
}

// Schéma Zod pour édition (champs modifiables uniquement)
export const agentProfileEditSchema = z.object({
  full_name: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom est trop long"),
  phone: phoneLocalOptionalSchema,
  zone: z
    .string()
    .max(100, "Zone trop longue")
    .optional()
    .nullable(),
});

export type AgentProfileEditInput = z.infer<typeof agentProfileEditSchema>;
