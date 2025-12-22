/**
 * Types partagés pour la gestion du stock marchand
 */

export interface Product {
  id: string;
  name: string;
  unit: string;
  is_igp?: boolean;
  category_id: string | null;
}

export interface StockItem {
  id: string;
  product_id: string;
  quantity: number;
  min_threshold: number;
  unit_price: number | null;
  last_restocked_at: string | null;
  product?: Product;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

export type StockStatus = "ok" | "low" | "out";

export function getStockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return "out";
  if (quantity <= threshold) return "low";
  return "ok";
}
