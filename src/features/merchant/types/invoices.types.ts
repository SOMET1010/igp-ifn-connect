import { z } from 'zod';

export interface Invoice {
  id: string;
  invoice_number: string;
  merchant_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_ncc: string | null;
  amount_ht: number;
  tva_rate: number | null;
  tva_amount: number | null;
  amount_ttc: number;
  status: 'issued' | 'cancelled' | null;
  signature_hash: string | null;
  qr_code_data: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface MerchantInvoiceData {
  id: string;
  full_name: string;
  phone: string;
  ncc: string | null;
  fiscal_regime: string | null;
  invoice_counter: number | null;
}

export type InvoiceFilter = 'all' | 'issued' | 'cancelled';

export const newInvoiceSchema = z.object({
  amount: z.number().positive('Le montant doit être supérieur à 0'),
  description: z.string().min(2, 'La description est requise').max(500, 'Maximum 500 caractères'),
  customer_name: z.string().max(100).optional(),
  customer_phone: z.string().max(20).optional()
});

export const cancelInvoiceSchema = z.object({
  reason: z.string()
    .min(10, 'Le motif doit contenir au moins 10 caractères')
    .max(500, 'Maximum 500 caractères')
});

export type NewInvoiceInput = z.infer<typeof newInvoiceSchema>;
export type CancelInvoiceInput = z.infer<typeof cancelInvoiceSchema>;

export function isInvoiceCancelled(invoice: Invoice): boolean {
  return invoice.status === 'cancelled';
}

export function formatInvoiceAmount(value: string): string {
  const num = parseInt(value.replace(/\D/g, ''), 10);
  if (isNaN(num)) return '';
  return num.toLocaleString('fr-FR');
}

export function parseInvoiceAmount(value: string): number {
  return parseInt(value.replace(/\D/g, ''), 10) || 0;
}
