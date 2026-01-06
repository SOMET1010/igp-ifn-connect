/**
 * Service de vente - P.NA.VIM
 * Gestion des ventes avec support offline
 */

import { supabase } from '@/integrations/supabase/client';
import { addToOfflineQueue } from '@/shared/lib';
import { logger } from '@/shared/services/logger';
import type { QuickSale, QuickSaleInput } from '../types/sale.types';

/**
 * Crée une vente rapide (avec support offline)
 */
export async function createQuickSale(
  merchantId: string,
  input: QuickSaleInput
): Promise<{ success: boolean; saleId?: string; offline?: boolean; error?: string }> {
  const traceId = logger.setTraceId();
  
  const totalAmount = input.totalAmount || (input.unitPrice ? input.unitPrice * input.quantity : 0);
  
  const sale: QuickSale = {
    merchantId,
    items: [{
      productId: 'quick-sale', // Vente rapide sans produit spécifique
      productName: input.product,
      quantity: input.quantity,
      unitPrice: input.unitPrice || (input.totalAmount ? input.totalAmount / input.quantity : 0),
      totalPrice: totalAmount,
    }],
    totalAmount,
    paymentMethod: 'cash',
    createdAt: new Date().toISOString(),
  };

  // Vérifier la connexion
  if (!navigator.onLine) {
    logger.critical.offlineQueue({ action: 'add', entity: 'sale', count: 1 });
    
    await addToOfflineQueue({
      id: `sale-${Date.now()}`,
      entity_type: 'transaction',
      entity_id: `quick-${Date.now()}`,
      action: 'create',
      data: sale,
      created_at: new Date().toISOString(),
    });

    logger.critical.sale({
      amount: sale.totalAmount,
      products: [input.product],
      offline: true,
    });

    return { success: true, offline: true };
  }

  // Vente en ligne
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        merchant_id: merchantId,
        amount: totalAmount,
        transaction_type: 'cash' as const,
        reference: `QUICK-${Date.now()}`,
      }])
      .select('id')
      .single();

    if (error) throw error;

    logger.critical.sale({
      amount: sale.totalAmount,
      products: [input.product],
      offline: false,
    });

    return { success: true, saleId: data.id };
  } catch (error) {
    logger.error('SALE:CREATE_FAILED', error as Error, { traceId, input });

    // Fallback offline
    await addToOfflineQueue({
      id: `sale-${Date.now()}`,
      entity_type: 'transaction',
      entity_id: `quick-${Date.now()}`,
      action: 'create',
      data: sale,
      created_at: new Date().toISOString(),
    });

    return { 
      success: true, 
      offline: true,
      error: 'Connexion perdue, vente sauvegardée hors-ligne'
    };
  }
}

/**
 * Parse une commande vocale en QuickSaleInput
 */
export function parseVoiceCommand(text: string): QuickSaleInput | null {
  if (!text || text.length < 3) return null;

  const normalizedText = text.toLowerCase().trim();
  
  // Pattern: "3 tomates 500 francs" ou "trois tomates à 500"
  const patterns = [
    // Chiffre + produit + prix
    /^(\d+)\s+(\w+(?:\s+\w+)?)\s+(?:à\s+)?(\d+)\s*(?:francs?|fcfa|f|cfa)?$/i,
    // Mot-nombre + produit + prix
    /^(un|une|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s+(\w+(?:\s+\w+)?)\s+(?:à\s+)?(\d+)\s*(?:francs?|fcfa|f|cfa)?$/i,
    // Chiffre + produit (sans prix)
    /^(\d+)\s+(\w+(?:\s+\w+)?)$/i,
    // Simple: produit + prix
    /^(\w+(?:\s+\w+)?)\s+(\d+)\s*(?:francs?|fcfa|f|cfa)?$/i,
  ];

  const quantityWords: Record<string, number> = {
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
  };

  for (const pattern of patterns) {
    const match = normalizedText.match(pattern);
    if (match) {
      if (patterns.indexOf(pattern) <= 1) {
        // Pattern avec quantité + produit + prix
        let quantity = parseInt(match[1], 10);
        if (isNaN(quantity)) {
          quantity = quantityWords[match[1].toLowerCase()] || 1;
        }
        return {
          quantity,
          product: match[2].trim(),
          totalAmount: parseInt(match[3], 10),
        };
      } else if (patterns.indexOf(pattern) === 2) {
        // Pattern quantité + produit (sans prix)
        return {
          quantity: parseInt(match[1], 10) || 1,
          product: match[2].trim(),
        };
      } else {
        // Pattern produit + prix
        return {
          quantity: 1,
          product: match[1].trim(),
          totalAmount: parseInt(match[2], 10),
        };
      }
    }
  }

  // Fallback: extraire ce qu'on peut
  const words = normalizedText.split(/\s+/);
  const numbers = normalizedText.match(/\d+/g)?.map(Number) || [];
  
  if (words.length >= 1) {
    return {
      quantity: numbers[0] || 1,
      product: words.filter(w => !/^\d+$/.test(w) && !['francs', 'fcfa', 'f', 'cfa', 'à'].includes(w)).join(' '),
      totalAmount: numbers[numbers.length - 1] || undefined,
    };
  }

  return null;
}

/**
 * Génère le texte de confirmation TTS
 */
export function generateConfirmationText(input: QuickSaleInput): string {
  const quantity = input.quantity;
  const product = input.product;
  const amount = input.totalAmount || input.unitPrice;
  
  if (amount) {
    return `${quantity} ${product} à ${amount} francs, c'est bon ?`;
  }
  return `${quantity} ${product}, c'est bon ?`;
}

/**
 * Génère le texte de succès TTS
 */
export function generateSuccessText(offline: boolean = false): string {
  if (offline) {
    return "C'est noté ! La vente sera synchronisée dès que la connexion revient.";
  }
  return "C'est noté ! Vente enregistrée.";
}
