import { z } from 'zod';

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
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Numéro invalide (10 chiffres)")
    .optional()
    .nullable(),
  zone: z
    .string()
    .max(100, "Zone trop longue")
    .optional()
    .nullable(),
});

export type AgentProfileEditInput = z.infer<typeof agentProfileEditSchema>;
