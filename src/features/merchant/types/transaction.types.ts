import { z } from "zod";

// ============================================
// Schéma création transaction
// ============================================
export const CreateTransactionSchema = z.object({
  merchant_id: z.string().uuid("ID marchand invalide"),
  amount: z.number().min(100, "Montant minimum 100 FCFA"),
  transaction_type: z.enum(["cash", "mobile_money"]),
  cmu_deduction: z.number().min(0),
  rsti_deduction: z.number().min(0),
  reference: z.string().min(1),
});

// ============================================
// Schéma produit sélectionné
// ============================================
export const SelectedProductSchema = z.object({
  stockId: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().min(0),
  imageUrl: z.string().nullable().optional(),
});

// ============================================
// Schéma item de stock (pour mapping)
// ============================================
export const StockItemSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  product_name: z.string(),
  quantity: z.number(),
  unit_price: z.number().nullable(),
  image_url: z.string().nullable().optional(),
  unit: z.string().optional(),
});

// ============================================
// Types inférés
// ============================================
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type SelectedProduct = z.infer<typeof SelectedProductSchema>;
export type StockItemForSelector = z.infer<typeof StockItemSchema>;

// ============================================
// Types de paiement et étapes
// ============================================
export type PaymentMethod = "cash" | "mobile_money";
export type CashierStep = "input" | "confirm" | "success";

// ============================================
// Interface transaction complète
// ============================================
export interface TransactionDetails {
  reference: string;
  amount: number;
  paymentMethod: PaymentMethod;
  cmuDeduction: number;
  rstiDeduction: number;
  date: Date;
  merchantName: string;
}
