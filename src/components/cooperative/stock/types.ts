/**
 * Types partagés pour la gestion du stock coopérative
 */

export interface CooperativeStockItem {
  id: string;
  quantity: number;
  unit_price: number | null;
  harvest_date: string | null;
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
