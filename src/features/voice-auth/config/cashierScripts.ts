/**
 * Scripts vocaux SUTA - Écran Encaissement
 * Français Ivoirien courant : chaleureux, accessible, respectueux
 */

// Import global LanguageCode from translations
import { LanguageCode } from '@/lib/translations';

export type CashierScriptKey = 
  | 'cashier_welcome'
  | 'cashier_listening'
  | 'cashier_digit_0'
  | 'cashier_digit_1'
  | 'cashier_digit_2'
  | 'cashier_digit_3'
  | 'cashier_digit_4'
  | 'cashier_digit_5'
  | 'cashier_digit_6'
  | 'cashier_digit_7'
  | 'cashier_digit_8'
  | 'cashier_digit_9'
  | 'cashier_digit_00'
  | 'cashier_cleared'
  | 'cashier_bill_500'
  | 'cashier_bill_1000'
  | 'cashier_bill_2000'
  | 'cashier_bill_5000'
  | 'cashier_bill_10000'
  | 'cashier_coin_25'
  | 'cashier_coin_50'
  | 'cashier_coin_100'
  | 'cashier_coin_200'
  | 'cashier_cash'
  | 'cashier_mobile'
  | 'cashier_minimum'
  | 'cashier_confirm'
  | 'cashier_success'
  | 'cashier_error'
  | 'cashier_amount_zero'
  | 'cashier_product_added'
  | 'cashier_change';

export interface CashierAudioScript {
  key: string;
  fr: string;       // Français Ivoirien courant
  dioula?: string;  // Dioula véhiculaire
  nouchi?: string;  // Français Ivoirien populaire (accessible, pas argot)
}

/**
 * Scripts en Français Ivoirien - ton chaleureux et accessible
 */
export const cashierScripts: Record<CashierScriptKey, CashierAudioScript> = {
  // Accueil et navigation
  cashier_welcome: {
    key: 'cashier_welcome',
    fr: 'Dis le montant ou bien appuie sur un billet.',
    dioula: 'Wari joli bɛ se? Billet dɔ bila.',
    nouchi: 'Dis le montant ou bien appuie sur un billet.',
  },
  cashier_listening: {
    key: 'cashier_listening',
    fr: "Je t'écoute. C'est combien ?",
    dioula: 'N bɛ i lamɛn. Wari joli?',
    nouchi: "Je t'écoute. C'est combien ?",
  },

  // Chiffres
  cashier_digit_0: { key: 'cashier_digit_0', fr: 'Zéro.', dioula: 'Fuu.', nouchi: 'Zéro.' },
  cashier_digit_1: { key: 'cashier_digit_1', fr: 'Un.', dioula: 'Kelen.', nouchi: 'Un.' },
  cashier_digit_2: { key: 'cashier_digit_2', fr: 'Deux.', dioula: 'Fila.', nouchi: 'Deux.' },
  cashier_digit_3: { key: 'cashier_digit_3', fr: 'Trois.', dioula: 'Saba.', nouchi: 'Trois.' },
  cashier_digit_4: { key: 'cashier_digit_4', fr: 'Quatre.', dioula: 'Naani.', nouchi: 'Quatre.' },
  cashier_digit_5: { key: 'cashier_digit_5', fr: 'Cinq.', dioula: 'Duuru.', nouchi: 'Cinq.' },
  cashier_digit_6: { key: 'cashier_digit_6', fr: 'Six.', dioula: 'Wɔɔrɔ.', nouchi: 'Six.' },
  cashier_digit_7: { key: 'cashier_digit_7', fr: 'Sept.', dioula: 'Wolonwula.', nouchi: 'Sept.' },
  cashier_digit_8: { key: 'cashier_digit_8', fr: 'Huit.', dioula: 'Seegi.', nouchi: 'Huit.' },
  cashier_digit_9: { key: 'cashier_digit_9', fr: 'Neuf.', dioula: 'Kɔnɔntɔn.', nouchi: 'Neuf.' },
  cashier_digit_00: { key: 'cashier_digit_00', fr: 'Double zéro.', dioula: 'Fuu fila.', nouchi: 'Double zéro.' },

  // Actions
  cashier_cleared: {
    key: 'cashier_cleared',
    fr: "C'est effacé.",
    dioula: 'A bɔra.',
    nouchi: "C'est effacé.",
  },

  // Billets - naturels et clairs
  cashier_bill_500: {
    key: 'cashier_bill_500',
    fr: 'Cinq cents francs.',
    dioula: 'Wari keme duuru.',
    nouchi: 'Cinq cents francs.',
  },
  cashier_bill_1000: {
    key: 'cashier_bill_1000',
    fr: 'Mille francs.',
    dioula: 'Wari ba kelen.',
    nouchi: 'Mille francs.',
  },
  cashier_bill_2000: {
    key: 'cashier_bill_2000',
    fr: 'Deux mille francs.',
    dioula: 'Wari ba fila.',
    nouchi: 'Deux mille francs.',
  },
  cashier_bill_5000: {
    key: 'cashier_bill_5000',
    fr: 'Cinq mille francs.',
    dioula: 'Wari ba duuru.',
    nouchi: 'Cinq mille francs.',
  },
  cashier_bill_10000: {
    key: 'cashier_bill_10000',
    fr: 'Dix mille francs.',
    dioula: 'Wari ba tan.',
    nouchi: 'Dix mille francs.',
  },

  // Pièces
  cashier_coin_25: {
    key: 'cashier_coin_25',
    fr: 'Vingt-cinq francs.',
    dioula: 'Mugan ni duuru.',
    nouchi: 'Vingt-cinq francs.',
  },
  cashier_coin_50: {
    key: 'cashier_coin_50',
    fr: 'Cinquante francs.',
    dioula: 'Bi duuru.',
    nouchi: 'Cinquante francs.',
  },
  cashier_coin_100: {
    key: 'cashier_coin_100',
    fr: 'Cent francs.',
    dioula: 'Keme kelen.',
    nouchi: 'Cent francs.',
  },
  cashier_coin_200: {
    key: 'cashier_coin_200',
    fr: 'Deux cents francs.',
    dioula: 'Keme fila.',
    nouchi: 'Deux cents francs.',
  },

  // Méthodes de paiement
  cashier_cash: {
    key: 'cashier_cash',
    fr: "C'est en espèces.",
    dioula: 'Sara ni wari ye.',
    nouchi: "C'est en espèces.",
  },
  cashier_mobile: {
    key: 'cashier_mobile',
    fr: "C'est Mobile Money.",
    dioula: 'Sara ni telefɔni ye.',
    nouchi: "C'est Mobile Money.",
  },

  // Validation
  cashier_minimum: {
    key: 'cashier_minimum',
    fr: 'Il faut au moins cent francs.',
    dioula: 'A fitinin ye keme kelen ye.',
    nouchi: 'Il faut au moins cent francs.',
  },
  cashier_confirm: {
    key: 'cashier_confirm',
    fr: 'On confirme ?',
    dioula: 'Sara labɛn.',
    nouchi: 'On confirme ?',
  },

  // Nouveaux scripts contextuels
  cashier_success: {
    key: 'cashier_success',
    fr: "C'est bon ! Le paiement est fait.",
    dioula: 'A bɛnnin! Sara kɛra.',
    nouchi: "C'est bon ! Le paiement est fait.",
  },
  cashier_error: {
    key: 'cashier_error',
    fr: "Y'a un souci. Essaie encore.",
    dioula: 'Fɛn dɔ ma ɲi. A segin.',
    nouchi: "Y'a un souci. Essaie encore.",
  },
  cashier_amount_zero: {
    key: 'cashier_amount_zero',
    fr: "Mets d'abord le montant.",
    dioula: 'Wari hakɛ dɔn fɔlɔ.',
    nouchi: "Mets d'abord le montant.",
  },
  cashier_product_added: {
    key: 'cashier_product_added',
    fr: '{name} ajouté. Total : {total} francs.',
    dioula: '{name} farala. Bɛɛ lajɛlen: {total}.',
    nouchi: '{name} ajouté. Total : {total} francs.',
  },
  cashier_change: {
    key: 'cashier_change',
    fr: 'Tu rends {amount} francs.',
    dioula: 'I bɛ {amount} segin.',
    nouchi: 'Tu rends {amount} francs.',
  },
};

// Mapping chiffre -> clé audio
export const digitToScriptKey: Record<string, CashierScriptKey> = {
  '0': 'cashier_digit_0',
  '1': 'cashier_digit_1',
  '2': 'cashier_digit_2',
  '3': 'cashier_digit_3',
  '4': 'cashier_digit_4',
  '5': 'cashier_digit_5',
  '6': 'cashier_digit_6',
  '7': 'cashier_digit_7',
  '8': 'cashier_digit_8',
  '9': 'cashier_digit_9',
  '00': 'cashier_digit_00',
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
export function getCashierScript(
  key: CashierScriptKey,
  options: ScriptOptions | LanguageCode = {}
): string {
  // Support legacy API (string language) pour compatibilité
  const opts: ScriptOptions = typeof options === 'string' 
    ? { language: options as LanguageCode } 
    : options;
  
  const { variables, language = 'fr' } = opts;
  const scriptObj = cashierScripts[key];

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
