/**
 * AudioRecorder - Service d'enregistrement audio unifié
 * 
 * Remplace:
 * - useAudioRecorder.ts
 * - Code MediaRecorder dans VoiceInput.tsx
 * - Code dans InclusivePhoneAuth.tsx
 */

import { AudioManager } from '../core/AudioManager';
import { RecorderOptions, RecorderState, DEFAULT_RECORDER_OPTIONS } from '../core/types';

export interface RecorderEventHandlers {
  onStateChange?: (state: RecorderState) => void;
  onChunk?: (chunk: Blob) => void;
  onComplete?: (blob: Blob, duration: number) => void;
  onError?: (error: Error) => void;
  onDurationUpdate?: (duration: number) => void;
}

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private state: RecorderState = 'idle';
  private options: RecorderOptions;
  private handlers: RecorderEventHandlers = {};
  private durationTimer: number | null = null;
  private startTime: number = 0;
  private duration: number = 0;

  constructor(options: Partial<RecorderOptions> = {}) {
    this.options = { ...DEFAULT_RECORDER_OPTIONS, ...options };
  }

  /**
   * Définir les handlers d'événements
   */
  setHandlers(handlers: RecorderEventHandlers): void {
    this.handlers = handlers;
  }

  /**
   * Obtenir l'état actuel
   */
  getState(): RecorderState {
    return this.state;
  }

  /**
   * Obtenir la durée actuelle
   */
  getDuration(): number {
    return this.duration;
  }

  private setState(newState: RecorderState): void {
    this.state = newState;
    console.log('[AudioRecorder] State:', newState);
    this.handlers.onStateChange?.(newState);
  }

  /**
   * Démarrer l'enregistrement
   */
  async start(): Promise<void> {
    if (this.state === 'recording') {
      console.warn('[AudioRecorder] Already recording');
      return;
    }

    this.setState('requesting');
    this.chunks = [];
    this.duration = 0;

    try {
      // Obtenir le stream via AudioManager
      this.stream = await AudioManager.requestMicrophoneAccess({
        echoCancellation: this.options.echoCancellation,
        noiseSuppression: this.options.noiseSuppression,
        autoGainControl: this.options.autoGainControl,
      });

      // Déterminer le mime type
      const mimeType = this.options.mimeType || AudioManager.getBestMimeType();
      
      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      console.log('[AudioRecorder] 🎙️ Creating MediaRecorder with:', { mimeType });
      
      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);

      // Handler pour les chunks
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
          console.log('[AudioRecorder] ✅ Chunk:', e.data.size, 'bytes - Total:', this.chunks.length);
          this.handlers.onChunk?.(e.data);
        } else {
          console.warn('[AudioRecorder] ⚠️ Empty chunk received');
        }
      };

      // Handler pour l'arrêt
      this.mediaRecorder.onstop = () => {
        this.handleRecordingComplete();
      };

      // Handler pour les erreurs
      this.mediaRecorder.onerror = (event) => {
        console.error('[AudioRecorder] ❌ Error:', event);
        this.setState('error');
        this.handlers.onError?.(new Error('MediaRecorder error'));
      };

      // Démarrer l'enregistrement
      this.mediaRecorder.start(this.options.chunkInterval);
      this.startTime = Date.now();
      this.setState('recording');

      // Timer pour la durée
      this.durationTimer = window.setInterval(() => {
        this.duration = Math.floor((Date.now() - this.startTime) / 1000);
        this.handlers.onDurationUpdate?.(this.duration);

        // Auto-stop si durée max atteinte
        if (this.options.maxDuration && this.duration >= this.options.maxDuration) {
          console.log('[AudioRecorder] Max duration reached, stopping...');
          this.stop();
        }
      }, 100);

      console.log('[AudioRecorder] 🎙️ Recording started');

    } catch (error) {
      console.error('[AudioRecorder] ❌ Failed to start:', error);
      this.setState('error');
      this.handlers.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Arrêter l'enregistrement
   */
  stop(): void {
    if (this.state !== 'recording' || !this.mediaRecorder) {
      console.warn('[AudioRecorder] Not recording');
      return;
    }

    console.log('[AudioRecorder] 🛑 Stopping...');
    
    // Stopper le timer
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }

    // Calculer la durée finale
    this.duration = Math.floor((Date.now() - this.startTime) / 1000);

    // Stopper le MediaRecorder (déclenche onstop)
    if (this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Annuler l'enregistrement
   */
  cancel(): void {
    console.log('[AudioRecorder] ❌ Cancelling...');
    
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    this.chunks = [];
    this.cleanup();
    this.setState('idle');
  }

  /**
   * Traiter la fin de l'enregistrement
   */
  private handleRecordingComplete(): void {
    const totalSize = this.chunks.reduce((acc, b) => acc + b.size, 0);
    console.log('[AudioRecorder] 📦 Creating blob:', {
      chunks: this.chunks.length,
      totalSize: totalSize + ' bytes',
      duration: this.duration + 's'
    });

    if (this.chunks.length === 0 || totalSize === 0) {
      console.error('[AudioRecorder] ❌ No audio data captured!');
      this.setState('error');
      this.handlers.onError?.(new Error('No audio data captured'));
      this.cleanup();
      return;
    }

    // Créer le blob final
    const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
    const blob = new Blob(this.chunks, { type: mimeType });

    console.log('[AudioRecorder] ✅ Recording complete:', {
      size: blob.size,
      type: blob.type,
      duration: this.duration
    });

    this.setState('stopped');
    this.handlers.onComplete?.(blob, this.duration);
    this.cleanup();
  }

  /**
   * Nettoyer les ressources
   */
  private cleanup(): void {
    // Ne pas libérer le stream ici car AudioManager le gère
    this.mediaRecorder = null;
    this.stream = null;
  }

  /**
   * Libérer toutes les ressources (à appeler lors du démontage)
   */
  dispose(): void {
    this.cancel();
    AudioManager.releaseStream();
  }
}
