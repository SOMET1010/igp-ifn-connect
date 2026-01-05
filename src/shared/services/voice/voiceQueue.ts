/**
 * VoiceQueue - Service centralisé anti-superposition audio PNAVIM
 * 
 * Garantit qu'une seule voix joue à la fois:
 * - Annule tout audio en cours avant d'en lancer un nouveau
 * - Debounce de 700ms entre appels
 * - File d'attente optionnelle avec priorités
 * - État global isSpeaking
 */

type Priority = 'low' | 'normal' | 'high';

interface QueueItem {
  id: string;
  text: string;
  priority: Priority;
  resolve: () => void;
  reject: (error: Error) => void;
}

interface SpeakOptions {
  priority?: Priority;
  skipIfBusy?: boolean;
}

type SpeakFunction = (text: string) => Promise<void>;

class VoiceQueueService {
  private queue: QueueItem[] = [];
  private isProcessing = false;
  private lastSpeakTime = 0;
  private currentAudio: HTMLAudioElement | null = null;
  private currentSpeakCancel: (() => void) | null = null;
  private speakFn: SpeakFunction | null = null;
  
  private readonly DEBOUNCE_MS = 200; // Réduit pour permettre confirmations rapides
  
  // État public
  public isSpeaking = false;
  public isLoading = false;

  // Callbacks
  public onStart?: () => void;
  public onEnd?: () => void;
  public onError?: (error: string) => void;

  /**
   * Enregistrer la fonction de synthèse (ElevenLabs ou Web Speech)
   */
  setSpeakFunction(fn: SpeakFunction) {
    this.speakFn = fn;
  }

  /**
   * Enregistrer l'audio en cours pour pouvoir l'annuler
   */
  setCurrentAudio(audio: HTMLAudioElement | null) {
    this.currentAudio = audio;
  }

  /**
   * Enregistrer une fonction d'annulation personnalisée
   */
  setCancelFunction(cancelFn: (() => void) | null) {
    this.currentSpeakCancel = cancelFn;
  }

  /**
   * Annuler TOUT audio en cours (Web Speech + HTML5 Audio)
   */
  cancel() {
    // 1. Arrêter Web Speech API
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // 2. Arrêter l'audio HTML5 en cours
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // 3. Appeler le cancel personnalisé (ElevenLabs, etc.)
    if (this.currentSpeakCancel) {
      this.currentSpeakCancel();
      this.currentSpeakCancel = null;
    }

    // 4. Vider la queue
    this.queue.forEach(item => item.reject(new Error('Cancelled')));
    this.queue = [];
    
    // 5. Réinitialiser l'état
    this.isProcessing = false;
    this.isSpeaking = false;
    this.isLoading = false;
    
    this.onEnd?.();
  }

  /**
   * Parler un texte (avec anti-superposition)
   */
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    const { priority = 'normal', skipIfBusy = false } = options;
    
    if (!text?.trim()) return;

    // Skip si occupé et option activée
    if (skipIfBusy && (this.isSpeaking || this.isLoading)) {
      console.log('[VoiceQueue] Skipped (busy):', text.slice(0, 30));
      return;
    }

    // Priorité haute: bypass debounce, parler immédiatement (sans cancel qui coupe le micro)
    const now = Date.now();
    const timeSinceLastSpeak = now - this.lastSpeakTime;
    
    if (priority === 'high') {
      console.log('[VoiceQueue] HIGH priority - bypass debounce:', text.slice(0, 30));
      this.lastSpeakTime = now;
      await this.executeSpeak(text);
      return;
    }

    // Debounce: ignorer si trop proche du dernier appel
    if (timeSinceLastSpeak < this.DEBOUNCE_MS) {
      console.log('[VoiceQueue] Debounced:', text.slice(0, 30), `(${timeSinceLastSpeak}ms)`);
      return;
    }
    console.log('[VoiceQueue] Accepted:', text.slice(0, 30), `(${timeSinceLastSpeak}ms since last)`);
    this.lastSpeakTime = now;

    // Ajouter à la queue
    return new Promise((resolve, reject) => {
      const item: QueueItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        text,
        priority,
        resolve,
        reject,
      };

      // Insérer selon priorité
      if (priority === 'normal') {
        // Insérer avant les 'low' mais après les autres 'normal'
        const lowIndex = this.queue.findIndex(q => q.priority === 'low');
        if (lowIndex >= 0) {
          this.queue.splice(lowIndex, 0, item);
        } else {
          this.queue.push(item);
        }
      } else {
        this.queue.push(item);
      }

      this.processQueue();
    });
  }

  /**
   * Traiter la file d'attente
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const item = this.queue.shift()!;

    try {
      await this.executeSpeak(item.text);
      item.resolve();
    } catch (error) {
      item.reject(error instanceof Error ? error : new Error(String(error)));
    }

    this.isProcessing = false;
    
    // Traiter le prochain élément
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Exécuter la synthèse vocale
   */
  private async executeSpeak(text: string): Promise<void> {
    console.log('[VoiceQueue] executeSpeak:', text);
    
    // Annuler audio précédent (SANS cancel() complet qui reset isSpeaking)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    this.isLoading = true;
    this.onStart?.();

    try {
      if (this.speakFn) {
        // Utiliser la fonction enregistrée (ElevenLabs)
        console.log('[VoiceQueue] Using custom speakFn');
        this.isSpeaking = true;
        this.isLoading = false;
        await this.speakFn(text);
      } else {
        // Fallback Web Speech API
        console.log('[VoiceQueue] Using Web Speech API fallback');
        await this.webSpeechSpeak(text);
      }
    } catch (error) {
      console.error('[VoiceQueue] Speak error:', error);
      this.onError?.(error instanceof Error ? error.message : 'Erreur vocale');
      throw error;
    } finally {
      this.isSpeaking = false;
      this.isLoading = false;
      this.onEnd?.();
    }
  }

  /**
   * Fallback Web Speech API
   */
  private webSpeechSpeak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.error('[VoiceQueue] Web Speech API non supportée');
        reject(new Error('Web Speech API non supportée'));
        return;
      }

      console.log('[VoiceQueue] Creating utterance for:', text);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Obtenir les voix disponibles (async sur certains navigateurs)
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('[VoiceQueue] Available voices:', voices.length);
        
        // Chercher une voix française
        const frenchVoice = voices.find(v => v.lang.startsWith('fr')) 
          || voices.find(v => v.lang.includes('FR'))
          || voices[0];
        
        if (frenchVoice) {
          console.log('[VoiceQueue] Using voice:', frenchVoice.name);
          utterance.voice = frenchVoice;
        }
      };

      // Charger les voix si pas encore disponibles
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = setVoice;
      } else {
        setVoice();
      }

      utterance.onstart = () => {
        console.log('[VoiceQueue] Speech started');
        this.isSpeaking = true;
        this.isLoading = false;
      };

      utterance.onend = () => {
        console.log('[VoiceQueue] Speech ended');
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('[VoiceQueue] Speech error:', event.error);
        this.isSpeaking = false;
        if (event.error !== 'canceled' && event.error !== 'interrupted') {
          reject(new Error(`Speech error: ${event.error}`));
        } else {
          resolve(); // Cancelled/interrupted is not a real error
        }
      };

      // Chrome bug: parfois speechSynthesis reste "stuck"
      // Workaround: resume si pausé
      if (window.speechSynthesis.paused) {
        console.log('[VoiceQueue] Resuming paused speechSynthesis');
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
      console.log('[VoiceQueue] speak() called');
    });
  }

  /**
   * Réinitialiser le service
   */
  reset() {
    this.cancel();
    this.speakFn = null;
    this.onStart = undefined;
    this.onEnd = undefined;
    this.onError = undefined;
  }
}

// Instance singleton
export const voiceQueue = new VoiceQueueService();

// Export pour faciliter les tests
export type { SpeakOptions, Priority };
