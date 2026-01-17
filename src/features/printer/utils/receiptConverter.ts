/**
 * Utilitaires pour convertir les données de transaction en ReceiptData
 */

import type { ReceiptData, ReceiptItem } from '../types/printer.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TransactionForReceipt {
  reference: string;
  amount: number;
  cmuDeduction?: number;
  rstiDeduction?: number;
  paymentMethod: 'cash' | 'mobile_money' | 'wallet';
  createdAt?: Date | string;
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface MerchantForReceipt {
  name: string;
  phone?: string;
  marketName?: string;
}

/**
 * Convertit une transaction en données de reçu pour impression
 */
export function transactionToReceipt(
  transaction: TransactionForReceipt,
  merchant: MerchantForReceipt
): ReceiptData {
  const date = transaction.createdAt 
    ? new Date(transaction.createdAt) 
    : new Date();

  const items: ReceiptItem[] | undefined = transaction.items?.map(item => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }));

  const subtotal = items?.reduce((sum, item) => sum + item.total, 0);

  return {
    merchantName: merchant.name,
    merchantPhone: merchant.phone,
    marketName: merchant.marketName,
    transactionRef: transaction.reference,
    date: format(date, 'dd/MM/yyyy', { locale: fr }),
    time: format(date, 'HH:mm', { locale: fr }),
    items,
    subtotal,
    cmuDeduction: transaction.cmuDeduction,
    rstiDeduction: transaction.rstiDeduction,
    total: transaction.amount,
    paymentMethod: transaction.paymentMethod,
    qrCodeData: transaction.reference,
    footerMessage: 'Merci pour votre achat!',
  };
}

/**
 * Crée un reçu simplifié (sans détail articles)
 */
export function createSimpleReceipt(
  merchantName: string,
  transactionRef: string,
  amount: number,
  paymentMethod: 'cash' | 'mobile_money' | 'wallet' = 'cash',
  options?: {
    merchantPhone?: string;
    marketName?: string;
    cmuDeduction?: number;
    rstiDeduction?: number;
  }
): ReceiptData {
  const now = new Date();

  return {
    merchantName,
    merchantPhone: options?.merchantPhone,
    marketName: options?.marketName,
    transactionRef,
    date: format(now, 'dd/MM/yyyy', { locale: fr }),
    time: format(now, 'HH:mm', { locale: fr }),
    cmuDeduction: options?.cmuDeduction,
    rstiDeduction: options?.rstiDeduction,
    total: amount,
    paymentMethod,
    qrCodeData: transactionRef,
    footerMessage: 'Merci pour votre achat!',
  };
}
