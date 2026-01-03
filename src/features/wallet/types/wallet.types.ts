import { z } from "zod";

// Types de base
export interface Wallet {
  id: string;
  merchant_id: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WalletTransactionType = 
  | "transfer_sent" 
  | "transfer_received" 
  | "deposit" 
  | "withdrawal" 
  | "payment" 
  | "refund";

export type WalletTransactionStatus = "pending" | "completed" | "failed" | "cancelled";

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: WalletTransactionType;
  amount: number;
  fee: number;
  counterparty_wallet_id: string | null;
  counterparty_name: string | null;
  counterparty_phone: string | null;
  reference: string;
  description: string | null;
  status: WalletTransactionStatus;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  owner_wallet_id: string;
  beneficiary_wallet_id: string;
  nickname: string | null;
  is_favorite: boolean;
  transfer_count: number;
  last_transfer_at: string | null;
  created_at: string;
  // Enriched data
  phone?: string;
  merchant_name?: string;
}

// Schémas de validation
export const TransferInputSchema = z.object({
  recipient_phone: z.string().min(8, "Numéro de téléphone requis"),
  amount: z.number().min(100, "Montant minimum: 100 FCFA").max(5000000, "Montant maximum: 5 000 000 FCFA"),
  description: z.string().optional(),
});

export type TransferInput = z.infer<typeof TransferInputSchema>;

// Response types
export interface TransferResponse {
  success: boolean;
  data?: {
    reference: string;
    amount: number;
    recipient_name: string;
    new_balance: number;
  };
  error?: string;
}

// Dashboard data
export interface WalletDashboardData {
  wallet: Wallet | null;
  recentTransactions: WalletTransaction[];
  beneficiaries: Beneficiary[];
  stats: {
    totalSent: number;
    totalReceived: number;
    transactionCount: number;
  };
}

// Transaction filters
export type TransactionFilter = "all" | "sent" | "received" | "deposit" | "withdrawal";

export const TRANSACTION_TYPE_LABELS: Record<WalletTransactionType, string> = {
  transfer_sent: "Envoyé",
  transfer_received: "Reçu",
  deposit: "Dépôt",
  withdrawal: "Retrait",
  payment: "Paiement",
  refund: "Remboursement",
};

export const TRANSACTION_TYPE_ICONS: Record<WalletTransactionType, string> = {
  transfer_sent: "↗️",
  transfer_received: "↙️",
  deposit: "💳",
  withdrawal: "🏧",
  payment: "🛒",
  refund: "↩️",
};
