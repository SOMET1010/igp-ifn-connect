/**
 * Service TTS OpenAI via Lovable AI Gateway
 * Utilise LOVABLE_API_KEY (gratuit, sans clé API utilisateur)
 */

// Voix disponibles OpenAI
export type OpenAIVoice = 'alloy' | 'coral' | 'echo' | 'fable' | 'nova' | 'shimmer';

// Voix par défaut (coral = chaleureuse, conversationnelle)
export const DEFAULT_VOICE: OpenAIVoice = 'coral';

/**
 * Génère un audio TTS via OpenAI edge function
 * @param text - Texte à convertir en audio
 * @param voice - Voix OpenAI (défaut: coral)
 * @returns Blob audio MP3
 */
export async function generateSpeech(
  text: string,
  voice: OpenAIVoice = DEFAULT_VOICE
): Promise<Blob> {
  if (!text || text.trim().length === 0) {
    throw new Error("Le texte est requis pour la synthèse vocale");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Configuration Supabase manquante");
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/openai-tts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        text,
        voice,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur TTS: ${response.status}`);
  }

  const audioBlob = await response.blob();
  
  if (audioBlob.size === 0) {
    throw new Error("Audio vide retourné par OpenAI");
  }

  return audioBlob;
}

/**
 * Formate le texte pour une meilleure prononciation
 * @param text - Texte original
 * @returns Texte formaté
 */
export function formatTextForSpeech(text: string): string {
  // Nettoyer le texte
  let formatted = text
    .replace(/\s+/g, ' ')
    .trim();

  // Ajouter des pauses naturelles
  formatted = formatted
    .replace(/\. /g, '... ')
    .replace(/\? /g, '?... ')
    .replace(/! /g, '!... ');

  return formatted;
}
