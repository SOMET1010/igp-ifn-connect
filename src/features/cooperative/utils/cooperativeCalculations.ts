/**
 * Fonctions utilitaires pures pour les calculs coopérative
 */
import type { CooperativeStockItem, StockStatus } from "../types/stock.types";
import type { Order, OrderStatus } from "../types/order.types";
import { LOW_STOCK_THRESHOLD, EXPIRY_WARNING_DAYS, getStockStatus } from "../types/stock.types";

// Re-export pour faciliter l'usage
export { getStockStatus, LOW_STOCK_THRESHOLD, EXPIRY_WARNING_DAYS };

/**
 * Compte les articles en stock bas
 */
export function countLowStockItems(stocks: CooperativeStockItem[]): number {
  return stocks.filter(stock => 
    stock.quantity > 0 && stock.quantity <= LOW_STOCK_THRESHOLD
  ).length;
}

/**
 * Compte les articles en rupture de stock
 */
export function countOutOfStockItems(stocks: CooperativeStockItem[]): number {
  return stocks.filter(stock => stock.quantity === 0).length;
}

/**
 * Compte les articles qui expirent bientôt
 */
export function countExpiringItems(stocks: CooperativeStockItem[]): number {
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + EXPIRY_WARNING_DAYS);
  const warningDateStr = warningDate.toISOString().split('T')[0];

  return stocks.filter(stock => 
    stock.expiry_date && 
    stock.expiry_date <= warningDateStr && 
    stock.quantity > 0
  ).length;
}

/**
 * Filtre les commandes par statut
 */
export function filterOrdersByStatus(orders: Order[], status: OrderStatus): Order[] {
  return orders.filter(order => order.status === status);
}

/**
 * Formate la localisation d'une coopérative
 */
export function formatCooperativeLocation(commune: string, region: string): string {
  return `${commune}, ${region}`;
}
