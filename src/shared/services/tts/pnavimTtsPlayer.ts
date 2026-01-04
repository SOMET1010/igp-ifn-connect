/**
 * Lecteur TTS PNAVIM (singleton)
 * - Utilise uniquement ElevenLabs via generateSpeech
 * - Stoppe automatiquement l'audio en cours avant de rejouer
 */

import { generateSpeech } from '@/shared/services/tts/elevenlabsTts';
import { PNAVIM_VOICES } from '@/shared/config/voiceConfig';

let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

export function stopPnavimTts(): void {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
  } finally {
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      currentAudioUrl = null;
    }
  }
}

export async function playPnavimTts(
  text: string,
  options: { voiceId?: string } = {}
): Promise<void> {
  const trimmed = text?.trim();
  if (!trimmed) return;

  const voiceId = options.voiceId ?? PNAVIM_VOICES.DEFAULT;

  stopPnavimTts();

  const audioBlob = await generateSpeech(trimmed, { voiceId });
  const audioUrl = URL.createObjectURL(audioBlob);
  currentAudioUrl = audioUrl;

  const audio = new Audio(audioUrl);
  currentAudio = audio;

  const cleanup = () => {
    stopPnavimTts();
  };

  audio.onended = cleanup;
  audio.onerror = cleanup;

  await audio.play();
}
