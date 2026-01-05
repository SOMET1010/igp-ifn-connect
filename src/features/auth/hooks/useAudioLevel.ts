/**
 * useAudioLevel - Mesure du niveau audio du microphone en temps réel
 * 
 * Fournit un feedback visuel que le micro capte bien du son.
 * Utilise l'API Web Audio pour analyser le flux audio.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioLevelOptions {
  /** Seuil minimum pour considérer qu'il y a du son (0-1) */
  threshold?: number;
  /** Intervalle de mise à jour en ms */
  updateInterval?: number;
}

interface UseAudioLevelReturn {
  /** Niveau audio actuel (0-1) */
  level: number;
  /** Indique si le micro capte du son au-dessus du seuil */
  isReceivingAudio: boolean;
  /** Démarrer l'analyse audio */
  startAnalyzing: (stream: MediaStream) => void;
  /** Arrêter l'analyse */
  stopAnalyzing: () => void;
  /** Historique des niveaux récents (pour visualisation) */
  levelHistory: number[];
}

export function useAudioLevel(options: UseAudioLevelOptions = {}): UseAudioLevelReturn {
  const { threshold = 0.02, updateInterval = 50 } = options;
  
  const [level, setLevel] = useState(0);
  const [isReceivingAudio, setIsReceivingAudio] = useState(false);
  const [levelHistory, setLevelHistory] = useState<number[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    
    setLevel(0);
    setIsReceivingAudio(false);
    setLevelHistory([]);
  }, []);
  
  const startAnalyzing = useCallback((stream: MediaStream) => {
    cleanup();
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const analyze = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculer le niveau moyen (RMS approximatif)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const normalizedLevel = Math.min(1, rms / 128); // Normaliser à 0-1
        
        setLevel(normalizedLevel);
        setIsReceivingAudio(normalizedLevel > threshold);
        
        // Garder un historique pour la visualisation (dernières 20 valeurs)
        setLevelHistory(prev => {
          const newHistory = [...prev, normalizedLevel];
          if (newHistory.length > 20) {
            return newHistory.slice(-20);
          }
          return newHistory;
        });
      };
      
      // Utiliser setInterval pour des mises à jour régulières
      intervalRef.current = setInterval(analyze, updateInterval);
      
      console.log('[AudioLevel] Started analyzing');
    } catch (err) {
      console.error('[AudioLevel] Failed to start:', err);
      cleanup();
    }
  }, [cleanup, threshold, updateInterval]);
  
  const stopAnalyzing = useCallback(() => {
    console.log('[AudioLevel] Stopping');
    cleanup();
  }, [cleanup]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);
  
  return {
    level,
    isReceivingAudio,
    startAnalyzing,
    stopAnalyzing,
    levelHistory,
  };
}

export default useAudioLevel;
