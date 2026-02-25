/**
 * Types pour le module Producteur - JÙLABA
 */

export interface Producer {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  region: string;
  commune: string;
  cooperative_id: string | null;
  specialties: string[];
  igp_certified: boolean;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  cooperative?: {
    id: string;
    name: string;
    code: string;
  };
}

export type HarvestStatus = 'available' | 'reserved' | 'sold' | 'expired';
export type QualityGrade = 'A' | 'B' | 'C';

export interface ProducerHarvest {
  id: string;
  producer_id: string;
  product_id: string;
  quantity: number;
  available_quantity: number;
  unit_price: number;
  harvest_date: string;
  expiry_date: string | null;
  quality_grade: QualityGrade | null;
  status: HarvestStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    unit: string;
    image_url: string | null;
  };
}

export type CooperativeOrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'delivered' 
  | 'cancelled';

export interface CooperativeProducerOrder {
  id: string;
  cooperative_id: string;
  producer_id: string;
  harvest_id: string | null;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: CooperativeOrderStatus;
  delivery_date: string | null;
  notes: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  cooperative?: {
    id: string;
    name: string;
    code: string;
    phone: string | null;
  };
  product?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface ProducerStats {
  totalHarvests: number;
  availableHarvests: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface HarvestFormData {
  product_id: string;
  quantity: number;
  unit_price: number;
  harvest_date: string;
  expiry_date?: string;
  quality_grade?: QualityGrade;
  notes?: string;
}
