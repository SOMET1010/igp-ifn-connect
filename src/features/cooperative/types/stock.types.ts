/**
 * Types pour la gestion du stock coopérative
 */
import { z } from "zod";

export interface CooperativeStockItem {
  id: string;
  quantity: number;
  unit_price: number | null;
  harvest_date: string | null;
  expiry_date?: string | null;
  product: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface CooperativeProduct {
  id: string;
  name: string;
  unit: string;
}

export type StockStatus = "ok" | "low" | "out" | "expiring";

// Schéma Zod pour l'ajout de stock
export const AddStockInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0).nullable(),
});

export type AddStockInput = z.infer<typeof AddStockInputSchema>;

// Constantes
export const LOW_STOCK_THRESHOLD = 10;
export const EXPIRY_WARNING_DAYS = 7;

/**
 * Détermine le statut d'un stock
 */
export function getStockStatus(
  quantity: number, 
  expiryDate?: string | null
): StockStatus {
  if (quantity <= 0) return "out";
  
  if (expiryDate) {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + EXPIRY_WARNING_DAYS);
    const warningDateStr = warningDate.toISOString().split('T')[0];
    if (expiryDate <= warningDateStr) return "expiring";
  }
  
  if (quantity <= LOW_STOCK_THRESHOLD) return "low";
  
  return "ok";
}
