import { useState, useCallback, useRef } from 'react';
import { generateSpeech } from '@/shared/services/tts/elevenlabsTts';
import { PNAVIM_VOICES } from '@/shared/config/voiceConfig';

interface UseSpeechTtsReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
}

/**
 * TTS simple (voix PNAVIM uniquement)
 * IMPORTANT: aucun fallback Web Speech (voix par défaut interdites)
 */
export function useSpeechTts(): UseSpeechTtsReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

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

  const speak = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      void (async () => {
        stop();

        try {
          const audioBlob = await generateSpeech(text, { voiceId: PNAVIM_VOICES.DEFAULT });
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
          };

          audio.onplay = () => setIsSpeaking(true);
          audio.onended = cleanup;
          audio.onerror = cleanup;

          await audio.play();
        } catch (e) {
          setIsSpeaking(false);
        }
      })();
    },
    [stop]
  );

  return {
    speak,
    stop,
    isSpeaking,
  };
}
