import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeech } from '@/shared/services/tts/elevenlabsTts';
import logger from '@/infra/logger';

const VOICE_ENABLED_KEY = 'ifn_voice_enabled';

interface UseTtsReturn {
  /** Lire un texte avec ElevenLabs TTS */
  speak: (text: string) => Promise<void>;
  /** Arrêter la lecture en cours */
  stop: () => void;
  /** Lecture en cours */
  isPlaying: boolean;
  /** Chargement en cours */
  isLoading: boolean;
  /** Message d'erreur (null si aucune erreur) */
  error: string | null;
  /** Voix activée/désactivée */
  isVoiceEnabled: boolean;
  /** Toggle voix ON/OFF */
  toggleVoice: () => void;
}

/**
 * Hook React pour gérer le TTS ElevenLabs
 * - Gère l'état de lecture (loading, playing, error)
 * - Persiste le toggle voix en localStorage
 * - Pas de fallback vers d'autres TTS (erreur propre)
 */
export function useTts(): UseTtsReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    const stored = localStorage.getItem(VOICE_ENABLED_KEY);
    return stored !== 'false'; // Activé par défaut
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Nettoyer l'audio et l'URL blob à la destruction
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
    setIsPlaying(false);
    setError(null);
  }, []);

  // Lire un texte avec ElevenLabs
  const speak = useCallback(async (text: string) => {
    // Arrêter si déjà en lecture
    if (isPlaying) {
      stop();
      return;
    }

    // Vérifier si la voix est activée
    if (!isVoiceEnabled) {
      logger.debug('TTS désactivé par l\'utilisateur', { module: 'useTts' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.debug('Appel ElevenLabs TTS', { module: 'useTts', text: text.substring(0, 50) });

      const audioBlob = await generateSpeech(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
        if (navigator.vibrate) navigator.vibrate(30);
      };

      audio.onended = () => {
        setIsPlaying(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        logger.error('Erreur lecture audio', e, { module: 'useTts' });
        setIsLoading(false);
        setIsPlaying(false);
        setError('Erreur de lecture audio');
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur TTS inconnue';
      logger.error('Erreur ElevenLabs TTS', err, { module: 'useTts' });
      setIsLoading(false);
      setIsPlaying(false);
      setError(errorMessage);
      // Pas de fallback - erreur propre
    }
  }, [isPlaying, isVoiceEnabled, stop]);

  // Toggle voix ON/OFF
  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(VOICE_ENABLED_KEY, String(newValue));
      if (!newValue) {
        stop(); // Arrêter si on désactive
      }
      return newValue;
    });
  }, [stop]);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    error,
    isVoiceEnabled,
    toggleVoice,
  };
}
