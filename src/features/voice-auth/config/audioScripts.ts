/**
 * Voice Auth Audio Scripts - Multi-language support
 * Ton "Grand Frère" rassurant pour les marchands ivoiriens
 */

export type VoiceAuthLang = 'fr' | 'nouchi';

export type VoiceScriptKey = 
  | 'welcome'
  | 'listen'
  | 'wait'
  | 'confirm'
  | 'success'
  | 'error_noise'
  | 'error_unknown'
  | 'fallback_hint';

export interface VoiceScripts {
  [key: string]: Record<VoiceScriptKey, string>;
}

/**
 * Scripts vocaux bilingues FR / Nouchi
 * Nouchi = français ivoirien "soft" (ton Grand Frère)
 */
export const VOICE_SCRIPTS: VoiceScripts = {
  fr: {
    welcome: "Bienvenue ! Appuyez sur le bouton orange et parlez pour vous connecter.",
    listen: "C'est parti ! Dites votre numéro de téléphone.",
    wait: "Un instant, nous vérifions votre numéro...",
    confirm: "J'ai compris {phone}. Est-ce correct ? Dites OUI ou NON.",
    success: "Parfait ! Vous êtes connecté.",
    error_noise: "Je n'ai pas bien entendu. Veuillez répéter dans un endroit plus calme.",
    error_unknown: "Ce numéro n'est pas enregistré. Voulez-vous créer un compte ?",
    fallback_hint: "Vous pouvez aussi écrire votre numéro ci-dessous.",
  },
  nouchi: {
    welcome: "Salut la famille ! Pour rentrer dans ton coin, appuie sur le bouton orange là, et puis tu parles.",
    listen: "Vas-y, on t'écoute. Donne ton numéro de téléphone chap-chap.",
    wait: "Attends un peu, on regarde si c'est bon...",
    confirm: "J'ai entendu {phone}. C'est le bon way ? Dis OUI ou bien NON.",
    success: "C'est validé ! Tu es en place.",
    error_noise: "Y'a trop de bruit, on n'a pas entendu. Pardon, faut reprendre.",
    error_unknown: "Ah, on connait pas ce numéro là. Tu veux créer ton compte ou bien ?",
    fallback_hint: "Si tu veux, tu peux aussi écrire ton numéro en bas là.",
  },
};

/**
 * Get a script with variable interpolation
 * @param lang Language code
 * @param key Script key
 * @param variables Variables to interpolate (e.g., {phone: '0701020304'})
 */
export function getVoiceScript(
  lang: VoiceAuthLang, 
  key: VoiceScriptKey, 
  variables?: Record<string, string>
): string {
  const script = VOICE_SCRIPTS[lang]?.[key] || VOICE_SCRIPTS.fr[key];
  
  if (!variables) return script;
  
  return Object.entries(variables).reduce(
    (text, [varKey, value]) => text.replace(`{${varKey}}`, value),
    script
  );
}

/**
 * Format phone number for voice output (spoken naturally)
 * @param phone Raw phone number (e.g., "0701020304")
 * @returns Formatted for speech (e.g., "07 01 02 03 04")
 */
export function formatPhoneForSpeech(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  return clean.replace(/(.{2})(?=.)/g, '$1 ');
}

export default VOICE_SCRIPTS;
