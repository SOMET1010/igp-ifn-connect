/**
 * Ré-export pour compatibilité descendante
 * Les types sont maintenant centralisés dans @/features/merchant/types/stock.types
 */

export type {
  Product,
  StockItem,
  ProductCategory,
  StockStatus,
  AddStockInput,
  UpdateStockInput,
} from "@/features/merchant/types/stock.types";

export { getStockStatus } from "@/features/merchant/types/stock.types";
