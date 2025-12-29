// ============================================
// Scripts vocaux SUTA - Écran Encaissement
// ============================================

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
  | 'cashier_confirm';

// Scripts en français (par défaut)
export const cashierScriptsFr: Record<CashierScriptKey, string> = {
  cashier_welcome: "Dis le montant ou appuie sur un billet.",
  cashier_listening: "J'écoute. Dis le montant.",
  cashier_digit_0: "Zéro.",
  cashier_digit_1: "Un.",
  cashier_digit_2: "Deux.",
  cashier_digit_3: "Trois.",
  cashier_digit_4: "Quatre.",
  cashier_digit_5: "Cinq.",
  cashier_digit_6: "Six.",
  cashier_digit_7: "Sept.",
  cashier_digit_8: "Huit.",
  cashier_digit_9: "Neuf.",
  cashier_digit_00: "Double zéro.",
  cashier_cleared: "Effacé.",
  cashier_bill_500: "Cinq cents francs.",
  cashier_bill_1000: "Mille francs.",
  cashier_bill_2000: "Deux mille francs.",
  cashier_bill_5000: "Cinq mille francs.",
  cashier_bill_10000: "Dix mille francs.",
  cashier_coin_25: "Vingt-cinq francs.",
  cashier_coin_50: "Cinquante francs.",
  cashier_coin_100: "Cent francs.",
  cashier_coin_200: "Deux cents francs.",
  cashier_cash: "Paiement en espèces.",
  cashier_mobile: "Paiement par téléphone.",
  cashier_minimum: "Le montant minimum est cent francs.",
  cashier_confirm: "Confirmer le paiement.",
};

// Scripts en Dioula
export const cashierScriptsDioula: Record<CashierScriptKey, string> = {
  cashier_welcome: "Wari joli bɛ se? Billet dɔ bila.",
  cashier_listening: "N bɛ i lamɛn. Wari joli?",
  cashier_digit_0: "Fuu.",
  cashier_digit_1: "Kelen.",
  cashier_digit_2: "Fila.",
  cashier_digit_3: "Saba.",
  cashier_digit_4: "Naani.",
  cashier_digit_5: "Duuru.",
  cashier_digit_6: "Wɔɔrɔ.",
  cashier_digit_7: "Wolonwula.",
  cashier_digit_8: "Seegi.",
  cashier_digit_9: "Kɔnɔntɔn.",
  cashier_digit_00: "Fuu fila.",
  cashier_cleared: "A bɔra.",
  cashier_bill_500: "Wari keme duuru.",
  cashier_bill_1000: "Wari ba kelen.",
  cashier_bill_2000: "Wari ba fila.",
  cashier_bill_5000: "Wari ba duuru.",
  cashier_bill_10000: "Wari ba tan.",
  cashier_coin_25: "Mugan ni duuru.",
  cashier_coin_50: "Bi duuru.",
  cashier_coin_100: "Keme kelen.",
  cashier_coin_200: "Keme fila.",
  cashier_cash: "Sara ni wari ye.",
  cashier_mobile: "Sara ni telefɔni ye.",
  cashier_minimum: "A fitinin ye keme kelen ye.",
  cashier_confirm: "Sara labɛn.",
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

// Helper pour obtenir le script selon la langue
export function getCashierScript(key: CashierScriptKey, language: string): string {
  if (language === 'dioula') {
    return cashierScriptsDioula[key];
  }
  return cashierScriptsFr[key];
}
