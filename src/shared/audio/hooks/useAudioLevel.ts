/**
 * useAudioLevel - Hook React pour l'analyse du niveau audio
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioAnalyzerService, AudioLevelData, AudioLevelStatus } from '../analysis/AudioAnalyzer';
import { AudioManager } from '../core/AudioManager';
import { AudioLevelConfig } from '../core/types';

export interface UseAudioLevelReturn {
  level: number;
  smoothedLevel: number;
  status: AudioLevelStatus;
  isClipping: boolean;
  isAnalyzing: boolean;
  startAnalysis: (stream?: MediaStream) => Promise<void>;
  stopAnalysis: () => void;
}

export function useAudioLevel(config: Partial<AudioLevelConfig> = {}): UseAudioLevelReturn {
  const [levelData, setLevelData] = useState<AudioLevelData>({
    level: 0,
    smoothedLevel: 0,
    status: 'silence',
    isClipping: false,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const analyzerRef = useRef<AudioAnalyzerService | null>(null);

  // Initialiser l'analyseur
  useEffect(() => {
    analyzerRef.current = new AudioAnalyzerService(config);

    return () => {
      analyzerRef.current?.stop();
    };
  }, []); // Config intentionnellement omise

  const startAnalysis = useCallback(async (providedStream?: MediaStream) => {
    if (isAnalyzing) {
      console.warn('[useAudioLevel] Already analyzing');
      return;
    }

    try {
      // Utiliser le stream fourni ou en demander un nouveau
      const stream = providedStream || await AudioManager.requestMicrophoneAccess();
      
      analyzerRef.current?.start(stream, (data) => {
        setLevelData(data);
      });
      
      setIsAnalyzing(true);
    } catch (error) {
      console.error('[useAudioLevel] Failed to start:', error);
      throw error;
    }
  }, [isAnalyzing]);

  const stopAnalysis = useCallback(() => {
    analyzerRef.current?.stop();
    setIsAnalyzing(false);
    setLevelData({
      level: 0,
      smoothedLevel: 0,
      status: 'silence',
      isClipping: false,
    });
  }, []);

  return {
    level: levelData.level,
    smoothedLevel: levelData.smoothedLevel,
    status: levelData.status,
    isClipping: levelData.isClipping,
    isAnalyzing,
    startAnalysis,
    stopAnalysis,
  };
}
