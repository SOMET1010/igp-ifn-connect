/**
 * useRecorder - Hook React pour l'enregistrement audio
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioRecorderService, RecorderEventHandlers } from '../recording/AudioRecorder';
import { RecorderOptions, RecorderState } from '../core/types';

export interface UseRecorderReturn {
  state: RecorderState;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  start: () => Promise<void>;
  stop: () => void;
  cancel: () => void;
  reset: () => void;
}

export function useRecorder(options: Partial<RecorderOptions> = {}): UseRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const recorderRef = useRef<AudioRecorderService | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Initialiser le recorder
  useEffect(() => {
    recorderRef.current = new AudioRecorderService(options);
    
    const handlers: RecorderEventHandlers = {
      onStateChange: setState,
      onDurationUpdate: setDuration,
      onComplete: (blob, dur) => {
        // Révoquer l'ancienne URL
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
        
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        setAudioBlob(blob);
        setAudioUrl(url);
        setDuration(dur);
      },
      onError: (error) => {
        console.error('[useRecorder] Error:', error);
      },
    };
    
    recorderRef.current.setHandlers(handlers);

    return () => {
      recorderRef.current?.dispose();
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []); // Options intentionnellement omises pour éviter les re-créations

  const start = useCallback(async () => {
    // Reset avant de démarrer
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    
    await recorderRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const cancel = useCallback(() => {
    recorderRef.current?.cancel();
    
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
  }, []);

  const reset = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setState('idle');
  }, []);

  return {
    state,
    duration,
    audioBlob,
    audioUrl,
    start,
    stop,
    cancel,
    reset,
  };
}
