/**
 * Scripts vocaux pour la dictée guidée de numéro de téléphone
 * 
 * Mode recommandé: "par deux chiffres" (07-08-12-34-56)
 * Le système répète et affiche après chaque saisie
 */

export const PHONE_SCRIPTS = {
  // Démarrage
  start_single: "Ma sœur, donne-moi ton numéro, chiffre par chiffre. Commence !",
  start_pairs: "Mon frère, donne-moi ton numéro, deux chiffres à la fois. Dis par exemple : zéro sept.",
  
  // Feedback après saisie
  received_single: "J'ai noté {digit}. Continue.",
  received_pair: "J'ai noté {pair}. Continue.",
  received_invalid: "J'ai pas compris. Répète les chiffres.",
  
  // Progression
  progress: "Tu as dit {digits}. Il manque {remaining} chiffres.",
  almost_done: "Encore {remaining} chiffres et c'est bon !",
  
  // Confirmation finale
  complete: "C'est bon, j'ai ton numéro : {phone}. On vérifie ?",
  confirm_yes: "Parfait ! Je lance la vérification.",
  confirm_no: "D'accord, on recommence. Dis ton numéro.",
  
  // Erreurs et corrections
  not_understood: "J'ai pas bien compris. Répète doucement.",
  correction_prompt: "Tu veux corriger ? Dis 'corrige' ou 'efface'.",
  cleared: "J'ai tout effacé. On recommence.",
  deleted_last: "J'ai effacé les deux derniers chiffres.",
  
  // Fallback
  fallback_keyboard: "Pas de souci, utilise le clavier à l'écran.",
  
  // Commandes reconnues
  commands: {
    repeat: ['répète', 'redis', 'redit', 'quoi', 'pardon'],
    correct: ['corrige', 'correction', 'erreur', 'faux'],
    clear: ['efface', 'recommence', 'annule', 'efface tout'],
    stop: ['stop', 'arrête', 'clavier', 'tape'],
    confirm_yes: ['oui', 'c\'est ça', 'valide', 'ok', 'correct', 'bon'],
    confirm_no: ['non', 'faux', 'erreur', 'pas ça'],
  },
} as const;

export type PhoneScriptKey = keyof typeof PHONE_SCRIPTS;

/**
 * Obtenir un script avec variables interpolées
 */
export function getPhoneScript(
  key: Exclude<PhoneScriptKey, 'commands'>,
  variables?: Record<string, string | number>
): string {
  const scriptValue = PHONE_SCRIPTS[key];
  
  if (typeof scriptValue !== 'string') {
    return '';
  }
  
  let result: string = scriptValue;
  
  if (variables) {
    Object.entries(variables).forEach(([varName, value]) => {
      result = result.replace(`{${varName}}`, String(value));
    });
  }
  
  return result;
}

/**
 * Vérifier si une phrase correspond à une commande
 */
export function matchCommand(
  text: string,
  commandType: keyof typeof PHONE_SCRIPTS.commands
): boolean {
  const normalizedText = text.toLowerCase().trim();
  const patterns = PHONE_SCRIPTS.commands[commandType];
  
  return patterns.some(pattern => normalizedText.includes(pattern));
}

/**
 * Formater un numéro pour la lecture vocale: "0708" → "zéro sept zéro huit"
 */
export function phoneToSpeech(digits: string): string {
  const digitWords: Record<string, string> = {
    '0': 'zéro',
    '1': 'un',
    '2': 'deux',
    '3': 'trois',
    '4': 'quatre',
    '5': 'cinq',
    '6': 'six',
    '7': 'sept',
    '8': 'huit',
    '9': 'neuf',
  };
  
  return digits
    .split('')
    .map(d => digitWords[d] || d)
    .join(' ');
}
