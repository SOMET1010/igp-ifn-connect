/**
 * useTts - Hook React pour le Text-to-Speech
 */

import { useState, useEffect, useCallback } from 'react';
import { TTSManager } from '../tts/TTSManager';
import { TTSOptions } from '../core/types';

export interface UseTtsReturn {
  speak: (text: string, options?: Partial<TTSOptions>) => Promise<void>;
  stop: () => void;
  isPlaying: boolean;
  queueSize: number;
}

export function useTts(defaultOptions: Partial<TTSOptions> = {}): UseTtsReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [queueSize, setQueueSize] = useState(0);

  // S'abonner aux changements d'état
  useEffect(() => {
    const unsubscribe = TTSManager.subscribe((playing) => {
      setIsPlaying(playing);
      setQueueSize(TTSManager.getQueueSize());
    });

    return unsubscribe;
  }, []);

  const speak = useCallback(async (text: string, options: Partial<TTSOptions> = {}) => {
    const mergedOptions = { ...defaultOptions, ...options };
    await TTSManager.speak(text, mergedOptions);
    setQueueSize(TTSManager.getQueueSize());
  }, [defaultOptions]);

  const stop = useCallback(() => {
    TTSManager.stop();
    setQueueSize(0);
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    queueSize,
  };
}
