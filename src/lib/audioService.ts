import { LanguageCode } from '@/lib/translations';
import { supabase } from '@/integrations/supabase/client';

// Liste des clés audio disponibles
export const AUDIO_KEYS = [
  'welcome',
  'payment_success',
  'audio_dashboard',
  'audio_cashier_input',
  'audio_cashier_confirm',
  'audio_cashier_success',
  'offline_notice',
  'audio_play',
  'login_intro',
  'otp_instruction',
] as const;

export type AudioKey = typeof AUDIO_KEYS[number];

// Cache pour les URLs des fichiers audio (local + Supabase)
const audioUrlCache = new Map<string, string | null>();

/**
 * Récupère l'URL d'un fichier audio (local ou Supabase)
 * Priorité: 1. Fichier local public/audio/ 2. Supabase Storage
 */
async function getAudioUrl(key: string, lang: LanguageCode): Promise<string | null> {
  const cacheKey = `${lang}/${key}`;
  
  if (audioUrlCache.has(cacheKey)) {
    return audioUrlCache.get(cacheKey) || null;
  }

  // 1. Essayer le fichier local d'abord
  const localPath = `/audio/${lang}/${key}.mp3`;
  try {
    const response = await fetch(localPath, { method: 'HEAD' });
    if (response.ok) {
      audioUrlCache.set(cacheKey, localPath);
      return localPath;
    }
  } catch {
    // Continue to check Supabase
  }

  // 2. Essayer Supabase Storage
  try {
    const { data } = await supabase
      .from('audio_recordings')
      .select('file_path')
      .eq('audio_key', key)
      .eq('language_code', lang)
      .maybeSingle();

    if (data?.file_path) {
      audioUrlCache.set(cacheKey, data.file_path);
      return data.file_path;
    }
  } catch {
    // No recording found
  }

  audioUrlCache.set(cacheKey, null);
  return null;
}

/**
 * Vérifie si un fichier audio existe pour une clé et une langue données
 */
export async function checkAudioExists(key: string, lang: LanguageCode): Promise<boolean> {
  const url = await getAudioUrl(key, lang);
  return url !== null;
}

/**
 * Joue un fichier audio pré-enregistré (local ou Supabase)
 * Retourne true si la lecture a réussi, false sinon (permettant le fallback TTS)
 */
export async function playPrerecordedAudio(
  key: string, 
  lang: LanguageCode
): Promise<{ success: boolean; audio?: HTMLAudioElement }> {
  let audioUrl = await getAudioUrl(key, lang);
  
  // Fallback to French if not found
  if (!audioUrl && lang !== 'fr') {
    audioUrl = await getAudioUrl(key, 'fr');
  }

  if (!audioUrl) {
    return { success: false };
  }

  try {
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve) => {
      audio.oncanplaythrough = () => {
        audio.play()
          .then(() => {
            if (navigator.vibrate) navigator.vibrate(30);
            resolve({ success: true, audio });
          })
          .catch(() => resolve({ success: false }));
      };
      
      audio.onerror = () => resolve({ success: false });
      
      // Timeout pour éviter les blocages
      setTimeout(() => resolve({ success: false }), 3000);
    });
  } catch {
    return { success: false };
  }
}

/**
 * Vide le cache audio (utile après un nouvel enregistrement)
 */
export function clearAudioCache(): void {
  audioUrlCache.clear();
}

/**
 * Arrête un audio en cours de lecture
 */
export function stopAudio(audio: HTMLAudioElement | null): void {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
