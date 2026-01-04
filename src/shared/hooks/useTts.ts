/**
 * Hook TTS unifié PNAVIM
 * - ElevenLabs TTS exclusivement (voix Tantie Sagesse / Gbairai)
 * - Support audio pré-enregistré (priorité)
 * - Messages persona (social-auth)
 * - Scripts multilingues (voice-auth)
 * - Toggle voix persisté en localStorage
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeech } from '@/shared/services/tts/elevenlabsTts';
import { PNAVIM_VOICES, type PnavimVoiceId } from '@/shared/config/voiceConfig';
import type { PersonaType } from '@/features/auth/config/personas';
import { 
  hasPrerecordedMessage, 
  playPrerecordedMessage,
  type MessageKey 
} from '@/shared/services/audio/prerecordedPersonaAudio';
import type { VoiceAuthLang, VoiceScriptKey } from '@/features/auth/config/audioScripts';
import { getVoiceScript } from '@/features/auth/config/audioScripts';
import { toast } from 'sonner';

const VOICE_ENABLED_KEY = 'ifn_voice_enabled';

export interface UseTtsOptions {
  /** Voice ID ElevenLabs (défaut: Tantie Sagesse) */
  voiceId?: PnavimVoiceId;
  /** Langue pour scripts voice-auth */
  lang?: VoiceAuthLang;
  /** Persona pour messages pré-enregistrés */
  persona?: PersonaType;
  /** Callback au début de la lecture */
  onStart?: () => void;
  /** Callback à la fin de la lecture */
  onEnd?: () => void;
  /** Callback en cas d'erreur */
  onError?: (error: string) => void;
}

export interface UseTtsReturn {
  /** Lire un texte ou un script key */
  speak: (textOrKey: string, options?: { messageKey?: MessageKey }) => void;
  /** Lire un script voice-auth par clé */
  speakScript: (key: VoiceScriptKey, variables?: Record<string, string>) => void;
  /** Arrêter la lecture en cours */
  stop: () => void;
  /** Lecture en cours (audio playing) */
  isSpeaking: boolean;
  /** Chargement en cours */
  isLoading: boolean;
  /** Message d'erreur (null si aucune erreur) */
  error: string | null;
  /** Voix activée/désactivée */
  isVoiceEnabled: boolean;
  /** Toggle voix ON/OFF */
  toggleVoice: () => void;
  /** TTS supporté (toujours true côté web) */
  isSupported: boolean;
}

/**
 * Hook React unifié pour le TTS PNAVIM
 * 
 * @example Simple (texte brut)
 * const { speak, isSpeaking } = useTts();
 * speak("Bienvenue sur PNAVIM");
 * 
 * @example Avec persona (messages pré-enregistrés)
 * const { speak } = useTts({ persona: 'tantie' });
 * speak("Connexion réussie", { messageKey: 'success' });
 * 
 * @example Multi-langue (voice-auth)
 * const { speakScript } = useTts({ lang: 'nouchi' });
 * speakScript('welcome');
 */
export function useTts(options: UseTtsOptions = {}): UseTtsReturn {
  const { 
    voiceId: initialVoiceId, 
    lang = 'suta',
    persona,
    onStart, 
    onEnd, 
    onError 
  } = options;
  
  // Voix par défaut selon la langue
  const voiceId = initialVoiceId ?? (lang === 'nouchi' ? PNAVIM_VOICES.GBAIRAI : PNAVIM_VOICES.DEFAULT);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(VOICE_ENABLED_KEY);
    return stored !== 'false'; // Activé par défaut
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const isSupported = typeof window !== 'undefined';

  // Nettoyer l'audio à la destruction
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  // Arrêter l'audio en cours
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
    setError(null);
  }, []);

  // Génération ElevenLabs TTS
  const speakWithElevenLabs = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const audioBlob = await generateSpeech(text, { voiceId });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      const cleanup = () => {
        setIsSpeaking(false);
        setIsLoading(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
        onEnd?.();
      };

      audio.onplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
        if (navigator.vibrate) navigator.vibrate(30);
        onStart?.();
      };

      audio.onended = cleanup;

      audio.onerror = () => {
        setError('Erreur de lecture audio');
        cleanup();
        onError?.('Erreur de lecture audio');
      };

      await audio.play();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur TTS inconnue';
      setIsLoading(false);
      setIsSpeaking(false);
      setError(errorMessage);
      onError?.(errorMessage);
      
      toast.error("Lecture vocale indisponible", {
        description: "Impossible de lire le texte à voix haute.",
      });
    }
  }, [voiceId, onStart, onEnd, onError]);

  // Essayer l'audio pré-enregistré (par langue/key pour voice-auth)
  const tryPlayPrerecordedByLang = useCallback(async (key: string): Promise<boolean> => {
    const audioPath = `/audio/${lang}/${key}.mp3`;

    return new Promise((resolve) => {
      const audio = new Audio(audioPath);
      audioRef.current = audio;

      const timeout = setTimeout(() => {
        if (!audio.duration) resolve(false);
      }, 500);

      audio.oncanplaythrough = () => {
        clearTimeout(timeout);
        setIsSpeaking(true);
        onStart?.();
        audio.play().catch(() => resolve(false));
      };

      audio.onended = () => {
        setIsSpeaking(false);
        onEnd?.();
        resolve(true);
      };

      audio.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
    });
  }, [lang, onStart, onEnd]);

  // Speak principal (texte brut ou avec messageKey persona)
  const speak = useCallback((textOrKey: string, speakOptions?: { messageKey?: MessageKey }) => {
    if (!isVoiceEnabled) return;
    
    void (async () => {
      stop();

      // 1. Essayer audio persona pré-enregistré
      if (persona && speakOptions?.messageKey && hasPrerecordedMessage(persona, speakOptions.messageKey)) {
        setIsLoading(true);
        
        const result = await playPrerecordedMessage(persona, speakOptions.messageKey, {
          onStart: () => {
            setIsLoading(false);
            setIsSpeaking(true);
            if (navigator.vibrate) navigator.vibrate(30);
            onStart?.();
          },
          onEnd: () => {
            setIsSpeaking(false);
            onEnd?.();
          },
          onError: (err) => {
            setIsSpeaking(false);
            setIsLoading(false);
            onError?.(err);
          }
        });

        if (result.success) {
          audioRef.current = result.audio || null;
          return;
        }
        // Fallback vers ElevenLabs si échec
      }

      // 2. Fallback ElevenLabs TTS
      await speakWithElevenLabs(textOrKey);
    })();
  }, [isVoiceEnabled, stop, persona, speakWithElevenLabs, onStart, onEnd, onError]);

  // Speak script (voice-auth multilingue)
  const speakScript = useCallback((key: VoiceScriptKey, variables?: Record<string, string>) => {
    if (!isVoiceEnabled) return;

    void (async () => {
      stop();

      // 1. Essayer audio pré-enregistré par langue
      const played = await tryPlayPrerecordedByLang(key);

      if (!played) {
        // 2. Fallback ElevenLabs avec script interpolé
        const text = getVoiceScript(lang, key, variables);
        await speakWithElevenLabs(text);
      }
    })();
  }, [isVoiceEnabled, stop, lang, tryPlayPrerecordedByLang, speakWithElevenLabs]);

  // Toggle voix ON/OFF
  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(VOICE_ENABLED_KEY, String(newValue));
      if (!newValue) {
        stop();
      }
      return newValue;
    });
  }, [stop]);

  return {
    speak,
    speakScript,
    stop,
    isSpeaking,
    isLoading,
    error,
    isVoiceEnabled,
    toggleVoice,
    isSupported,
  };
}

export default useTts;
