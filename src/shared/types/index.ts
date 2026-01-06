/**
 * Types métier centralisés - Single Source of Truth
 * Dérivés du schéma Supabase pour garantir la cohérence
 */
import type { Database } from '@/integrations/supabase/types';

// ============================================
// TYPES TABLES PRINCIPALES (alias du schéma DB)
// ============================================

// Merchants
export type Merchant = Database['public']['Tables']['merchants']['Row'];
export type MerchantInsert = Database['public']['Tables']['merchants']['Insert'];
export type MerchantUpdate = Database['public']['Tables']['merchants']['Update'];
export type MerchantStatus = Database['public']['Enums']['merchant_status'];

// Agents
export type Agent = Database['public']['Tables']['agents']['Row'];
export type AgentInsert = Database['public']['Tables']['agents']['Insert'];
export type AgentUpdate = Database['public']['Tables']['agents']['Update'];

// Transactions
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionType = Database['public']['Enums']['transaction_type'];

// Invoices
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];

// Products & Stock
export type Product = Database['public']['Tables']['products']['Row'];
export type MerchantStock = Database['public']['Tables']['merchant_stocks']['Row'];

// Orders
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderStatus = Database['public']['Enums']['order_status'];

// Markets & Cooperatives
export type Market = Database['public']['Tables']['markets']['Row'];
export type Cooperative = Database['public']['Tables']['cooperatives']['Row'];

// CMU Payments
export type CMUPayment = Database['public']['Tables']['cmu_payments']['Row'];

// Audio Recordings
export type AudioRecording = Database['public']['Tables']['audio_recordings']['Row'];

// ============================================
// TYPES MÉTIER COMPOSÉS
// ============================================
// TYPES VUE DASHBOARD
// ============================================

/** Données affichées sur le dashboard marchand (avec jointure marché) */
export interface MerchantDashboardViewData {
  full_name: string;
  activity_type: string;
  market_name?: string;
}

/** Données affichées sur le profil marchand */
export interface MerchantProfileViewData {
  full_name: string;
  activity_type: string;
}

// ============================================

export interface MerchantWithAgent extends Merchant {
  agent?: Agent | null;
}

export interface TransactionWithMerchant extends Transaction {
  merchant?: Merchant | null;
}

export interface InvoiceWithDetails extends Invoice {
  merchant?: Merchant | null;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// ============================================
// TYPES DASHBOARD / STATISTIQUES
// ============================================

export interface MerchantDashboardData {
  full_name: string;
  activity_type: string;
  ncc: string | null;
  cmu_number: string;
  rsti_balance: number | null;
}

export interface AgentDashboardStats {
  totalMerchants: number;
  pendingMerchants: number;
  validatedMerchants: number;
  monthlyEnrollments: number;
}

export interface CooperativeDashboardStats {
  totalMembers: number;
  totalStock: number;
  pendingOrders: number;
  monthlyRevenue: number;
}

export interface AdminDashboardStats {
  totalMerchants: number;
  totalAgents: number;
  totalCooperatives: number;
  totalTransactions: number;
  monthlyGrowth: number;
}

// ============================================
// TYPES GRAPHIQUES / CHARTS
// ============================================

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface SalesChartData {
  name: string;
  ventes: number;
  objectif?: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

// ============================================
// TYPES GÉOLOCALISATION
// ============================================

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface MarkerData {
  id: string;
  position: [number, number];
  label: string;
  type?: 'merchant' | 'market' | 'cooperative';
  status?: MerchantStatus;
}

// ============================================
// TYPES OFFLINE / SYNC
// ============================================

export interface OfflineQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncAt: Date | null;
  isSyncing: boolean;
}

// ============================================
// RE-EXPORTS
// ============================================

export * from './errors';
export * from './web-apis';
export * from './ui';
export * from './realtime.types';
export * from './auth.types';
export * from './offline.types';
export * from './rbac';
