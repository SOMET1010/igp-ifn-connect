import type { SelectedProduct } from "../types/transaction.types";

/**
 * Calcule le montant total des produits sélectionnés
 */
export function calculateProductsTotal(products: SelectedProduct[]): number {
  return products.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
}

/**
 * Calcule la déduction CMU (1%)
 */
export function calculateCmuDeduction(amount: number): number {
  return Math.round(amount * 0.01);
}

/**
 * Calcule la déduction RSTI (0.5%)
 */
export function calculateRstiDeduction(amount: number): number {
  return Math.round(amount * 0.005);
}

/**
 * Génère une référence de transaction unique
 */
export function generateTransactionReference(): string {
  return `TXN-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * Formate un montant en FCFA lisible
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR");
}

/**
 * Calcule le montant effectif (produits ou manuel)
 */
export function calculateEffectiveAmount(
  productsTotal: number,
  manualAmount: number
): number {
  return productsTotal > 0 ? productsTotal : manualAmount;
}

/**
 * Parse le montant manuel depuis une chaîne
 */
export function parseManualAmount(input: string): number {
  return parseInt(input.replace(/\D/g, "")) || 0;
}
