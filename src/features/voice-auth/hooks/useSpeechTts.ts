import { useCallback, useRef, useState } from 'react';
import { VoiceAuthLang, VoiceScriptKey, getVoiceScript } from '../config/audioScripts';
import { generateSpeech } from '@/shared/services/tts/elevenlabsTts';
import { PNAVIM_VOICES } from '@/shared/config/voiceConfig';

interface UseSpeechTtsOptions {
  lang: VoiceAuthLang;
  onStart?: () => void;
  onEnd?: () => void;
}

interface UseSpeechTtsReturn {
  speak: (key: VoiceScriptKey, variables?: Record<string, string>) => void;
  speakRaw: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

/**
 * Hook TTS multi-langue (voix PNAVIM uniquement)
 * Priorité: fichiers audio pré-enregistrés > ElevenLabs TTS
 * IMPORTANT: aucun fallback Web Speech (voix par défaut interdites)
 */
export function useSpeechTts({
  lang,
  onStart,
  onEnd,
}: UseSpeechTtsOptions): UseSpeechTtsReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const isSupported = typeof window !== 'undefined';

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
  }, []);

  const speakWithElevenLabs = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      stop();

      // Nouchi = ton "jeune" (Gbairai), sinon Tantie par défaut
      const voiceId = lang === 'nouchi' ? PNAVIM_VOICES.GBAIRAI : PNAVIM_VOICES.TANTIE_SAGESSE;

      try {
        const audioBlob = await generateSpeech(text, { voiceId });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        const cleanup = () => {
          setIsSpeaking(false);
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
          audioRef.current = null;
          onEnd?.();
        };

        audio.onplay = () => {
          setIsSpeaking(true);
          onStart?.();
        };

        audio.onended = cleanup;
        audio.onerror = cleanup;

        await audio.play();
      } catch (e) {
        setIsSpeaking(false);
        onEnd?.();
      }
    },
    [lang, onEnd, onStart, stop]
  );

  const tryPlayPrerecorded = useCallback(
    async (key: string): Promise<boolean> => {
      const audioPath = `/audio/${lang}/${key}.mp3`;

      return new Promise((resolve) => {
        const audio = new Audio(audioPath);
        audioRef.current = audio;

        audio.oncanplaythrough = () => {
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
          resolve(false);
        };

        // Timeout for loading
        setTimeout(() => {
          if (!audio.duration) {
            resolve(false);
          }
        }, 500);
      });
    },
    [lang, onEnd, onStart]
  );

  const speak = useCallback(
    (key: VoiceScriptKey, variables?: Record<string, string>) => {
      void (async () => {
        stop();

        // Try pre-recorded audio first
        const played = await tryPlayPrerecorded(key);

        if (!played) {
          const text = getVoiceScript(lang, key, variables);
          await speakWithElevenLabs(text);
        }
      })();
    },
    [lang, speakWithElevenLabs, stop, tryPlayPrerecorded]
  );

  const speakRaw = useCallback(
    (text: string) => {
      void speakWithElevenLabs(text);
    },
    [speakWithElevenLabs]
  );

  return {
    speak,
    speakRaw,
    stop,
    isSpeaking,
    isSupported,
  };
}

export default useSpeechTts;
