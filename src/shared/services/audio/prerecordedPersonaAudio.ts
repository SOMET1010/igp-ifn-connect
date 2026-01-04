/**
 * Service pour les messages audio pré-enregistrés par persona
 * Utilise les vraies voix clonées (Tantie Sagesse / Gbairai)
 */

import type { PersonaType } from '@/features/auth/config/personas';

// Types de messages disponibles
export type MessageKey = 
  | 'success'
  | 'welcome'
  | 'listen'
  | 'wait'
  | 'confirm'
  | 'error'
  | 'goodbye';

// Mapping des fichiers audio par persona et message
const AUDIO_FILES: Record<PersonaType, Partial<Record<MessageKey, string>>> = {
  tantie: {
    success: '/audio/personas/tantie-sagesse-success.mp3',
  },
  jeune: {
    success: '/audio/personas/gbairai-success.mp3',
  },
};

/**
 * Vérifie si un message pré-enregistré existe pour une persona
 */
export function hasPrerecordedMessage(persona: PersonaType, messageKey: MessageKey): boolean {
  return !!AUDIO_FILES[persona]?.[messageKey];
}

/**
 * Récupère l'URL du fichier audio pré-enregistré
 */
export function getPrerecordedAudioUrl(persona: PersonaType, messageKey: MessageKey): string | null {
  return AUDIO_FILES[persona]?.[messageKey] || null;
}

/**
 * Joue un message audio pré-enregistré
 * Retourne true si le message a été joué, false sinon
 */
export async function playPrerecordedMessage(
  persona: PersonaType,
  messageKey: MessageKey,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }
): Promise<{ success: boolean; audio?: HTMLAudioElement }> {
  const audioUrl = getPrerecordedAudioUrl(persona, messageKey);
  
  if (!audioUrl) {
    console.log(`[PrerecordedAudio] No audio found for ${persona}/${messageKey}`);
    return { success: false };
  }

  try {
    console.log(`[PrerecordedAudio] Playing ${persona}/${messageKey}: ${audioUrl}`);
    
    const audio = new Audio(audioUrl);
    
    audio.onplay = () => {
      options?.onStart?.();
    };
    
    audio.onended = () => {
      options?.onEnd?.();
    };
    
    audio.onerror = () => {
      console.error(`[PrerecordedAudio] Error playing ${audioUrl}`);
      options?.onError?.('Erreur de lecture audio');
    };
    
    await audio.play();
    
    return { success: true, audio };
  } catch (error) {
    console.error('[PrerecordedAudio] Playback failed:', error);
    options?.onError?.('Échec de la lecture audio');
    return { success: false };
  }
}

/**
 * Récupère la liste des messages disponibles pour une persona
 */
export function getAvailableMessages(persona: PersonaType): MessageKey[] {
  return Object.keys(AUDIO_FILES[persona] || {}) as MessageKey[];
}

/**
 * Récupère tous les messages pré-enregistrés disponibles
 */
export function getAllPrerecordedMessages(): Array<{
  persona: PersonaType;
  messageKey: MessageKey;
  audioUrl: string;
}> {
  const messages: Array<{ persona: PersonaType; messageKey: MessageKey; audioUrl: string }> = [];
  
  for (const [persona, files] of Object.entries(AUDIO_FILES)) {
    for (const [key, url] of Object.entries(files)) {
      if (url) {
        messages.push({
          persona: persona as PersonaType,
          messageKey: key as MessageKey,
          audioUrl: url,
        });
      }
    }
  }
  
  return messages;
}
