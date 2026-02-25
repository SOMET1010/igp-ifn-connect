/**
 * ASSISTANT - Compagnon de marché
 * Rôle : Vente, journée, encouragements
 * 
 * RÈGLE JÙLABA : Une seule voix active par écran
 * ASSISTANT parle sur le dashboard et les écrans de vente
 */

import { LanguageCode } from '@/shared/lib';

export type AssistantScriptKey = 
  // Début de journée
  | 'morning_welcome'
  | 'morning_ready'
  | 'encouragement_start'
  // Ventes
  | 'sale_prompt'
  | 'amount_prompt'
  | 'heard_amount'
  | 'confirm_sale'
  | 'sale_saved'
  | 'encouragement'
  | 'big_sale'
  // Résumés
  | 'midday_summary'
  | 'afternoon_check'
  | 'today_summary'
  // Fin de journée
  | 'end_warning'
  | 'end_summary'
  | 'goodbye';

export interface AssistantScript {
  fr: string;
  dioula?: string;
}

/**
 * Scripts ASSISTANT - Compagnon de marché JÙLABA
 * Ton : Encourageant, chaleureux, positif
 * Principe : Une phrase = Une action
 */
export const ASSISTANT: Record<AssistantScriptKey, AssistantScript> = {
  // DÉBUT DE JOURNÉE
  morning_welcome: {
    fr: "Bonjour ma sœur. Bonne arrivée au marché.",
    dioula: "I ni sogoma. I bɛ sɔrɔ sugu la.",
  },
  morning_ready: {
    fr: "Quand tu es prête, on peut commencer à vendre.",
    dioula: "N'i labɛnna, an bɛ se ka daminɛ ka feere.",
  },
  encouragement_start: {
    fr: "C'est parti pour une bonne journée.",
    dioula: "An bɛ taa tile ɲuman na.",
  },

  // VENTES
  sale_prompt: {
    fr: "Dis-moi ce que le client a acheté.",
    dioula: "Fɔ n ye fɛn min sansan.",
  },
  amount_prompt: {
    fr: "Il a payé combien ?",
    dioula: "A sara joli?",
  },
  heard_amount: {
    fr: "J'ai entendu {amount} francs.",
    dioula: "N ka {amount} faran lamɛn.",
  },
  confirm_sale: {
    fr: "Je note {amount} francs. C'est bon ?",
    dioula: "N bɛ {amount} faran sɛbɛn. A ka ɲi?",
  },
  sale_saved: {
    fr: "C'est enregistré.",
    dioula: "A sɛbɛnna.",
  },
  encouragement: {
    fr: "C'est bien. Continue comme ça.",
    dioula: "A ka ɲi. Taa i ɲɛ.",
  },
  big_sale: {
    fr: "Belle vente ma sœur !",
    dioula: "Feere ɲuman!",
  },

  // RÉSUMÉS
  midday_summary: {
    fr: "Ce matin, tu as encaissé {amount} francs.",
    dioula: "Sɔgɔma in, i ye {amount} faran sɔrɔ.",
  },
  afternoon_check: {
    fr: "Tu veux voir ton argent maintenant ?",
    dioula: "I b'a fɛ ka i ka wari ye sisan?",
  },
  today_summary: {
    fr: "Aujourd'hui, tu as encaissé {amount} francs.",
    dioula: "Bi, i ye {amount} faran sɔrɔ.",
  },

  // FIN DE JOURNÉE
  end_warning: {
    fr: "La journée touche à sa fin.",
    dioula: "Tile bɛ ban.",
  },
  end_summary: {
    fr: "Aujourd'hui, tu as vendu pour {amount} francs.",
    dioula: "Bi, i ye feere kɛ {amount} faran.",
  },
  goodbye: {
    fr: "Bravo ma sœur. Rentre bien. À demain.",
    dioula: "A ni cɛ. Taa ni hɛrɛ ye. An bɛ ɲɔgɔn ye sini.",
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
 * Retourne le script ASSISTANT avec les variables remplacées
 */
export function getAssistantScript(
  key: AssistantScriptKey,
  options: ScriptOptions | LanguageCode = {}
): string {
  const opts: ScriptOptions = typeof options === 'string' 
    ? { language: options as LanguageCode } 
    : options;
  
  const { variables, language = 'fr' } = opts;
  const script = ASSISTANT[key];

  if (!script) {
    console.warn(`[ASSISTANT] Script "${key}" introuvable`);
    return '';
  }

  // Fallback : dioula → fr
  let text = (language === 'dioula' && script.dioula) ? script.dioula : script.fr;

  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(new RegExp(`\\{${varKey}\\}`, 'g'), String(value));
    });
  }

  return text;
}

export default ASSISTANT;
