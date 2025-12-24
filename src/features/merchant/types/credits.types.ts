import { z } from 'zod';
import { phoneLocalSchema } from '@/lib/validationSchemas';

// Database entity
export interface CustomerCredit {
  id: string;
  customer_name: string;
  customer_phone: string;
  amount_owed: number;
  amount_paid: number;
  due_date: string | null;
  status: 'pending' | 'partially_paid' | 'paid';
  notes: string | null;
  created_at: string;
}

// Filter type
export type CreditFilter = 'all' | 'pending' | 'overdue' | 'paid';

// Zod schemas for validation
export const newCreditSchema = z.object({
  customer_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  customer_phone: phoneLocalSchema.optional().or(z.literal('')),
  amount_owed: z.number().positive('Le montant doit être supérieur à 0'),
  due_date: z.string().optional(),
  notes: z.string().optional()
});

export const paymentSchema = z.object({
  amount: z.number().positive('Le montant doit être supérieur à 0')
});

// Inferred types from Zod
export type NewCreditInput = z.infer<typeof newCreditSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;

// Helper to check if credit is overdue
export function isCreditOverdue(credit: CustomerCredit): boolean {
  return Boolean(
    credit.due_date && 
    new Date(credit.due_date) < new Date() && 
    credit.status !== 'paid'
  );
}
