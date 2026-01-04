/**
 * Parser d'intents vocaux - Français Ivoirien
 * Convertit le texte vocal en intentions structurées
 */

import type { 
  ParseResult, 
  SaleIntent, 
  ControlIntent, 
  StockIntent, 
  ArticleIntent,
  VoiceIntent 
} from '../types/voice.types';

// Dictionnaire nombres français
const NUMBER_WORDS: Record<string, number> = {
  'zéro': 0, 'zero': 0,
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
  'treize': 13,
  'quatorze': 14,
  'quinze': 15,
  'seize': 16,
  'vingt': 20,
  'trente': 30,
  'quarante': 40,
  'cinquante': 50,
  'soixante': 60,
  'quatre-vingt': 80,
  'quatre-vingts': 80,
  'cent': 100,
  'cents': 100,
  'mille': 1000,
  'million': 1000000,
};

// Multiplicateurs
const MULTIPLIERS: Record<string, number> = {
  'cent': 100,
  'cents': 100,
  'mille': 1000,
  'million': 1000000,
};

// Unités de vente courantes
const UNITS = ['bassine', 'bassines', 'sac', 'sacs', 'panier', 'paniers', 'tas', 'pièce', 'pièces', 'kg', 'kilo', 'kilos'];

// Produits courants (extensible)
const COMMON_PRODUCTS = [
  'tomate', 'tomates', 'igname', 'ignames', 'banane', 'bananes', 
  'manioc', 'attiéké', 'attieke', 'riz', 'huile', 'oignon', 'oignons',
  'piment', 'piments', 'aubergine', 'aubergines', 'gombo', 'gombos',
  'poisson', 'poissons', 'viande', 'poulet', 'oeuf', 'oeufs',
  'avocat', 'avocats', 'orange', 'oranges', 'papaye', 'papayes',
  'ananas', 'mangue', 'mangues', 'citron', 'citrons'
];

// Mots de contrôle
const CONTROL_WORDS = {
  confirm: ['oui', 'ok', 'okay', 'd\'accord', 'daccord', 'confirme', 'valide', 'c\'est bon', 'cest bon', 'exact', 'correct'],
  cancel: ['non', 'annule', 'annuler', 'stop', 'arrête', 'arrete', 'pas ça', 'pas ca'],
  repeat: ['répète', 'repete', 'répéter', 'repeter', 'redis', 'encore', 'quoi'],
  help: ['aide', 'aider', 'comment', 'explique', 'je comprends pas'],
  undo: ['retour', 'défaire', 'defaire', 'erreur', 'correction']
};

/**
 * Parse un nombre en français (oral)
 * Ex: "deux mille cinq cents" -> 2500
 */
export function parseFrenchNumber(text: string): number | null {
  const normalized = text.toLowerCase().trim();
  
  // D'abord chercher les chiffres arabes
  const arabicMatch = normalized.match(/\d+/g);
  if (arabicMatch) {
    const num = parseInt(arabicMatch.join(''), 10);
    if (!isNaN(num)) return num;
  }
  
  // Parser les mots
  const words = normalized.split(/[\s-]+/);
  let result = 0;
  let current = 0;
  
  for (const word of words) {
    const numValue = NUMBER_WORDS[word];
    const multValue = MULTIPLIERS[word];
    
    if (numValue !== undefined) {
      if (multValue !== undefined) {
        // C'est un multiplicateur (cent, mille)
        if (current === 0) current = 1;
        current *= multValue;
        if (multValue >= 1000) {
          result += current;
          current = 0;
        }
      } else {
        current += numValue;
      }
    } else if (multValue !== undefined) {
      if (current === 0) current = 1;
      current *= multValue;
      if (multValue >= 1000) {
        result += current;
        current = 0;
      }
    }
  }
  
  result += current;
  return result > 0 ? result : null;
}

/**
 * Extrait tous les nombres d'un texte
 */
export function extractNumbers(text: string): number[] {
  const numbers: number[] = [];
  
  // Chercher les chiffres arabes
  const arabicMatches = text.match(/\d+/g);
  if (arabicMatches) {
    arabicMatches.forEach(m => {
      const n = parseInt(m, 10);
      if (!isNaN(n)) numbers.push(n);
    });
  }
  
  // Chercher les mots-nombres
  const words = text.toLowerCase().split(/[\s-]+/);
  let currentNumber = 0;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const numValue = NUMBER_WORDS[word];
    
    if (numValue !== undefined) {
      const mult = MULTIPLIERS[word];
      if (mult !== undefined) {
        if (currentNumber === 0) currentNumber = 1;
        currentNumber *= mult;
      } else {
        currentNumber += numValue;
      }
    } else if (currentNumber > 0) {
      numbers.push(currentNumber);
      currentNumber = 0;
    }
  }
  
  if (currentNumber > 0) {
    numbers.push(currentNumber);
  }
  
  return numbers;
}

/**
 * Normalise le texte pour le parsing
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrait un intent de vente
 */
export function extractSaleIntent(text: string): SaleIntent | null {
  const normalized = normalizeText(text);
  const numbers = extractNumbers(text);
  
  // Chercher un produit
  let productName: string | undefined;
  for (const product of COMMON_PRODUCTS) {
    if (normalized.includes(normalizeText(product))) {
      productName = product;
      break;
    }
  }
  
  // Chercher une unité
  let unit: SaleIntent['unit'];
  for (const u of UNITS) {
    if (normalized.includes(u)) {
      if (u.includes('bassine')) unit = 'bassine';
      else if (u.includes('sac')) unit = 'sac';
      else if (u.includes('panier')) unit = 'panier';
      else if (u.includes('tas')) unit = 'tas';
      else if (u.includes('piece') || u.includes('pièce')) unit = 'piece';
      else if (u.includes('kg') || u.includes('kilo')) unit = 'kg';
      break;
    }
  }
  
  // Déterminer quantité et montant
  let quantity: number | undefined;
  let amountXOF: number | undefined;
  
  if (numbers.length === 1) {
    // Un seul nombre = montant probable
    amountXOF = numbers[0];
  } else if (numbers.length >= 2) {
    // Premier = quantité, dernier = montant
    quantity = numbers[0];
    amountXOF = numbers[numbers.length - 1];
  }
  
  // Mots-clés indiquant une vente
  const saleKeywords = ['vente', 'vendu', 'vends', 'achete', 'acheté', 'paye', 'payé', 'francs', 'fcfa', 'cfa'];
  const hasSaleKeyword = saleKeywords.some(k => normalized.includes(k));
  
  // Calculer la confiance
  let confidence = 0.3;
  if (productName) confidence += 0.2;
  if (unit) confidence += 0.1;
  if (amountXOF) confidence += 0.2;
  if (hasSaleKeyword) confidence += 0.2;
  
  if (amountXOF || productName) {
    return {
      intent: 'SALE_CREATE',
      productName,
      unit,
      quantity,
      amountXOF,
      confidence: Math.min(confidence, 1)
    };
  }
  
  return null;
}

/**
 * Extrait un intent de contrôle
 */
export function extractControlIntent(text: string): ControlIntent | null {
  const normalized = normalizeText(text);
  
  for (const [type, words] of Object.entries(CONTROL_WORDS)) {
    for (const word of words) {
      if (normalized.includes(normalizeText(word))) {
        return {
          intent: type.toUpperCase() as ControlIntent['intent'],
          confidence: 0.9
        };
      }
    }
  }
  
  return null;
}

/**
 * Extrait un intent de stock
 */
export function extractStockIntent(text: string): StockIntent | null {
  const normalized = normalizeText(text);
  const numbers = extractNumbers(text);
  
  // Mots-clés stock
  const addKeywords = ['ajoute', 'ajout', 'recu', 'reçu', 'livraison', 'arrivage'];
  const checkKeywords = ['combien', 'reste', 'stock', 'quantite'];
  const alertKeywords = ['manque', 'fini', 'plus de', 'rupture'];
  
  let intent: StockIntent['intent'] | null = null;
  
  if (addKeywords.some(k => normalized.includes(k))) {
    intent = 'STOCK_ADD';
  } else if (alertKeywords.some(k => normalized.includes(k))) {
    intent = 'STOCK_ALERT';
  } else if (checkKeywords.some(k => normalized.includes(k))) {
    intent = 'STOCK_CHECK';
  }
  
  if (!intent) return null;
  
  // Chercher un produit
  let productName: string | undefined;
  for (const product of COMMON_PRODUCTS) {
    if (normalized.includes(normalizeText(product))) {
      productName = product;
      break;
    }
  }
  
  return {
    intent,
    productName,
    quantity: numbers[0],
    confidence: productName ? 0.8 : 0.5
  };
}

/**
 * Extrait un intent d'article/produit
 */
export function extractArticleIntent(text: string): ArticleIntent | null {
  const normalized = normalizeText(text);
  const numbers = extractNumbers(text);
  
  // Mots-clés article
  const createKeywords = ['nouveau', 'nouvel', 'ajouter', 'creer', 'créer'];
  const priceKeywords = ['prix', 'coute', 'coûte', 'vaut'];
  const deleteKeywords = ['supprimer', 'effacer', 'enlever'];
  
  let intent: ArticleIntent['intent'] | null = null;
  
  if (createKeywords.some(k => normalized.includes(k))) {
    intent = 'ARTICLE_CREATE';
  } else if (deleteKeywords.some(k => normalized.includes(k))) {
    intent = 'ARTICLE_DELETE';
  } else if (priceKeywords.some(k => normalized.includes(k))) {
    intent = 'ARTICLE_PRICE';
  }
  
  if (!intent) return null;
  
  // Chercher un produit
  let productName: string | undefined;
  for (const product of COMMON_PRODUCTS) {
    if (normalized.includes(normalizeText(product))) {
      productName = product;
      break;
    }
  }
  
  return {
    intent,
    productName,
    price: numbers[0],
    confidence: productName ? 0.8 : 0.5
  };
}

/**
 * Parse principal - analyse le texte et retourne l'intent le plus probable
 */
export function parseVoiceInput(text: string): ParseResult {
  if (!text || text.trim().length === 0) {
    return {
      success: false,
      rawText: text,
      normalizedText: '',
      numbers: [],
      error: 'Texte vide'
    };
  }
  
  const normalizedText = normalizeText(text);
  const numbers = extractNumbers(text);
  
  // Priorité : contrôle > vente > stock > article
  const controlIntent = extractControlIntent(text);
  if (controlIntent && controlIntent.confidence >= 0.8) {
    return {
      success: true,
      intent: controlIntent,
      rawText: text,
      normalizedText,
      numbers
    };
  }
  
  const saleIntent = extractSaleIntent(text);
  if (saleIntent && saleIntent.confidence >= 0.5) {
    return {
      success: true,
      intent: saleIntent,
      rawText: text,
      normalizedText,
      numbers
    };
  }
  
  const stockIntent = extractStockIntent(text);
  if (stockIntent && stockIntent.confidence >= 0.5) {
    return {
      success: true,
      intent: stockIntent,
      rawText: text,
      normalizedText,
      numbers
    };
  }
  
  const articleIntent = extractArticleIntent(text);
  if (articleIntent && articleIntent.confidence >= 0.5) {
    return {
      success: true,
      intent: articleIntent,
      rawText: text,
      normalizedText,
      numbers
    };
  }
  
  // Fallback: si on a un contrôle avec moins de confiance
  if (controlIntent) {
    return {
      success: true,
      intent: controlIntent,
      rawText: text,
      normalizedText,
      numbers
    };
  }
  
  // Fallback: si on a une vente avec moins de confiance
  if (saleIntent) {
    return {
      success: true,
      intent: saleIntent,
      rawText: text,
      normalizedText,
      numbers
    };
  }
  
  return {
    success: false,
    rawText: text,
    normalizedText,
    numbers,
    error: 'Intent non reconnu'
  };
}
