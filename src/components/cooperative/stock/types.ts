/**
 * Types partagés pour la gestion du stock coopérative
 */

export interface CooperativeStockItem {
  id: string;
  quantity: number;
  unit_price: number | null;
  harvest_date: string | null;
  expiry_date?: string | null;
  product: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface CooperativeProduct {
  id: string;
  name: string;
  unit: string;
}

export type StockStatus = "ok" | "low" | "out" | "expiring";

const LOW_STOCK_THRESHOLD = 10;
const EXPIRY_WARNING_DAYS = 7;

export function getStockStatus(
  quantity: number, 
  expiryDate?: string | null
): StockStatus {
  if (quantity <= 0) return "out";
  
  if (expiryDate) {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + EXPIRY_WARNING_DAYS);
    const warningDateStr = warningDate.toISOString().split('T')[0];
    if (expiryDate <= warningDateStr) return "expiring";
  }
  
  if (quantity <= LOW_STOCK_THRESHOLD) return "low";
  
  return "ok";
}
