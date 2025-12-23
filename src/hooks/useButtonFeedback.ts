import { useCallback } from 'react';

type FeedbackType = 'tap' | 'success' | 'error' | 'light';

const vibrationPatterns: Record<FeedbackType, number | number[]> = {
  tap: 20,
  light: 10,
  success: [50, 30, 100],
  error: [50, 30, 50, 30, 50]
};

export function useButtonFeedback() {
  const triggerHaptic = useCallback((type: FeedbackType = 'tap') => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(vibrationPatterns[type]);
      } catch {
        // Vibration not supported or blocked
      }
    }
  }, []);

  const triggerFeedback = useCallback((type: FeedbackType = 'tap') => {
    triggerHaptic(type);
  }, [triggerHaptic]);

  return { triggerFeedback, triggerHaptic };
}
