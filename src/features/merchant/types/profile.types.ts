import { z } from "zod";
import { phoneLocalSchema } from "@/shared/lib";

// Types de données du profil marchand
export interface MerchantProfileData {
  id: string;
  full_name: string;
  phone: string;
  activity_type: string;
  activity_description: string | null;
  cmu_number: string;
  ncc: string | null;
  market_name?: string;
  enrolled_at: string;
  status: string | null;
}

// Schéma Zod pour édition (champs modifiables uniquement)
export const profileEditSchema = z.object({
  full_name: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom est trop long"),
  phone: phoneLocalSchema,
  activity_type: z
    .string()
    .min(2, "Le type d'activité est requis"),
  activity_description: z
    .string()
    .max(500, "Description trop longue")
    .optional()
    .nullable(),
});

export type ProfileEditInput = z.infer<typeof profileEditSchema>;
