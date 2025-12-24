import { z } from "zod";

// Types de base
export interface Promotion {
  id: string;
  merchant_id: string;
  name: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export type PromotionFilter = "all" | "active" | "expired";

// Schema Zod avec validation dates + pourcentage
export const newPromotionSchema = z
  .object({
    name: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(100, "Le nom ne peut pas dépasser 100 caractères"),
    description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.number().positive("La valeur doit être positive"),
    min_purchase: z.number().positive("Le montant minimum doit être positif").optional().nullable(),
    start_date: z.string().min(1, "La date de début est requise"),
    end_date: z.string().min(1, "La date de fin est requise"),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "La date de fin doit être après la date de début",
    path: ["end_date"],
  })
  .refine((data) => data.discount_type !== "percentage" || data.discount_value <= 100, {
    message: "Le pourcentage ne peut pas dépasser 100%",
    path: ["discount_value"],
  });

export type NewPromotionInput = z.infer<typeof newPromotionSchema>;

// Helpers
export function isPromotionExpired(endDate: string): boolean {
  return new Date(endDate) < new Date();
}

export function isPromotionUpcoming(startDate: string): boolean {
  return new Date(startDate) > new Date();
}

export function getPromotionStatus(
  promo: Pick<Promotion, "is_active" | "start_date" | "end_date">
): "expired" | "upcoming" | "active" | "inactive" {
  if (isPromotionExpired(promo.end_date)) return "expired";
  if (isPromotionUpcoming(promo.start_date)) return "upcoming";
  return promo.is_active ? "active" : "inactive";
}
