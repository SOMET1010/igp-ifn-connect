/**
 * Types pour Supabase Realtime payloads
 * Élimine les `as any` dans les hooks realtime
 */

import type { Database } from '@/integrations/supabase/types';

// ============================================
// PAYLOADS REALTIME GÉNÉRIQUES
// ============================================

export interface RealtimePayload<T> {
  commit_timestamp: string;
  errors: string[] | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: Partial<T>;
  schema: string;
  table: string;
}

// ============================================
// PAYLOADS SPÉCIFIQUES PAR TABLE
// ============================================

// Orders
export type OrderRow = Database['public']['Tables']['orders']['Row'];
export interface OrderRealtimePayload extends RealtimePayload<OrderRow> {
  table: 'orders';
}

// Transactions
export type TransactionRow = Database['public']['Tables']['transactions']['Row'];
export interface TransactionRealtimePayload extends RealtimePayload<TransactionRow> {
  table: 'transactions';
}

// Merchants
export type MerchantRow = Database['public']['Tables']['merchants']['Row'];
export interface MerchantRealtimePayload extends RealtimePayload<MerchantRow> {
  table: 'merchants';
}

// Notifications
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export interface NotificationRealtimePayload extends RealtimePayload<NotificationRow> {
  table: 'notifications';
}

// Invoices
export type InvoiceRow = Database['public']['Tables']['invoices']['Row'];
export interface InvoiceRealtimePayload extends RealtimePayload<InvoiceRow> {
  table: 'invoices';
}

// Customer Credits
export type CustomerCreditRow = Database['public']['Tables']['customer_credits']['Row'];
export interface CustomerCreditRealtimePayload extends RealtimePayload<CustomerCreditRow> {
  table: 'customer_credits';
}

// ============================================
// TYPE HELPER
// ============================================

/**
 * Helper pour typer les payloads realtime de manière générique
 */
export function isRealtimePayload<T>(
  payload: unknown,
  table: string
): payload is RealtimePayload<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'new' in payload &&
    'old' in payload &&
    'eventType' in payload
  );
}
