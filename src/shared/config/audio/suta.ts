/**
 * SUTA - La voix qui rassure et guide
 * Rôle : Connexion, erreurs, navigation
 * 
 * RÈGLE PNAVIM : Une seule voix active par écran
 * SUTA parle uniquement sur les écrans de connexion et d'aide
 */

import { LanguageCode } from '@/lib/translations';

// Alias de compatibilité pour l'ancien type VoiceAuthLang
export type VoiceAuthLang = 'fr' | 'nouchi' | 'suta';

export type SutaScriptKey = 
  | 'welcome'
  | 'listen'
  | 'listening'
  | 'wait'
  | 'confirm'
  | 'success'
  | 'error_noise'
  | 'error_unknown'
  | 'fallback'
  | 'where_you_are'
  | 'what_to_do'
  | 'help'
  | 'generic_error'
  | 'loading'
  | 'repeat';

export interface SutaScript {
  fr: string;
  dioula?: string;
}

/**
 * Scripts SUTA - Guide principal PNAVIM
 * Ton : Calme, rassurant, jamais pressant
 * Principe : Une phrase = Une action
 */
export const SUTA: Record<SutaScriptKey, SutaScript> = {
  // ACCUEIL / CONNEXION
  welcome: {
    fr: "Ma sœur, bienvenue. Appuie sur le micro et parle doucement.",
    dioula: "N bɛ i dɛmɛ. Digi mikro la, kuma cɛ.",
  },
  listen: {
    fr: "Dis ton numéro de téléphone tranquillement.",
    dioula: "Fɔ i ka nimɔrɔ cɛ.",
  },
  listening: {
    fr: "Je t'écoute.",
    dioula: "N bɛ i lamɛn.",
  },
  wait: {
    fr: "Un instant, je vérifie.",
    dioula: "Maa dɔɔni, n bɛ filɛ.",
  },
  confirm: {
    fr: "J'ai entendu {phone}. Est-ce que c'est bien ton numéro ? Dis OUI ou NON.",
    dioula: "N ka a lamɛn {phone}. A ye tuma? Fɔ AWÔ walima AYI.",
  },
  success: {
    fr: "C'est bon. Tu es connectée. On continue ensemble.",
    dioula: "A ka kɛ. I bɛ kɔnɔ. An bɛ taa ɲɔgɔn fɛ.",
  },
  error_noise: {
    fr: "Il y avait trop de bruit. Ce n'est pas grave. On recommence.",
    dioula: "Mankan tun ka ca. A tɛ foyi. An bɛ segin.",
  },
  error_unknown: {
    fr: "Je n'ai pas pu te reconnaître. On va réessayer calmement.",
    dioula: "N ma se ka i dɔn. An bɛ segin ka kɛ.",
  },
  fallback: {
    fr: "Si tu préfères, tu peux aussi utiliser le clavier.",
    dioula: "I bɛ se ka klavye kɛ.",
  },

  // NAVIGATION / AIDE
  where_you_are: {
    fr: "Tu es sur ton espace marchand.",
    dioula: "I bɛ i ka feere yɔrɔ la.",
  },
  what_to_do: {
    fr: "Dis-moi ce que tu veux faire.",
    dioula: "Fɔ n ye i b'a fɛ ka mun kɛ.",
  },
  help: {
    fr: "Si tu es perdue, appuie sur aide ou appelle ton agent.",
    dioula: "N'i tɛ dɔn, digi dɛmɛ walima wele i ka agent.",
  },

  // ERREURS GÉNÉRALES
  generic_error: {
    fr: "Ce n'est pas grave. On va reprendre ensemble.",
    dioula: "A tɛ foyi. An bɛ segin ka kɛ ɲɔgɔn fɛ.",
  },
  loading: {
    fr: "Un instant, je regarde.",
    dioula: "Maa dɔɔni, n bɛ filɛ.",
  },
  repeat: {
    fr: "Appuie sur le micro et parle pour te connecter.",
    dioula: "Digi mikro la ka kuma walasa ka i sigi.",
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
 * Retourne le script SUTA avec les variables remplacées
 */
export function getSutaScript(
  key: SutaScriptKey,
  options: ScriptOptions | LanguageCode = {}
): string {
  const opts: ScriptOptions = typeof options === 'string' 
    ? { language: options as LanguageCode } 
    : options;
  
  const { variables, language = 'fr' } = opts;
  const script = SUTA[key];

  if (!script) {
    console.warn(`[SUTA] Script "${key}" introuvable`);
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

// Alias de compatibilité pour les anciens scripts
export type VoiceScriptKey = SutaScriptKey;
export const VOICE_SCRIPTS = SUTA;
export const getVoiceScript = (lang: VoiceAuthLang, key: SutaScriptKey, variables?: Record<string, string>): string => {
  return getSutaScript(key, { language: lang === 'suta' ? 'fr' : lang as LanguageCode, variables });
};

/**
 * Format phone number for voice output (spoken naturally)
 */
export function formatPhoneForSpeech(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  return clean.replace(/(.{2})(?=.)/g, '$1 ');
}

export default SUTA;
