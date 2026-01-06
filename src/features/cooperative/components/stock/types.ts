/**
 * Types partagés pour la gestion du stock coopérative
 * Re-export depuis la feature pour compatibilité descendante
 */
export type { 
  CooperativeStockItem, 
  CooperativeProduct, 
  StockStatus 
} from "@/features/cooperative";

export { getStockStatus } from "@/features/cooperative";
