import { useState, useRef, useCallback, useEffect } from 'react';
import logger from '@/infra/logger';

interface UseAudioLevelOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
}

interface UseAudioLevelReturn {
  audioLevel: number;
  peakLevel: number;
  isClipping: boolean;
  startAnalysis: (stream: MediaStream) => void;
  stopAnalysis: () => void;
}

export function useAudioLevel(options: UseAudioLevelOptions = {}): UseAudioLevelReturn {
  const {
    fftSize = 256,
    smoothingTimeConstant = 0.8,
    minDecibels = -90,
    maxDecibels = -10
  } = options;

  const [audioLevel, setAudioLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [isClipping, setIsClipping] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const peakHoldRef = useRef<number>(0);
  const peakDecayRef = useRef<number>(0);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    // Utiliser any pour contourner le problème de compatibilité ArrayBufferLike
    (analyserRef.current as any).getByteFrequencyData(dataArrayRef.current);

    // Calculer le niveau moyen
    let sum = 0;
    let max = 0;
    const data = dataArrayRef.current;
    const length = data.length;

    for (let i = 0; i < length; i++) {
      const value = data[i];
      sum += value;
      if (value > max) max = value;
    }

    const average = sum / length;
    const level = Math.round((average / 255) * 100);
    const peak = Math.round((max / 255) * 100);

    setAudioLevel(level);

    // Gestion du peak avec decay
    if (peak > peakHoldRef.current) {
      peakHoldRef.current = peak;
      peakDecayRef.current = 0;
    } else {
      peakDecayRef.current += 1;
      if (peakDecayRef.current > 30) {
        peakHoldRef.current = Math.max(0, peakHoldRef.current - 2);
      }
    }
    setPeakLevel(peakHoldRef.current);

    // Détection du clipping (niveau > 95%)
    setIsClipping(max > 242);

    animationFrameRef.current = requestAnimationFrame(analyze);
  }, []);

  const startAnalysis = useCallback((stream: MediaStream) => {
    try {
      logger.debug('Starting audio level analysis', { module: 'useAudioLevel' });

      // Créer le contexte audio
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        logger.warn('AudioContext not supported', { module: 'useAudioLevel' });
        return;
      }

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Créer l'analyseur
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothingTimeConstant;
      analyser.minDecibels = minDecibels;
      analyser.maxDecibels = maxDecibels;
      analyserRef.current = analyser;

      // Créer le buffer pour les données
      const bufferLength = analyser.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Connecter le stream à l'analyseur
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      // Démarrer l'animation
      peakHoldRef.current = 0;
      peakDecayRef.current = 0;
      animationFrameRef.current = requestAnimationFrame(analyze);

      logger.info('Audio level analysis started', { module: 'useAudioLevel' });
    } catch (error) {
      logger.error('Failed to start audio level analysis', error, { module: 'useAudioLevel' });
    }
  }, [fftSize, smoothingTimeConstant, minDecibels, maxDecibels, analyze]);

  const stopAnalysis = useCallback(() => {
    logger.debug('Stopping audio level analysis', { module: 'useAudioLevel' });

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    dataArrayRef.current = null;

    setAudioLevel(0);
    setPeakLevel(0);
    setIsClipping(false);
    peakHoldRef.current = 0;
    peakDecayRef.current = 0;
  }, []);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  return {
    audioLevel,
    peakLevel,
    isClipping,
    startAnalysis,
    stopAnalysis
  };
}
