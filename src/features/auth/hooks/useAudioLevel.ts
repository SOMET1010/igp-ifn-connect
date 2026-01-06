/**
 * useAudioLevel - Mesure du niveau audio du microphone en temps réel
 * 
 * Version industrielle avec :
 * - Lissage (moyenne glissante 150-200ms)
 * - Seuils catégorisés (silence/weak/ok)
 * - Détection silence prolongé
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { getAudioContextConstructor } from '@/shared/types';

export type AudioStatus = 'silence' | 'weak' | 'ok';

interface UseAudioLevelOptions {
  /** @deprecated Utiliser silenceThreshold */
  threshold?: number;
  /** Seuil silence (0-1), défaut 0.03 */
  silenceThreshold?: number;
  /** Seuil faible (0-1), défaut 0.08 */
  weakThreshold?: number;
  /** Intervalle de mise à jour en ms */
  updateInterval?: number;
  /** Facteur de lissage (0-1), plus haut = plus lisse */
  smoothingFactor?: number;
}

interface UseAudioLevelReturn {
  /** Niveau audio brut (0-1) */
  level: number;
  /** Niveau audio lissé (0-1) */
  smoothedLevel: number;
  /** Statut catégorisé */
  audioStatus: AudioStatus;
  /** Durée du silence en ms */
  silenceDuration: number;
  /** Indique si le micro capte du son au-dessus du seuil silence */
  isReceivingAudio: boolean;
  /** Démarrer l'analyse audio */
  startAnalyzing: (stream: MediaStream) => void;
  /** Arrêter l'analyse */
  stopAnalyzing: () => void;
  /** Historique des niveaux lissés (pour visualisation) */
  levelHistory: number[];
}

export function useAudioLevel(options: UseAudioLevelOptions = {}): UseAudioLevelReturn {
  const { 
    threshold, // Rétro-compatibilité
    silenceThreshold = threshold ?? 0.03, 
    weakThreshold = 0.08,
    updateInterval = 50,
    smoothingFactor = 0.3
  } = options;
  
  const [level, setLevel] = useState(0);
  const [smoothedLevel, setSmoothedLevel] = useState(0);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('silence');
  const [silenceDuration, setSilenceDuration] = useState(0);
  const [isReceivingAudio, setIsReceivingAudio] = useState(false);
  const [levelHistory, setLevelHistory] = useState<number[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const smoothedLevelRef = useRef(0);
  const lastSoundTimeRef = useRef<number>(Date.now());
  const isCleanedUpRef = useRef(false);
  
  // Cleanup stable - ne pas utiliser useCallback pour éviter les dépendances instables
  const cleanupImpl = () => {
    // Toujours nettoyer (même si déjà "clean") pour éviter les intervalles orphelins

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      sourceRef.current = null;
    }
    
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      analyserRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    
    // Reset all state
    setLevel(0);
    setSmoothedLevel(0);
    setAudioStatus('silence');
    setSilenceDuration(0);
    setIsReceivingAudio(false);
    setLevelHistory([]);
    smoothedLevelRef.current = 0;
  };
  
  // Ref stable pour cleanup
  const cleanupRef = useRef(cleanupImpl);
  cleanupRef.current = cleanupImpl;
  
  const startAnalyzing = useCallback((stream: MediaStream) => {
    cleanupRef.current();
    isCleanedUpRef.current = false;
    
    try {
      const AudioContextClass = getAudioContextConstructor();
      if (!AudioContextClass) return;
      const audioContext = new AudioContextClass();
      // Sur iOS/Safari, l'AudioContext peut démarrer "suspended"
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      lastSoundTimeRef.current = Date.now();
      
      const analyze = () => {
        if (!analyserRef.current || isCleanedUpRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculer le niveau moyen (RMS approximatif)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const rawLevel = Math.min(1, rms / 128);
        
        // Lissage exponentiel
        const prevSmoothed = smoothedLevelRef.current;
        const newSmoothed = prevSmoothed * smoothingFactor + rawLevel * (1 - smoothingFactor);
        smoothedLevelRef.current = newSmoothed;
        
        setLevel(rawLevel);
        setSmoothedLevel(newSmoothed);
        
        // Déterminer le statut
        let status: AudioStatus = 'silence';
        if (newSmoothed >= weakThreshold) {
          status = 'ok';
          lastSoundTimeRef.current = Date.now();
        } else if (newSmoothed >= silenceThreshold) {
          status = 'weak';
          lastSoundTimeRef.current = Date.now();
        }
        
        setAudioStatus(status);
        setIsReceivingAudio(newSmoothed >= silenceThreshold);
        
        // Calculer la durée du silence
        const silenceMs = Date.now() - lastSoundTimeRef.current;
        setSilenceDuration(silenceMs);
        
        // Historique (dernières 20 valeurs)
        setLevelHistory(prev => {
          const newHistory = [...prev, newSmoothed];
          if (newHistory.length > 20) {
            return newHistory.slice(-20);
          }
          return newHistory;
        });
      };
      
      intervalRef.current = setInterval(analyze, updateInterval);
      
      console.log('[AudioLevel] Started analyzing with smoothing');
    } catch (err) {
      console.error('[AudioLevel] Failed to start:', err);
      cleanupRef.current();
    }
  }, [silenceThreshold, weakThreshold, updateInterval, smoothingFactor]);
  
  const stopAnalyzing = useCallback(() => {
    if (isCleanedUpRef.current) return;
    isCleanedUpRef.current = true;
    console.log('[AudioLevel] Stopping');
    cleanupRef.current();
  }, []);
  
  // Cleanup on unmount - pas de dépendance pour éviter la boucle
  useEffect(() => {
    return () => {
      isCleanedUpRef.current = true;
      cleanupRef.current();
    };
  }, []);
  
  return {
    level,
    smoothedLevel,
    audioStatus,
    silenceDuration,
    isReceivingAudio,
    startAnalyzing,
    stopAnalyzing,
    levelHistory,
  };
}

export default useAudioLevel;
