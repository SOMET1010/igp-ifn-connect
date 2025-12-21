import { LanguageCode } from '@/lib/translations';

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

// Cache pour vérifier l'existence des fichiers audio
const audioExistsCache = new Map<string, boolean>();

/**
 * Vérifie si un fichier audio existe pour une clé et une langue données
 */
export async function checkAudioExists(key: string, lang: LanguageCode): Promise<boolean> {
  const cacheKey = `${lang}/${key}`;
  
  if (audioExistsCache.has(cacheKey)) {
    return audioExistsCache.get(cacheKey)!;
  }

  const audioPath = `/audio/${lang}/${key}.mp3`;
  
  try {
    const response = await fetch(audioPath, { method: 'HEAD' });
    const exists = response.ok;
    audioExistsCache.set(cacheKey, exists);
    return exists;
  } catch {
    audioExistsCache.set(cacheKey, false);
    return false;
  }
}

/**
 * Joue un fichier audio pré-enregistré
 * Retourne true si la lecture a réussi, false sinon (permettant le fallback)
 */
export async function playPrerecordedAudio(
  key: string, 
  lang: LanguageCode
): Promise<{ success: boolean; audio?: HTMLAudioElement }> {
  const exists = await checkAudioExists(key, lang);
  
  if (!exists) {
    // Essayer le français comme fallback si la langue demandée n'a pas le fichier
    if (lang !== 'fr') {
      const frExists = await checkAudioExists(key, 'fr');
      if (frExists) {
        return playPrerecordedAudio(key, 'fr');
      }
    }
    return { success: false };
  }

  const audioPath = `/audio/${lang}/${key}.mp3`;
  
  try {
    const audio = new Audio(audioPath);
    
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
 * Arrête un audio en cours de lecture
 */
export function stopAudio(audio: HTMLAudioElement | null): void {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
