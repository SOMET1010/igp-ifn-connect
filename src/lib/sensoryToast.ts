// ============================================
// Wrapper Toast avec Feedback Sensoriel
// ============================================

import { toast as sonnerToast, ExternalToast } from "sonner";

// Patterns de vibration
const vibrationPatterns = {
  success: [50, 40, 100],
  error: [80, 30, 80, 30, 80],
  info: 25,
  warning: [50, 30, 50],
};

// Configuration audio
const audioConfig = {
  success: { frequency: 800, duration: 120 },
  error: { frequency: 200, duration: 180 },
  info: { frequency: 600, duration: 60 },
  warning: { frequency: 400, duration: 100 },
};

// Créer un AudioContext unique
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Jouer un son de feedback
function playFeedbackSound(type: 'success' | 'error' | 'info' | 'warning') {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const config = audioConfig[type];
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type === 'error' ? 'square' : 'sine';
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration / 1000);
  } catch {
    // Audio not supported
  }
}

// Déclencher la vibration
function triggerVibration(type: 'success' | 'error' | 'info' | 'warning') {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(vibrationPatterns[type]);
    } catch {
      // Vibration not supported
    }
  }
}

// Feedback combiné
function triggerSensoryFeedback(type: 'success' | 'error' | 'info' | 'warning') {
  triggerVibration(type);
  playFeedbackSound(type);
}

// Wrapper de toast avec feedback sensoriel automatique
export const sensoryToast = {
  success: (message: string | React.ReactNode, options?: ExternalToast) => {
    triggerSensoryFeedback('success');
    return sonnerToast.success(message, options);
  },

  error: (message: string | React.ReactNode, options?: ExternalToast) => {
    triggerSensoryFeedback('error');
    return sonnerToast.error(message, options);
  },

  info: (message: string | React.ReactNode, options?: ExternalToast) => {
    triggerSensoryFeedback('info');
    return sonnerToast.info(message, options);
  },

  warning: (message: string | React.ReactNode, options?: ExternalToast) => {
    triggerSensoryFeedback('warning');
    return sonnerToast.warning(message, options);
  },

  // Toast standard sans feedback (pour compatibilité)
  message: (message: string | React.ReactNode, options?: ExternalToast) => {
    return sonnerToast(message, options);
  },

  // Dismiss toast
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },

  // Loading toast (sans vibration)
  loading: (message: string | React.ReactNode, options?: ExternalToast) => {
    return sonnerToast.loading(message, options);
  },

  // Promise toast
  promise: sonnerToast.promise,
};

// Export par défaut pour remplacement facile
export default sensoryToast;
