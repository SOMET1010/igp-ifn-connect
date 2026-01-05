/**
 * AudioManager - Singleton central pour la gestion audio
 * 
 * Responsabilités:
 * - Gestion centralisée des permissions microphone
 * - Cache du MediaStream actif
 * - Cleanup automatique des ressources
 * - Détection des capacités audio du navigateur
 */

import { AudioCapabilities, MicrophonePermissionState, PREFERRED_MIME_TYPES } from './types';

class AudioManagerClass {
  private static instance: AudioManagerClass | null = null;
  
  private activeStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private permissionState: MicrophonePermissionState = {
    granted: false,
    denied: false,
    prompt: true,
  };
  
  private constructor() {
    // Écouter les changements de permission
    this.setupPermissionListener();
  }

  static getInstance(): AudioManagerClass {
    if (!AudioManagerClass.instance) {
      AudioManagerClass.instance = new AudioManagerClass();
    }
    return AudioManagerClass.instance;
  }

  /**
   * Obtenir les capacités audio du navigateur
   */
  getCapabilities(): AudioCapabilities {
    const supportedMimeTypes = PREFERRED_MIME_TYPES.filter(type => 
      typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)
    );

    return {
      hasMediaRecorder: typeof MediaRecorder !== 'undefined',
      hasGetUserMedia: !!(navigator.mediaDevices?.getUserMedia),
      hasSpeechSynthesis: 'speechSynthesis' in window,
      supportedMimeTypes,
    };
  }

  /**
   * Obtenir le meilleur mime type supporté
   */
  getBestMimeType(): string | undefined {
    const caps = this.getCapabilities();
    return caps.supportedMimeTypes[0];
  }

  /**
   * Configurer l'écouteur de permission
   */
  private async setupPermissionListener(): Promise<void> {
    try {
      if (navigator.permissions) {
        const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        this.updatePermissionState(status.state);
        
        status.addEventListener('change', () => {
          this.updatePermissionState(status.state);
        });
      }
    } catch (error) {
      console.debug('[AudioManager] Permission API non supportée');
    }
  }

  private updatePermissionState(state: PermissionState): void {
    this.permissionState = {
      granted: state === 'granted',
      denied: state === 'denied',
      prompt: state === 'prompt',
    };
    console.log('[AudioManager] Permission state:', state);
  }

  /**
   * Obtenir l'état actuel des permissions
   */
  getPermissionState(): MicrophonePermissionState {
    return { ...this.permissionState };
  }

  /**
   * Demander l'accès au microphone
   */
  async requestMicrophoneAccess(constraints?: MediaTrackConstraints): Promise<MediaStream> {
    console.log('[AudioManager] 🎤 Requesting microphone access...');
    
    // Si un stream existe déjà et est actif, le réutiliser
    if (this.activeStream && this.activeStream.active) {
      console.log('[AudioManager] ♻️ Reusing existing stream');
      return this.activeStream;
    }

    // Cleanup de l'ancien stream si nécessaire
    this.releaseStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: constraints || {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.activeStream = stream;
      this.permissionState.granted = true;
      this.permissionState.denied = false;
      this.permissionState.prompt = false;

      console.log('[AudioManager] ✅ Microphone access granted');
      return stream;
    } catch (error) {
      console.error('[AudioManager] ❌ Microphone access denied:', error);
      
      if ((error as DOMException).name === 'NotAllowedError') {
        this.permissionState.denied = true;
        this.permissionState.granted = false;
      }
      
      throw error;
    }
  }

  /**
   * Obtenir le stream actif (sans en créer un nouveau)
   */
  getActiveStream(): MediaStream | null {
    if (this.activeStream?.active) {
      return this.activeStream;
    }
    return null;
  }

  /**
   * Obtenir ou créer un AudioContext
   */
  getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Reprendre si suspendu
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    return this.audioContext;
  }

  /**
   * Libérer le stream actif
   */
  releaseStream(): void {
    if (this.activeStream) {
      console.log('[AudioManager] 🧹 Releasing stream');
      this.activeStream.getTracks().forEach(track => {
        track.stop();
        console.log('[AudioManager] Track stopped:', track.kind);
      });
      this.activeStream = null;
    }
  }

  /**
   * Libérer toutes les ressources audio
   */
  releaseAll(): void {
    console.log('[AudioManager] 🧹 Releasing all audio resources');
    
    this.releaseStream();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Stopper la synthèse vocale
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Vérifier si le microphone est disponible
   */
  async checkMicrophoneAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'audioinput');
    } catch {
      return false;
    }
  }
}

// Export le singleton avec des méthodes statiques pratiques
const instance = AudioManagerClass.getInstance();

export const AudioManager = {
  getInstance: () => instance,
  getCapabilities: () => instance.getCapabilities(),
  getBestMimeType: () => instance.getBestMimeType(),
  getPermissionState: () => instance.getPermissionState(),
  requestMicrophoneAccess: (constraints?: MediaTrackConstraints) => instance.requestMicrophoneAccess(constraints),
  getActiveStream: () => instance.getActiveStream(),
  getAudioContext: () => instance.getAudioContext(),
  releaseStream: () => instance.releaseStream(),
  releaseAll: () => instance.releaseAll(),
  checkMicrophoneAvailable: () => instance.checkMicrophoneAvailable(),
};
