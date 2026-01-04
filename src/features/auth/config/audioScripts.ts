/**
 * Voice Auth Audio Scripts - Multi-language support
 * Ton SUTA bienveillant + Nouchi "Grand Frère"
 */

export type VoiceAuthLang = 'fr' | 'nouchi' | 'suta';

export type VoiceScriptKey = 
  | 'welcome'
  | 'listen'
  | 'wait'
  | 'confirm'
  | 'success'
  | 'error_noise'
  | 'error_unknown'
  | 'fallback_hint'
  | 'repeat';

export interface VoiceScripts {
  [key: string]: Record<VoiceScriptKey, string>;
}

/**
 * Scripts vocaux trilingues FR / Nouchi / SUTA
 * SUTA = voix formelle bienveillante (par défaut)
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
    repeat: "Appuyez sur le micro et parlez pour vous connecter.",
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
    repeat: "Appuie sur le micro et parle pour te connecter.",
  },
  suta: {
    welcome: "Bonjour ! Bienvenue sur l'espace des marchands. Pour te connecter, appuie sur le micro et parle tranquillement. Je suis là pour t'aider.",
    listen: "Très bien. Dis ton numéro de téléphone. Parle doucement.",
    wait: "J'ai compris. Un instant...",
    confirm: "J'ai compris {phone}. Est-ce que c'est correct ? Dis OUI ou dis NON.",
    success: "C'est bon ! Tu es connecté. Bienvenue.",
    error_noise: "Ce n'est pas grave. On recommence ensemble. Appuie encore et parle.",
    error_unknown: "Désolé. Je n'ai pas pu te connecter. On va réessayer.",
    fallback_hint: "Tu peux aussi écrire ton numéro si tu préfères.",
    repeat: "Appuie sur le micro et parle pour te connecter.",
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
  const script = VOICE_SCRIPTS[lang]?.[key] || VOICE_SCRIPTS.suta[key];
  
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
