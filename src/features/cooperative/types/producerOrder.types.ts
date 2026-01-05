/**
 * Types pour les commandes aux producteurs côté coopérative
 */

export interface ProducerOrderWithDetails {
  id: string;
  cooperative_id: string;
  producer_id: string;
  harvest_id: string | null;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  delivery_date: string | null;
  notes: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  producer?: {
    id: string;
    full_name: string;
    phone: string;
  };
  product?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface AvailableHarvest {
  id: string;
  producer_id: string;
  product_id: string;
  quantity: number;
  available_quantity: number;
  unit_price: number;
  harvest_date: string;
  expiry_date: string | null;
  quality_grade: string | null;
  status: string;
  producer?: {
    id: string;
    full_name: string;
    phone: string;
  };
  product?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface CreateProducerOrderInput {
  producer_id: string;
  product_id: string;
  harvest_id?: string;
  quantity: number;
  unit_price: number;
  delivery_date?: string;
  notes?: string;
}

export type ProducerOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export const PRODUCER_ORDER_STATUS_LABELS: Record<ProducerOrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export const PRODUCER_ORDER_STATUS_COLORS: Record<ProducerOrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};
