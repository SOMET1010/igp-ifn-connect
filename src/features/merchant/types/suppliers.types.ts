// ============================================
// Types - Merchant Suppliers
// ============================================

import type { Product, ProductOffer } from "@/features/public/components/market/ProductGrid";

export type { Product, ProductOffer };

export interface CartItem {
  cooperativeId: string;
  cooperativeName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  stockId: string;
  maxQuantity: number;
}

export interface SupplierOrder {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: OrderStatus;
  delivery_date: string | null;
  created_at: string;
  notes: string | null;
  cooperatives: { name: string };
  products: { name: string; unit: string };
}

export type OrderStatus = 
  | "pending" 
  | "confirmed" 
  | "in_transit" 
  | "delivered" 
  | "cancelled";

export interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

export interface CategoryWithCount extends Category {
  productCount: number;
}

export interface Cooperative {
  id: string;
  name: string;
  region: string;
  commune: string;
  igp_certified?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface SubmitOrderInput {
  merchantId: string;
  cart: CartItem[];
  deliveryDate?: string;
  notes?: string;
}

export interface SuppliersState {
  categories: Category[];
  products: Product[];
  cooperatives: Cooperative[];
  orders: SupplierOrder[];
  loading: boolean;
}

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; iconName: "clock" | "check" | "truck" | "x" }
> = {
  pending: { label: "En attente", color: "bg-yellow-500", iconName: "clock" },
  confirmed: { label: "Confirmée", color: "bg-blue-500", iconName: "check" },
  in_transit: { label: "En livraison", color: "bg-orange-500", iconName: "truck" },
  delivered: { label: "Livrée", color: "bg-green-500", iconName: "check" },
  cancelled: { label: "Annulée", color: "bg-red-500", iconName: "x" },
};
