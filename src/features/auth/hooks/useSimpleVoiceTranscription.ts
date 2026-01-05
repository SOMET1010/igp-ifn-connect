import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useAudioLevel, type AudioStatus } from './useAudioLevel';

// Regex pour extraire les numéros ivoiriens
const PHONE_REGEX = /(?:\+?225\s?)?(?:0?[1579])\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/g;

// Mapping des mots en chiffres
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
  
  if (digitsOnly.length >= 8 && digitsOnly.length <= 12) {
    if (digitsOnly.length === 8 && /^[1579]/.test(digitsOnly)) {
      return '0' + digitsOnly;
    }
    if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
      return digitsOnly;
    }
    if (digitsOnly.startsWith('225')) {
      const withoutCode = digitsOnly.slice(3);
      if (withoutCode.length === 10) return withoutCode;
      if (withoutCode.length === 8) return '0' + withoutCode;
    }
  }
  
  const matches = converted.match(PHONE_REGEX);
  if (matches && matches.length > 0) {
    return matches[0].replace(/[\s.-]/g, '').replace(/^\+?225/, '0');
  }
  
  return null;
}

type VoiceState = 'idle' | 'requesting_mic' | 'listening' | 'processing' | 'error';

interface UseSimpleVoiceTranscriptionOptions {
  onPhoneDetected: (phone: string) => void;
  onError?: (error: string) => void;
  onDigitsProgress?: (digits: string, count: number) => void;
}

// Récupérer la classe SpeechRecognition de manière cross-browser
function getSpeechRecognition(): (new () => any) | null {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export function useSimpleVoiceTranscription({
  onPhoneDetected,
  onError,
  onDigitsProgress,
}: UseSimpleVoiceTranscriptionOptions) {
  const [transcript, setTranscript] = useState('');
  const [extractedDigits, setExtractedDigits] = useState('');
  const [state, setState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { smoothedLevel, audioStatus, silenceDuration, isReceivingAudio, levelHistory, startAnalyzing, stopAnalyzing } = useAudioLevel();
  const streamRef = useRef<MediaStream | null>(null);

  const recognitionRef = useRef<any>(null);
  const hasDetectedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasErroredRef = useRef(false);

  // "L'utilisateur veut écouter" (sert à éviter les fins silencieuses)
  const wantsToListenRef = useRef(false);
  // Restart propre après no-speech (il faut attendre onend)
  const restartOnEndRef = useRef(false);

  const transcriptRef = useRef('');

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Stop analyser d'abord, puis couper le stream
    stopAnalyzing();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, [stopAnalyzing]);

  const handleResult = useCallback((text: string) => {
    console.log('[SimpleSTT] Result:', text);
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
      console.log('[SimpleSTT] Phone detected:', phone);
      hasDetectedRef.current = true;
      wantsToListenRef.current = false;
      cleanup();
      onPhoneDetected(phone);
      setState('processing');
    }
  }, [onPhoneDetected, onDigitsProgress, cleanup]);

  const notifyError = useCallback((msg: string) => {
    if (hasErroredRef.current) return;
    hasErroredRef.current = true;
    
    setErrorMessage(msg);
    setState('error');
    onError?.(msg);
    
    // Fallback toast hors iframe
    try {
      if (window.self === window.top && !onError) {
        toast.error(msg);
      }
    } catch {
      // ignore iframe check errors
    }
  }, [onError]);

  const startListening = useCallback(async (): Promise<boolean> => {
    // Reset
    hasErroredRef.current = false;
    hasDetectedRef.current = false;
    wantsToListenRef.current = true;
    restartOnEndRef.current = false;

    setTranscript('');
    transcriptRef.current = '';
    setExtractedDigits('');
    setErrorMessage(null);
    cleanup();

    // Vérifier iframe
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

    // Vérifier support Web Speech API
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      notifyError("Ton navigateur ne supporte pas la reconnaissance vocale.");
      wantsToListenRef.current = false;
      return false;
    }

    setState('requesting_mic');

    try {
      // Ouvrir le micro (permissions + device) + mesurer le niveau audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startAnalyzing(stream);

      console.log('[SimpleSTT] Microphone OK, starting recognition...');

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false; // plus fiable (on relance via onend)
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('[SimpleSTT] 🎤 Recognition started - PARLE MAINTENANT');
        setState('listening');
      };

      recognition.onaudiostart = () => {
        console.log('[SimpleSTT] 🔊 Audio capture started');
      };

      recognition.onsoundstart = () => {
        console.log('[SimpleSTT] 🔈 Sound detected');
      };

      recognition.onspeechstart = () => {
        console.log('[SimpleSTT] 🗣️ Speech detected!');
      };

      recognition.onresult = (event: any) => {
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
        console.log('[SimpleSTT] 📝 Result:', text, '(final:', !!finalTranscript, ')');
        handleResult(text);
      };

      recognition.onerror = (event: any) => {
        console.error('[SimpleSTT] ❌ Error:', event.error, event.message);

        if (event.error === 'aborted') {
          // Arrêt volontaire - ignorer
          return;
        }

        // no-speech: on relance proprement via onend
        if (event.error === 'no-speech') {
          console.log('[SimpleSTT] 🔄 No speech detected, restarting on end...');
          restartOnEndRef.current = true;
          try {
            recognition.stop();
          } catch {
            // ignore
          }
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
          case 'service-not-allowed':
            msg = 'Service vocal non autorisé sur ce navigateur.';
            break;
        }

        wantsToListenRef.current = false;
        cleanup();
        notifyError(msg);
      };

      recognition.onend = () => {
        console.log('[SimpleSTT] 🔚 Recognition ended, restartOnEnd:', restartOnEndRef.current);

        if (!wantsToListenRef.current || hasDetectedRef.current || hasErroredRef.current) {
          setState(hasDetectedRef.current ? 'processing' : (hasErroredRef.current ? 'error' : 'idle'));
          return;
        }

        // Tentative de déduction à la fin (si on a un bout de transcript)
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

        // Relance automatique (no-speech ou fin normale)
        restartOnEndRef.current = false;
        try {
          recognition.start();
          console.log('[SimpleSTT] ▶️ Restart recognition.start()');
        } catch (e) {
          console.warn('[SimpleSTT] Restart failed:', e);
          setState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      console.log('[SimpleSTT] ▶️ Recognition.start() called');

      // Timeout global de 30s
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
    } catch (err: any) {
      console.error('[SimpleSTT] Setup error:', err);

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

  const stopListening = useCallback(() => {
    console.log('[SimpleSTT] Stopping...');
    wantsToListenRef.current = false;
    restartOnEndRef.current = false;
    cleanup();
    setState('idle');
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    startListening,
    stopListening,
    isConnected: state === 'listening',
    isConnecting: state === 'requesting_mic',
    transcript,
    partialTranscript: transcript,
    extractedDigits,
    errorMessage,
    state,
    // Vrais feedbacks micro
    audioLevel: smoothedLevel,
    isReceivingAudio,
    levelHistory,
    audioStatus,
    silenceDuration,
    // Compat
    scribeStatus: state,
    scribeError: errorMessage,
  };
}
