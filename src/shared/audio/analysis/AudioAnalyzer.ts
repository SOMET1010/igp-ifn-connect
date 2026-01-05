/**
 * AudioAnalyzer - Service d'analyse du niveau audio
 * 
 * Fonctionnalités:
 * - Lissage du niveau (moyenne glissante)
 * - Détection silence/faible/normal
 * - Détection clipping
 */

import { AudioManager } from '../core/AudioManager';
import { AudioLevelConfig, DEFAULT_AUDIO_LEVEL_CONFIG } from '../core/types';

export type AudioLevelStatus = 'silence' | 'low' | 'good' | 'clipping';

export interface AudioLevelData {
  level: number; // 0-1
  smoothedLevel: number; // 0-1 lissé
  status: AudioLevelStatus;
  isClipping: boolean;
}

export class AudioAnalyzerService {
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private animationId: number | null = null;
  private config: AudioLevelConfig;
  private levelHistory: number[] = [];
  private isAnalyzing: boolean = false;
  private onLevelUpdate: ((data: AudioLevelData) => void) | null = null;

  constructor(config: Partial<AudioLevelConfig> = {}) {
    this.config = { ...DEFAULT_AUDIO_LEVEL_CONFIG, ...config };
  }

  /**
   * Démarrer l'analyse d'un stream
   */
  start(stream: MediaStream, onUpdate: (data: AudioLevelData) => void): void {
    if (this.isAnalyzing) {
      console.warn('[AudioAnalyzer] Already analyzing');
      return;
    }

    console.log('[AudioAnalyzer] 📊 Starting analysis');

    try {
      const audioContext = AudioManager.getAudioContext();
      
      this.analyser = audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.source = audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.onLevelUpdate = onUpdate;
      this.levelHistory = [];
      this.isAnalyzing = true;

      this.analyze();
    } catch (error) {
      console.error('[AudioAnalyzer] ❌ Failed to start:', error);
      throw error;
    }
  }

  /**
   * Arrêter l'analyse
   */
  stop(): void {
    console.log('[AudioAnalyzer] 🛑 Stopping analysis');
    
    this.isAnalyzing = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.onLevelUpdate = null;
    this.levelHistory = [];
  }

  /**
   * Boucle d'analyse
   */
  private analyze = (): void => {
    if (!this.isAnalyzing || !this.analyser || !this.dataArray) {
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculer le niveau moyen
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;
    const level = average / 255; // Normaliser entre 0 et 1

    // Ajouter à l'historique pour le lissage
    this.levelHistory.push(level);
    
    // Garder seulement les N dernières valeurs pour le lissage
    const historySize = Math.ceil((this.config.smoothingWindow || 200) / 16); // ~60fps
    if (this.levelHistory.length > historySize) {
      this.levelHistory.shift();
    }

    // Calculer le niveau lissé
    const smoothedLevel = this.levelHistory.reduce((a, b) => a + b, 0) / this.levelHistory.length;

    // Déterminer le statut
    const status = this.getStatus(smoothedLevel);
    const isClipping = level > 0.95;

    // Callback
    this.onLevelUpdate?.({
      level,
      smoothedLevel,
      status,
      isClipping,
    });

    // Continuer l'analyse
    this.animationId = requestAnimationFrame(this.analyze);
  };

  /**
   * Déterminer le statut du niveau
   */
  private getStatus(level: number): AudioLevelStatus {
    const { silenceThreshold = 0.03, lowThreshold = 0.08 } = this.config;

    if (level > 0.95) return 'clipping';
    if (level < silenceThreshold) return 'silence';
    if (level < lowThreshold) return 'low';
    return 'good';
  }

  /**
   * Vérifier si l'analyse est active
   */
  isActive(): boolean {
    return this.isAnalyzing;
  }
}
