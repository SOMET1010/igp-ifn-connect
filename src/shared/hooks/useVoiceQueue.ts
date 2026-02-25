/**
 * Hook React pour VoiceQueue - Anti-superposition audio JÙLABA
 * 
 * Wrapper React autour du service voiceQueue singleton
 * - Expose speak(), stop(), isSpeaking
 * - Cleanup automatique au démontage
 * - Intégration avec useTts existant
 */

import { useState, useCallback, useEffect } from 'react';
import { voiceQueue, type SpeakOptions } from '@/shared/services/voice/voiceQueue';

interface UseVoiceQueueOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseVoiceQueueReturn {
  /** Parler un texte (anti-superposition garantie) */
  speak: (text: string, options?: SpeakOptions) => void;
  /** Arrêter tout audio immédiatement */
  stop: () => void;
  /** Audio en cours de lecture */
  isSpeaking: boolean;
  /** Chargement en cours */
  isLoading: boolean;
}

export function useVoiceQueue(options: UseVoiceQueueOptions = {}): UseVoiceQueueReturn {
  const { onStart, onEnd, onError } = options;
  
  const [isSpeaking, setIsSpeaking] = useState(voiceQueue.isSpeaking);
  const [isLoading, setIsLoading] = useState(voiceQueue.isLoading);

  // Synchroniser l'état avec le service
  useEffect(() => {
    const originalOnStart = voiceQueue.onStart;
    const originalOnEnd = voiceQueue.onEnd;
    const originalOnError = voiceQueue.onError;

    voiceQueue.onStart = () => {
      setIsSpeaking(true);
      setIsLoading(false);
      onStart?.();
      originalOnStart?.();
    };

    voiceQueue.onEnd = () => {
      setIsSpeaking(false);
      setIsLoading(false);
      onEnd?.();
      originalOnEnd?.();
    };

    voiceQueue.onError = (error: string) => {
      setIsSpeaking(false);
      setIsLoading(false);
      onError?.(error);
      originalOnError?.(error);
    };

    return () => {
      // Restaurer les callbacks originaux au démontage
      voiceQueue.onStart = originalOnStart;
      voiceQueue.onEnd = originalOnEnd;
      voiceQueue.onError = originalOnError;
    };
  }, [onStart, onEnd, onError]);

  // Cleanup: arrêter l'audio si le composant se démonte
  useEffect(() => {
    return () => {
      // Ne pas annuler automatiquement - laisser continuer si c'est voulu
      // voiceQueue.cancel();
    };
  }, []);

  const speak = useCallback((text: string, speakOptions?: SpeakOptions) => {
    setIsLoading(true);
    voiceQueue.speak(text, speakOptions).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const stop = useCallback(() => {
    voiceQueue.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
  };
}

export default useVoiceQueue;
