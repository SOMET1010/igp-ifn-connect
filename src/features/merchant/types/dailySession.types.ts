import { z } from "zod";

// ============================================
// Schémas Zod
// ============================================

export const OpenSessionSchema = z.object({
  opening_cash: z.number().min(0, "Le fond de caisse doit être positif"),
  notes: z.string().optional(),
});

export const CloseSessionSchema = z.object({
  closing_cash: z.number().min(0, "Le montant de clôture doit être positif"),
  notes: z.string().optional(),
});

// ============================================
// Types inférés
// ============================================

export type OpenSessionInput = z.infer<typeof OpenSessionSchema>;
export type CloseSessionInput = z.infer<typeof CloseSessionSchema>;

// ============================================
// Interface Session
// ============================================

export interface DailySession {
  id: string;
  merchant_id: string;
  session_date: string;
  opened_at: string;
  closed_at: string | null;
  opening_cash: number;
  closing_cash: number | null;
  expected_cash: number | null;
  cash_difference: number | null;
  total_sales: number;
  total_transactions: number;
  notes: string | null;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
}

export type SessionStatus = "open" | "closed" | "none";

export interface SessionSummary {
  totalSales: number;
  totalTransactions: number;
  expectedCash: number;
  openingCash: number;
}
