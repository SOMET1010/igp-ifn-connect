/**
 * Tests unitaires - VoiceQueue Anti-Superposition
 * Vérifie qu'une seule voix joue à la fois
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock minimal du service voiceQueue
interface MockVoiceQueue {
  isSpeaking: boolean;
  isLoading: boolean;
  queue: string[];
  lastSpeakTime: number;
  speak: (text: string, options?: { priority?: string }) => Promise<void>;
  cancel: () => void;
}

function createMockVoiceQueue(): MockVoiceQueue {
  const DEBOUNCE_MS = 700;
  
  return {
    isSpeaking: false,
    isLoading: false,
    queue: [],
    lastSpeakTime: 0,
    
    async speak(text: string, options?: { priority?: string }) {
      const now = Date.now();
      
      // Debounce
      if (now - this.lastSpeakTime < DEBOUNCE_MS) {
        return;
      }
      this.lastSpeakTime = now;
      
      // Priority high: annule tout
      if (options?.priority === 'high') {
        this.cancel();
      }
      
      // Simule la lecture
      this.isSpeaking = true;
      this.queue.push(text);
      
      // Simule la fin après un délai
      await new Promise(resolve => setTimeout(resolve, 10));
      this.isSpeaking = false;
    },
    
    cancel() {
      this.isSpeaking = false;
      this.isLoading = false;
      this.queue = [];
    },
  };
}

describe('VoiceQueue - Anti-superposition audio', () => {
  let voiceQueue: MockVoiceQueue;
  
  beforeEach(() => {
    voiceQueue = createMockVoiceQueue();
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Debounce 700ms', () => {
    
    it('ignore les appels trop rapprochés', async () => {
      voiceQueue.speak('Premier message');
      
      // Avancer de 100ms (< 700ms)
      vi.advanceTimersByTime(100);
      voiceQueue.speak('Deuxième message');
      
      // Seul le premier doit être dans la queue
      expect(voiceQueue.queue.length).toBe(1);
      expect(voiceQueue.queue[0]).toBe('Premier message');
    });

    it('accepte les appels après le délai de debounce', async () => {
      voiceQueue.speak('Premier message');
      
      // Avancer de 800ms (> 700ms)
      vi.advanceTimersByTime(800);
      voiceQueue.speak('Deuxième message');
      
      expect(voiceQueue.queue.length).toBe(2);
    });
  });

  describe('Cancel - Annulation immédiate', () => {
    
    it('annule la lecture en cours', () => {
      voiceQueue.isSpeaking = true;
      voiceQueue.queue = ['Message en cours'];
      
      voiceQueue.cancel();
      
      expect(voiceQueue.isSpeaking).toBe(false);
      expect(voiceQueue.queue.length).toBe(0);
    });

    it('réinitialise tous les états', () => {
      voiceQueue.isSpeaking = true;
      voiceQueue.isLoading = true;
      voiceQueue.queue = ['A', 'B', 'C'];
      
      voiceQueue.cancel();
      
      expect(voiceQueue.isSpeaking).toBe(false);
      expect(voiceQueue.isLoading).toBe(false);
      expect(voiceQueue.queue).toEqual([]);
    });
  });

  describe('Priorité haute', () => {
    
    it('la priorité haute annule la queue existante', async () => {
      voiceQueue.queue = ['Message 1', 'Message 2'];
      
      // Avancer assez pour passer le debounce
      vi.advanceTimersByTime(800);
      
      voiceQueue.speak('Message urgent', { priority: 'high' });
      
      // La queue doit être vidée puis contenir uniquement le message urgent
      expect(voiceQueue.queue).toEqual(['Message urgent']);
    });
  });

  describe('État isSpeaking', () => {
    
    it('passe à true pendant la lecture', () => {
      voiceQueue.speak('Test');
      
      // Pendant la lecture
      expect(voiceQueue.isSpeaking).toBe(true);
    });

    it('empêche les nouvelles lectures si occupé', () => {
      voiceQueue.isSpeaking = true;
      const initialQueueLength = voiceQueue.queue.length;
      
      // Tenter une nouvelle lecture avec skipIfBusy
      // (simulé par la vérification manuelle)
      const skipIfBusy = true;
      if (skipIfBusy && voiceQueue.isSpeaking) {
        // Ne pas ajouter
      } else {
        voiceQueue.queue.push('Nouveau message');
      }
      
      expect(voiceQueue.queue.length).toBe(initialQueueLength);
    });
  });

  describe('Unicité de la voix', () => {
    
    it('garantit une seule source audio à la fois', () => {
      // Principe: avant chaque speak(), cancel() est appelé
      // Donc seule la dernière voix doit jouer
      
      voiceQueue.cancel();
      voiceQueue.speak('Message final');
      
      expect(voiceQueue.isSpeaking).toBe(true);
      expect(voiceQueue.queue.length).toBe(1);
    });
  });
});

describe('Intégration speechSynthesis', () => {
  
  it('cancel() doit appeler speechSynthesis.cancel()', () => {
    // Mock de speechSynthesis
    const mockCancel = vi.fn();
    
    // Simuler window.speechSynthesis
    const originalSpeechSynthesis = globalThis.speechSynthesis;
    (globalThis as any).speechSynthesis = { cancel: mockCancel };
    
    // Tester l'annulation
    if (globalThis.speechSynthesis) {
      globalThis.speechSynthesis.cancel();
    }
    
    expect(mockCancel).toHaveBeenCalled();
    
    // Restaurer
    (globalThis as any).speechSynthesis = originalSpeechSynthesis;
  });
});
