// ============================================
// Hook unifié - Feedback Sensoriel (Vibration + Audio)
// ============================================

import { useCallback, useRef } from 'react';
import { getAudioContextConstructor } from '@/shared/types';

export type FeedbackType = 'tap' | 'success' | 'error' | 'money' | 'light';

interface FeedbackOptions {
  vibrate?: boolean;
  sound?: boolean;
}

// Patterns de vibration (en ms)
const vibrationPatterns: Record<FeedbackType, number | number[]> = {
  tap: 25,
  light: 10,
  success: [50, 40, 100],
  error: [80, 30, 80, 30, 80],
  money: [30, 20, 50, 20, 30],
};

// Configuration audio
const audioConfig: Record<FeedbackType, { frequency: number; duration: number; type: OscillatorType }> = {
  tap: { frequency: 600, duration: 60, type: 'sine' },
  light: { frequency: 500, duration: 40, type: 'sine' },
  success: { frequency: 800, duration: 120, type: 'sine' },
  error: { frequency: 200, duration: 180, type: 'square' },
  money: { frequency: 700, duration: 100, type: 'triangle' },
};

export function useSensoryFeedback() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Obtenir ou créer l'AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = getAudioContextConstructor();
      if (!AudioContextClass) return null;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  }, []);

  // Jouer un son
  const playSound = useCallback((type: FeedbackType) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const config = audioConfig[type];
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

      // Envelope pour éviter les clics
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration / 1000);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + config.duration / 1000);
    } catch {
      // Audio not supported or blocked
    }
  }, [getAudioContext]);

  // Déclencher la vibration
  const vibrate = useCallback((type: FeedbackType) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(vibrationPatterns[type]);
      } catch {
        // Vibration not supported or blocked
      }
    }
  }, []);

  // Feedback combiné (vibration + son)
  const triggerFeedback = useCallback((
    type: FeedbackType,
    options: FeedbackOptions = { vibrate: true, sound: true }
  ) => {
    const { vibrate: shouldVibrate = true, sound: shouldSound = true } = options;

    if (shouldVibrate) {
      vibrate(type);
    }
    if (shouldSound) {
      playSound(type);
    }
  }, [vibrate, playSound]);

  // Raccourcis pratiques
  const triggerTap = useCallback(() => triggerFeedback('tap'), [triggerFeedback]);
  const triggerSuccess = useCallback(() => triggerFeedback('success'), [triggerFeedback]);
  const triggerError = useCallback(() => triggerFeedback('error'), [triggerFeedback]);
  const triggerMoney = useCallback(() => triggerFeedback('money'), [triggerFeedback]);
  const triggerLight = useCallback(() => triggerFeedback('light', { vibrate: true, sound: false }), [triggerFeedback]);

  return {
    triggerFeedback,
    triggerTap,
    triggerSuccess,
    triggerError,
    triggerMoney,
    triggerLight,
    vibrate,
    playSound,
  };
}
