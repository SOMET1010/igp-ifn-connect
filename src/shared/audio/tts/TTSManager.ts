/**
 * TTSManager - Gestionnaire TTS unifié
 * 
 * Remplace:
 * - voiceQueue.ts
 * - textToSpeech.ts
 * - useTts.ts + elevenlabsTts.ts
 * 
 * Fonctionnalités:
 * - File d'attente unique avec priorités
 * - Auto-sélection provider (ElevenLabs ou Web Speech)
 * - Debounce intelligent
 * - Gestion voix FR par défaut
 */

import { TTSOptions, TTSPriority, DEFAULT_TTS_OPTIONS } from '../core/types';
import { PNAVIM_VOICES } from '@/shared/config/voiceConfig';
import { supabase } from '@/integrations/supabase/client';

interface QueueItem {
  id: string;
  text: string;
  options: TTSOptions;
  priority: TTSPriority;
  addedAt: number;
}

const PRIORITY_ORDER: Record<TTSPriority, number> = {
  immediate: 0,
  high: 1,
  normal: 2,
  low: 3,
};

class TTSManagerClass {
  private static instance: TTSManagerClass | null = null;
  
  private queue: QueueItem[] = [];
  private isPlaying: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private debounceTimers: Map<string, number> = new Map();
  private lastTextSpoken: string = '';
  private listeners: Set<(playing: boolean) => void> = new Set();

  private constructor() {
    // Polling pour détecter la fin de Web Speech (plus fiable que les events)
    setInterval(() => {
      if ('speechSynthesis' in window && !window.speechSynthesis.speaking && this.isPlaying) {
        // Vérifier si c'était Web Speech
        if (this.currentUtterance && !this.currentAudio) {
          this.handlePlaybackEnd();
        }
      }
    }, 100);
  }

  static getInstance(): TTSManagerClass {
    if (!TTSManagerClass.instance) {
      TTSManagerClass.instance = new TTSManagerClass();
    }
    return TTSManagerClass.instance;
  }

  /**
   * S'abonner aux changements d'état de lecture
   */
  subscribe(callback: (playing: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.isPlaying));
  }

  /**
   * Parler un texte
   */
  async speak(text: string, options: Partial<TTSOptions> = {}): Promise<void> {
    const mergedOptions: TTSOptions = { ...DEFAULT_TTS_OPTIONS, ...options };
    const priority = mergedOptions.priority || 'normal';

    // Debounce pour les priorités basses/normales
    if (priority !== 'immediate' && priority !== 'high') {
      const debounceKey = text.substring(0, 50);
      const existingTimer = this.debounceTimers.get(debounceKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      return new Promise((resolve) => {
        const timer = window.setTimeout(() => {
          this.debounceTimers.delete(debounceKey);
          this.enqueue(text, mergedOptions).then(resolve);
        }, 300);
        this.debounceTimers.set(debounceKey, timer);
      });
    }

    // Priorité immediate: interrompre tout
    if (priority === 'immediate') {
      this.stop();
    }

    return this.enqueue(text, mergedOptions);
  }

  /**
   * Ajouter à la file d'attente
   */
  private async enqueue(text: string, options: TTSOptions): Promise<void> {
    const item: QueueItem = {
      id: `tts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      options,
      priority: options.priority || 'normal',
      addedAt: Date.now(),
    };

    // Insérer selon la priorité
    const insertIndex = this.queue.findIndex(
      q => PRIORITY_ORDER[q.priority] > PRIORITY_ORDER[item.priority]
    );

    if (insertIndex === -1) {
      this.queue.push(item);
    } else {
      this.queue.splice(insertIndex, 0, item);
    }

    console.log('[TTSManager] 📝 Enqueued:', { text: text.substring(0, 30), priority: item.priority, queueLength: this.queue.length });

    // Démarrer si pas déjà en cours
    if (!this.isPlaying) {
      this.processQueue();
    }
  }

  /**
   * Traiter la file d'attente
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.isPlaying) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.isPlaying = true;
    this.notifyListeners();

    try {
      item.options.onStart?.();
      
      // Éviter de répéter le même texte
      if (item.text === this.lastTextSpoken) {
        console.log('[TTSManager] ⏭️ Skipping duplicate text');
        this.handlePlaybackEnd();
        return;
      }

      this.lastTextSpoken = item.text;

      // Essayer ElevenLabs d'abord, fallback sur Web Speech
      if (item.options.provider === 'elevenlabs') {
        await this.playWithElevenLabs(item.text, item.options);
      } else {
        await this.playWithWebSpeech(item.text, item.options);
      }

    } catch (error) {
      console.error('[TTSManager] ❌ Playback error:', error);
      item.options.onError?.(error as Error);
      
      // Fallback sur Web Speech si ElevenLabs échoue
      if (item.options.provider === 'elevenlabs') {
        console.log('[TTSManager] 🔄 Falling back to Web Speech');
        try {
          await this.playWithWebSpeech(item.text, { ...item.options, provider: 'webspeech' });
        } catch (fallbackError) {
          console.error('[TTSManager] ❌ Fallback also failed:', fallbackError);
          this.handlePlaybackEnd();
        }
      } else {
        this.handlePlaybackEnd();
      }
    }
  }

  /**
   * Jouer avec ElevenLabs
   */
  private async playWithElevenLabs(text: string, options: TTSOptions): Promise<void> {
    console.log('[TTSManager] 🎙️ Playing with ElevenLabs');

    const voiceId = options.voiceId || PNAVIM_VOICES.DEFAULT;

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text, voiceId }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return new Promise((resolve, reject) => {
      this.currentAudio = new Audio(audioUrl);
      
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        options.onEnd?.();
        this.handlePlaybackEnd();
        resolve();
      };

      this.currentAudio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Audio playback failed'));
      };

      this.currentAudio.play().catch(reject);
    });
  }

  /**
   * Jouer avec Web Speech API
   */
  private async playWithWebSpeech(text: string, options: TTSOptions): Promise<void> {
    console.log('[TTSManager] 🗣️ Playing with Web Speech');

    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      // Annuler toute synthèse en cours
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Configurer la voix française
      const voices = window.speechSynthesis.getVoices();
      const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
      if (frenchVoice) {
        utterance.voice = frenchVoice;
      }
      utterance.lang = 'fr-FR';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      utterance.onend = () => {
        options.onEnd?.();
        this.handlePlaybackEnd();
        resolve();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted') {
          reject(new Error(`Speech synthesis error: ${e.error}`));
        } else {
          resolve();
        }
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Gérer la fin de lecture
   */
  private handlePlaybackEnd(): void {
    this.isPlaying = false;
    this.currentAudio = null;
    this.currentUtterance = null;
    this.notifyListeners();

    // Traiter le prochain élément
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 50);
    }
  }

  /**
   * Arrêter toute lecture
   */
  stop(): void {
    console.log('[TTSManager] 🛑 Stopping all playback');

    // Arrêter l'audio en cours
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Arrêter Web Speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;

    // Vider la queue
    this.queue = [];

    // Annuler les timers de debounce
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    this.isPlaying = false;
    this.notifyListeners();
  }

  /**
   * Vérifier si en cours de lecture
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Obtenir la taille de la queue
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Vider la queue sans arrêter la lecture en cours
   */
  clearQueue(): void {
    this.queue = [];
    console.log('[TTSManager] 🧹 Queue cleared');
  }
}

// Export singleton
export const TTSManager = TTSManagerClass.getInstance();
