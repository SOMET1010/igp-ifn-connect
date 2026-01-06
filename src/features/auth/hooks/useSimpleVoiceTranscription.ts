/**
 * useSimpleVoiceTranscription - Hook simplifié pour transcription vocale
 * 
 * Utilise Web Speech API native avec analyse audio intégrée directement.
 * Structure de hooks 100% stable pour éviter les erreurs React.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  getSpeechRecognitionConstructor, 
  type SpeechRecognition, 
  type SpeechRecognitionEvent,
  type SpeechRecognitionErrorEvent 
} from '@/shared/types';

// === TYPES ===
export type VoiceState = 'idle' | 'connecting' | 'listening' | 'processing' | 'error';
export type AudioStatus = 'silence' | 'weak' | 'ok';

// === HELPERS ===
const WORD_TO_DIGIT: Record<string, string> = {
  'zéro': '0', 'zero': '0',
  'un': '1', 'une': '1',
  'deux': '2',
  'trois': '3',
  'quatre': '4',
  'cinq': '5',
  'six': '6',
  'sept': '7',
  'huit': '8',
  'neuf': '9',
  'dix': '10',
};

function convertWordsToDigits(text: string): string {
  let result = text.toLowerCase();
  Object.entries(WORD_TO_DIGIT).forEach(([word, digit]) => {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), digit);
  });
  return result;
}

function extractPhoneNumber(text: string): string | null {
  const converted = convertWordsToDigits(text);
  const digitsOnly = converted.replace(/\D/g, '');
  
  // Numéro ivoirien : 10 chiffres commençant par 0
  if (digitsOnly.length >= 10) {
    const last10 = digitsOnly.slice(-10);
    if (last10.startsWith('0')) {
      return last10;
    }
  }
  
  // 8 chiffres sans le 0 initial
  if (digitsOnly.length === 8 && /^[1579]/.test(digitsOnly)) {
    return '0' + digitsOnly;
  }
  
  // Retourner les chiffres extraits (même incomplets)
  return digitsOnly.length > 0 ? digitsOnly : null;
}

// === INTERFACE ===
interface UseSimpleVoiceTranscriptionOptions {
  onPhoneDetected: (phone: string) => void;
  onError?: (error: string) => void;
  onDigitsProgress?: (digits: string, count: number) => void;
}

// === HOOK PRINCIPAL ===
export function useSimpleVoiceTranscription({
  onPhoneDetected,
  onError,
  onDigitsProgress,
}: UseSimpleVoiceTranscriptionOptions) {
  // === ÉTATS (ordre fixe - 6 états) ===
  const [transcript, setTranscript] = useState('');
  const [extractedDigits, setExtractedDigits] = useState('');
  const [state, setState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isReceivingAudio, setIsReceivingAudio] = useState(false);

  // === REFS (ordre fixe - 10 refs) ===
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasDetectedRef = useRef(false);
  const hasErroredRef = useRef(false);
  const wantsToListenRef = useRef(false);
  const transcriptRef = useRef('');

  // === CLEANUP (1 useCallback) ===
  const cleanup = useCallback(() => {
    console.log('[SimpleSTT] 🧹 Cleanup');

    // Stop audio interval
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }

    // Stop timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    // Stop audio context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // ignore
      }
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
    setAudioLevel(0);
    setIsReceivingAudio(false);
  }, []);

  // === HANDLE RESULT (1 useCallback) ===
  const handleResult = useCallback((text: string) => {
    console.log('[SimpleSTT] 📝 Result:', text);
    transcriptRef.current = text;
    setTranscript(text);

    if (hasDetectedRef.current) return;

    const converted = convertWordsToDigits(text);
    const digitsOnly = converted.replace(/\D/g, '').slice(0, 10);
    setExtractedDigits(digitsOnly);

    if (digitsOnly.length > 0) {
      onDigitsProgress?.(digitsOnly, digitsOnly.length);
    }

    const phone = extractPhoneNumber(text);
    if (phone && phone.length >= 10) {
      console.log('[SimpleSTT] 📱 Phone detected:', phone);
      hasDetectedRef.current = true;
      wantsToListenRef.current = false;
      cleanup();
      onPhoneDetected(phone);
      setState('processing');
    }
  }, [onPhoneDetected, onDigitsProgress, cleanup]);

  // === NOTIFY ERROR (1 useCallback) ===
  const notifyError = useCallback((msg: string) => {
    if (hasErroredRef.current) return;
    hasErroredRef.current = true;
    
    setErrorMessage(msg);
    setState('error');
    onError?.(msg);
  }, [onError]);

  // === START LISTENING (1 useCallback) ===
  const startListening = useCallback(async (): Promise<boolean> => {
    console.log('[SimpleSTT] 🎬 Starting...');
    
    // Reset flags
    hasErroredRef.current = false;
    hasDetectedRef.current = false;
    wantsToListenRef.current = true;

    // Reset state
    setTranscript('');
    transcriptRef.current = '';
    setExtractedDigits('');
    setErrorMessage(null);
    cleanup();

    // Check iframe
    try {
      if (window.self !== window.top) {
        notifyError("Le micro ne fonctionne pas dans l'aperçu. Ouvre en plein écran.");
        wantsToListenRef.current = false;
        return false;
      }
    } catch {
      notifyError("Le micro ne fonctionne pas dans l'aperçu. Ouvre en plein écran.");
      wantsToListenRef.current = false;
      return false;
    }

    // Check browser support
    const SpeechRecognitionClass = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionClass) {
      notifyError("Ton navigateur ne supporte pas la reconnaissance vocale.");
      wantsToListenRef.current = false;
      return false;
    }

    setState('connecting');

    try {
      // Get microphone access
      console.log('[SimpleSTT] 🎤 Requesting microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      console.log('[SimpleSTT] ✅ Microphone granted');

      // Setup audio analysis (inline, no separate hook)
      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        // Start audio level monitoring
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        audioIntervalRef.current = setInterval(() => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((a, b) => a + b, 0);
            const avg = sum / dataArray.length / 255;
            setAudioLevel(avg);
            setIsReceivingAudio(avg > 0.02);
          }
        }, 50);
        
        console.log('[SimpleSTT] 📊 Audio analysis started');
      } catch (audioError) {
        console.warn('[SimpleSTT] ⚠️ Audio analysis failed:', audioError);
        // Continue without audio analysis
      }

      // Setup speech recognition
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        console.log('[SimpleSTT] 🎤 Recognition started - PARLE MAINTENANT');
        setState('listening');
      };

      recognition.onaudiostart = () => {
        console.log('[SimpleSTT] 🔊 Audio capture started');
      };

      recognition.onspeechstart = () => {
        console.log('[SimpleSTT] 🗣️ Speech detected!');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        handleResult(text);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('[SimpleSTT] ⚠️ Error:', event.error);

        if (event.error === 'aborted') {
          return;
        }

        // no-speech: auto-restart
        if (event.error === 'no-speech') {
          console.log('[SimpleSTT] 🔄 No speech, will restart on end...');
          return;
        }

        let msg = 'Erreur vocale';
        switch (event.error) {
          case 'not-allowed':
            msg = 'Autorise le micro dans les paramètres du navigateur.';
            break;
          case 'network':
            msg = 'Problème de connexion. Vérifie ton internet.';
            break;
          case 'audio-capture':
            msg = 'Problème de capture audio. Vérifie ton micro.';
            break;
        }

        wantsToListenRef.current = false;
        cleanup();
        notifyError(msg);
      };

      recognition.onend = () => {
        console.log('[SimpleSTT] 🔚 Recognition ended');

        if (!wantsToListenRef.current || hasDetectedRef.current || hasErroredRef.current) {
          setState(hasDetectedRef.current ? 'processing' : (hasErroredRef.current ? 'error' : 'idle'));
          return;
        }

        // Try to extract phone from last transcript
        const last = transcriptRef.current;
        if (last) {
          const phone = extractPhoneNumber(last);
          if (phone && phone.length >= 10) {
            hasDetectedRef.current = true;
            wantsToListenRef.current = false;
            cleanup();
            onPhoneDetected(phone);
            setState('processing');
            return;
          }
        }

        // Auto-restart
        try {
          recognition.start();
          console.log('[SimpleSTT] ▶️ Restarted recognition');
        } catch (e) {
          console.warn('[SimpleSTT] Restart failed:', e);
          setState('idle');
        }
      };

      // Start recognition
      recognition.start();
      console.log('[SimpleSTT] ▶️ Recognition started');

      // Set timeout (30 seconds)
      timeoutRef.current = setTimeout(() => {
        if (!hasDetectedRef.current && !hasErroredRef.current) {
          console.log('[SimpleSTT] ⏰ Timeout after 30s');
          wantsToListenRef.current = false;
          cleanup();
          onError?.("Temps écoulé. Réessaie ou tape ton numéro.");
          setState('idle');
        }
      }, 30000);

      return true;

    } catch (err) {
      console.error('[SimpleSTT] ❌ Start failed:', err);

      let msg = 'Erreur vocale';
      if (err.name === 'NotAllowedError') {
        msg = 'Autorise le micro dans les paramètres du navigateur.';
      } else if (err.name === 'NotFoundError') {
        msg = 'Aucun micro détecté sur cet appareil.';
      }

      wantsToListenRef.current = false;
      notifyError(msg);
      return false;
    }
  }, [cleanup, handleResult, notifyError, onPhoneDetected, onError]);

  // === STOP LISTENING (1 useCallback) ===
  const stopListening = useCallback(() => {
    console.log('[SimpleSTT] ⏹️ Stop requested');
    wantsToListenRef.current = false;
    cleanup();
    setState('idle');
  }, [cleanup]);

  // === CLEANUP ON UNMOUNT (1 useEffect) ===
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // === RETURN ===
  return {
    // State
    isConnected: state === 'listening',
    isConnecting: state === 'connecting',
    transcript,
    partialTranscript: transcript,
    extractedDigits,
    errorMessage,
    state,
    
    // Audio feedback
    audioLevel,
    isReceivingAudio,
    audioStatus: (isReceivingAudio ? 'ok' : 'silence') as AudioStatus,
    silenceDuration: 0,
    levelHistory: [] as number[],
    
    // Actions
    startListening,
    stopListening,
    
    // Compat
    scribeStatus: state,
    scribeError: errorMessage,
  };
}
