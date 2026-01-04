/**
 * Service TTS ElevenLabs avec voix PNAVIM custom
 * Appelle l'edge function elevenlabs-tts (ne jamais exposer l'API key côté client)
 */

import { PNAVIM_VOICES, type PnavimVoiceId } from '@/shared/config/voiceConfig';

// Configuration par défaut
const DEFAULT_MODEL = "eleven_multilingual_v2";

interface ElevenLabsTtsOptions {
  voiceId?: string;
  modelId?: string;
}

/**
 * Génère un audio TTS via ElevenLabs edge function
 * @param text - Texte à convertir en audio
 * @param options - Options optionnelles (voiceId, modelId)
 * @returns Blob audio MP3
 */
export async function generateSpeech(
  text: string,
  options: ElevenLabsTtsOptions = {}
): Promise<Blob> {
  const { voiceId = PNAVIM_VOICES.DEFAULT, modelId = DEFAULT_MODEL } = options;

  if (!text || text.trim().length === 0) {
    throw new Error("Le texte est requis pour la synthèse vocale");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Configuration Supabase manquante");
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/elevenlabs-tts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        text,
        voiceId,
        modelId,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur TTS: ${response.status}`);
  }

  const audioBlob = await response.blob();
  
  if (audioBlob.size === 0) {
    throw new Error("Audio vide retourné par ElevenLabs");
  }

  return audioBlob;
}

/**
 * Formate le texte pour une meilleure prononciation avec accent ivoirien
 * @param text - Texte original
 * @param localStyle - Ajouter des interjections locales (optionnel)
 * @returns Texte formaté
 */
export function formatTextForIvorianVoice(text: string, localStyle = false): string {
  // Nettoyer le texte
  let formatted = text
    .replace(/\s+/g, ' ')
    .trim();

  // Ajouter des pauses naturelles
  formatted = formatted
    .replace(/\. /g, '... ')
    .replace(/\? /g, '?... ')
    .replace(/! /g, '!... ');

  // Style local optionnel (interjections ivoiriennes)
  if (localStyle) {
    // Ajouter des expressions locales légères au début/fin si approprié
    // (À personnaliser selon le contexte)
  }

  return formatted;
}

// Re-export pour compatibilité
export { PNAVIM_VOICES };
