import { useState, useRef, useCallback, useEffect } from 'react';
import logger from '@/infra/logger';
import { useAudioLevel } from './useAudioLevel';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  error: string | null;
  isSupported: boolean;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  audioLevel: number;
  peakLevel: number;
  isClipping: boolean;
}

// Détecter les formats audio supportés
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/mpeg',
  ];
  
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      logger.debug(`Audio format supported: ${type}`, { module: 'useAudioRecorder' });
      return type;
    }
  }
  
  logger.warn('No preferred audio format supported, using default', { module: 'useAudioRecorder' });
  return '';
}

// Vérifier si l'enregistrement audio est supporté
function checkAudioSupport(): boolean {
  const hasMediaDevices = typeof navigator !== 'undefined' && 
                          navigator.mediaDevices && 
                          typeof navigator.mediaDevices.getUserMedia === 'function';
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
  
  logger.debug(`Audio support check - MediaDevices: ${hasMediaDevices}, MediaRecorder: ${hasMediaRecorder}`, { 
    module: 'useAudioRecorder' 
  });
  
  return hasMediaDevices && hasMediaRecorder;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(() => checkAudioSupport());
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');

  // Analyse de niveau audio en temps réel
  const { audioLevel, peakLevel, isClipping, startAnalysis, stopAnalysis } = useAudioLevel();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRecordingRef = useRef<(() => void) | null>(null);

  // Vérifier les permissions au montage
  useEffect(() => {
    async function checkPermissions() {
      if (!isSupported) return;
      
      try {
        // Vérifier le statut des permissions si disponible
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
          
          result.addEventListener('change', () => {
            setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
          });
        }
      } catch (err) {
        logger.debug('Cannot query microphone permissions', { module: 'useAudioRecorder' });
      }
    }
    
    checkPermissions();
  }, [isSupported]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const msg = "L'enregistrement audio n'est pas supporté par ce navigateur";
      setError(msg);
      logger.error(msg, null, { module: 'useAudioRecorder' });
      return;
    }

    try {
      setError(null);
      chunksRef.current = [];
      
      logger.info('Requesting microphone access...', { module: 'useAudioRecorder' });

      // Demander l'accès au microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      setPermissionStatus('granted');
      logger.info('Microphone access granted', { module: 'useAudioRecorder' });

      // Démarrer l'analyse de niveau audio
      startAnalysis(stream);

      // Trouver le format supporté
      const mimeType = getSupportedMimeType();
      
      // Créer le MediaRecorder
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      logger.debug(`MediaRecorder created with mimeType: ${mediaRecorder.mimeType}`, { 
        module: 'useAudioRecorder' 
      });

      // Collecter les données audio
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          logger.debug(`Audio chunk received: ${e.data.size} bytes`, { module: 'useAudioRecorder' });
        }
      };

      // Quand l'enregistrement s'arrête
      mediaRecorder.onstop = () => {
        logger.info(`Recording stopped. Total chunks: ${chunksRef.current.length}`, { 
          module: 'useAudioRecorder' 
        });
        
        if (chunksRef.current.length === 0) {
          setError("Aucune donnée audio capturée");
          logger.error('No audio data captured', null, { module: 'useAudioRecorder' });
          return;
        }

        const mimeTypeToUse = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeTypeToUse });
        
        logger.info(`Audio blob created: ${blob.size} bytes, type: ${blob.type}`, { 
          module: 'useAudioRecorder' 
        });
        
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Arrêter toutes les pistes
        stream.getTracks().forEach(track => {
          track.stop();
          logger.debug(`Audio track stopped: ${track.kind}`, { module: 'useAudioRecorder' });
        });
        streamRef.current = null;
      };

      // Gérer les erreurs
      mediaRecorder.onerror = (event) => {
        const errorMsg = (event as any).error?.message || 'Erreur inconnue lors de l\'enregistrement';
        logger.error('MediaRecorder error', event, { module: 'useAudioRecorder' });
        setError(errorMsg);
        setIsRecording(false);
      };

      // Démarrer l'enregistrement
      mediaRecorder.start(500); // Collecter toutes les 500ms
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setDuration(0);

      logger.info('Recording started', { module: 'useAudioRecorder' });

      // Timer pour la durée
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        
        // Auto-stop après 30 secondes
        if (elapsed >= 30) {
          logger.info('Auto-stopping recording after 30 seconds', { module: 'useAudioRecorder' });
          stopRecordingRef.current?.();
        }
      }, 100);

    } catch (err) {
      const error = err as Error;
      logger.error('Error starting recording', error, { module: 'useAudioRecorder' });
      
      let errorMessage = "Impossible de démarrer l'enregistrement";
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres du navigateur.";
        setPermissionStatus('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "Aucun microphone détecté. Vérifiez votre matériel.";
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = "Le microphone est utilisé par une autre application.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = "Les paramètres audio demandés ne sont pas supportés.";
      } else if (error.name === 'SecurityError') {
        errorMessage = "L'enregistrement audio n'est pas autorisé sur cette page (HTTPS requis).";
      }
      
      setError(errorMessage);
      setIsRecording(false);
    }
  }, [isSupported, startAnalysis]);

  const stopRecording = useCallback(() => {
    logger.info('Stop recording requested', { module: 'useAudioRecorder' });
    
    // Arrêter l'analyse de niveau audio
    stopAnalysis();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        logger.debug('MediaRecorder.stop() called', { module: 'useAudioRecorder' });
      } catch (err) {
        logger.error('Error stopping MediaRecorder', err, { module: 'useAudioRecorder' });
      }
    }
    
    setIsRecording(false);
  }, [stopAnalysis]);

  // Garder la référence à jour pour l'auto-stop
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const resetRecording = useCallback(() => {
    logger.debug('Resetting recording state', { module: 'useAudioRecorder' });
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setError(null);
    chunksRef.current = [];
  }, [audioUrl]);

  return {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
    error,
    isSupported,
    permissionStatus,
    audioLevel,
    peakLevel,
    isClipping
  };
}
