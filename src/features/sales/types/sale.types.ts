/**
 * Types pour la feature Sales - P.NA.VIM
 */

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuickSale {
  id?: string;
  merchantId: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'mobile' | 'credit';
  createdAt: string;
  syncedAt?: string;
  isOffline?: boolean;
}

export interface QuickSaleInput {
  product: string;
  quantity: number;
  unitPrice?: number;
  totalAmount?: number;
}

export type QuickSaleStep = 'idle' | 'listening' | 'parsing' | 'confirm' | 'processing' | 'success' | 'error';

export interface QuickSaleState {
  step: QuickSaleStep;
  input: QuickSaleInput | null;
  error: string | null;
  saleId: string | null;
}

export interface VoiceCommand {
  raw: string;
  parsed: QuickSaleInput | null;
  confidence: number;
}

// Patterns pour parsing vocal
export const QUANTITY_WORDS: Record<string, number> = {
  'un': 1, 'une': 1,
  'deux': 2,
  'trois': 3,
  'quatre': 4,
  'cinq': 5,
  'six': 6,
  'sept': 7,
  'huit': 8,
  'neuf': 9,
  'dix': 10,
  'onze': 11,
  'douze': 12,
  'quinze': 15,
  'vingt': 20,
  'trente': 30,
  'quarante': 40,
  'cinquante': 50,
  'cent': 100,
};

export const PRICE_PATTERNS = [
  /(\d+)\s*(?:francs?|fcfa|f|cfa)/i,
  /(?:à|pour)\s*(\d+)/i,
];
