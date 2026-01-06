/**
 * Scripts vocaux SUTA pour la gestion du stock marchand
 * Français Ivoirien courant : chaleureux, accessible, respectueux
 */

// Import global LanguageCode from translations
import { LanguageCode } from '@/shared/lib';

export interface StockAudioScript {
  key: string;
  fr: string;       // Français Ivoirien courant
  dioula?: string;  // Dioula véhiculaire
  nouchi?: string;  // Français Ivoirien populaire (accessible, pas argot)
}

export const stockScripts: Record<string, StockAudioScript> = {
  // --- ACCUEIL & NAVIGATION ---
  stock_welcome: {
    key: 'stock_welcome',
    fr: 'Voici tes marchandises. Appuie sur un produit pour modifier.',
    dioula: 'I ka stock ye nin ye. Produit dɔ kɔ don ka a changé.',
    nouchi: 'Voici tes marchandises. Appuie sur un produit pour modifier.',
  },
  stock_empty: {
    key: 'stock_empty',
    fr: 'Ton stock est vide. Appuie sur le plus pour ajouter.',
    dioula: 'I ka stock ye bagan ye. Plus kɔ don ka fara kan.',
    nouchi: 'Ton stock est vide. Appuie sur le plus pour ajouter.',
  },
  stock_count: {
    key: 'stock_count',
    fr: 'Tu as {count} produits au total.',
    dioula: 'Produit {count} bɛ i ka stock kɔnɔ.',
    nouchi: 'Tu as {count} produits au total.',
  },

  // --- ALERTES (Urgence et Action) ---
  stock_alert_out: {
    key: 'stock_alert_out',
    fr: "Attention ! {count} produit fini. Y'a plus rien !",
    dioula: 'Kɛlɛ! Produit {count} banna!',
    nouchi: "Attention ! {count} produit fini. Y'a plus rien !",
  },
  stock_alert_low: {
    key: 'stock_alert_low',
    fr: 'Attention, {count} produit va bientôt finir. Pense à compléter.',
    dioula: 'Produit {count} ka stock ye dɔgɔ ye. A miiri ka stock dɔ fara kan.',
    nouchi: 'Attention, {count} produit va bientôt finir. Pense à compléter.',
  },
  stock_all_ok: {
    key: 'stock_all_ok',
    fr: 'Tout est bon ! Ton stock est complet.',
    dioula: 'A ka di! I ka produit bɛɛ bɛ stock kɔnɔ.',
    nouchi: 'Tout est bon ! Ton stock est complet.',
  },

  // --- ACTIONS (Verbes d'action directs) ---
  stock_add: {
    key: 'stock_add',
    fr: 'Ajouter un nouveau produit.',
    dioula: 'Produit kura dɔ fara stock kan.',
    nouchi: 'Ajouter un nouveau produit.',
  },
  stock_restock: {
    key: 'stock_restock',
    fr: 'Tu veux ajouter combien ?',
    dioula: 'I bɛ joli fara kan?',
    nouchi: 'Tu veux ajouter combien ?',
  },
  stock_edit: {
    key: 'stock_edit',
    fr: 'Modifier la quantité.',
    dioula: 'Quantité changé.',
    nouchi: 'Modifier la quantité.',
  },
  stock_delete: {
    key: 'stock_delete',
    fr: 'Tu veux vraiment enlever ce produit ?',
    dioula: 'I bɛ fɛ ka nin produit bɔ tiɛn?',
    nouchi: 'Tu veux vraiment enlever ce produit ?',
  },
  stock_saved: {
    key: 'stock_saved',
    fr: "C'est noté !",
    dioula: 'A sɛbɛnna!',
    nouchi: "C'est noté !",
  },
  stock_deleted: {
    key: 'stock_deleted',
    fr: 'Produit enlevé.',
    dioula: 'Produit bɔra.',
    nouchi: 'Produit enlevé.',
  },

  // --- FILTRES (Catégorisation simple) ---
  stock_filter_all: {
    key: 'stock_filter_all',
    fr: 'Tout voir.',
    dioula: 'Produit bɛɛ.',
    nouchi: 'Tout voir.',
  },
  stock_filter_out: {
    key: 'stock_filter_out',
    fr: 'Ce qui est fini.',
    dioula: 'Produit minnu banna.',
    nouchi: 'Ce qui est fini.',
  },
  stock_filter_low: {
    key: 'stock_filter_low',
    fr: 'Ce qui va bientôt finir.',
    dioula: 'Produit minnu ka stock ye dɔgɔ ye.',
    nouchi: 'Ce qui va bientôt finir.',
  },
  stock_filter_ok: {
    key: 'stock_filter_ok',
    fr: 'Produits en stock.',
    dioula: 'Produit minnu bɛ stock kɔnɔ.',
    nouchi: 'Produits en stock.',
  },

  // --- QUANTITÉS RAPIDES ---
  stock_add_five: {
    key: 'stock_add_five',
    fr: 'Plus cinq.',
    dioula: 'Fara duuru kan.',
    nouchi: 'Plus cinq.',
  },
  stock_add_ten: {
    key: 'stock_add_ten',
    fr: 'Plus dix.',
    dioula: 'Fara tan kan.',
    nouchi: 'Plus dix.',
  },
  stock_add_twenty: {
    key: 'stock_add_twenty',
    fr: 'Plus vingt.',
    dioula: 'Fara mugan kan.',
    nouchi: 'Plus vingt.',
  },

  // --- PRODUIT INDIVIDUEL ---
  stock_product_info: {
    key: 'stock_product_info',
    fr: '{name}. Il reste {quantity} {unit}.',
    dioula: '{name}. {quantity} {unit} bɛ stock kɔnɔ.',
    nouchi: '{name}. Il reste {quantity} {unit}.',
  },
};

/**
 * Options pour la génération du script
 */
interface ScriptOptions {
  variables?: Record<string, string | number>;
  language?: LanguageCode;
}

/**
 * Retourne le script audio avec les variables remplacées.
 * API unifiée avec options object.
 */
export function getStockScript(
  key: string,
  options: ScriptOptions = {}
): string {
  const { variables, language = 'fr' } = options;
  const scriptObj = stockScripts[key];

  if (!scriptObj) {
    console.warn(`[SUTA Audio] Script "${key}" introuvable`);
    return '';
  }

  // Fallback langue : nouchi → fr → string vide
  let text = scriptObj[language] || scriptObj.fr || '';

  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(value));
    });
  }

  return text;
}
