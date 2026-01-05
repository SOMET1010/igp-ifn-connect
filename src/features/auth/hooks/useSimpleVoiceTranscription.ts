import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { AudioStatus } from './useAudioLevel';

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

  const recognitionRef = useRef<any>(null);
  const hasDetectedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasErroredRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  const handleResult = useCallback((text: string) => {
    console.log('[SimpleSTT] Result:', text);
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

  const startListening = useCallback(async () => {
    // Reset
    hasErroredRef.current = false;
    hasDetectedRef.current = false;
    setTranscript('');
    setExtractedDigits('');
    setErrorMessage(null);
    cleanup();

    // Vérifier iframe
    try {
      if (window.self !== window.top) {
        notifyError("Le micro ne fonctionne pas dans l'aperçu. Ouvre en plein écran.");
        return;
      }
    } catch {
      notifyError("Le micro ne fonctionne pas dans l'aperçu. Ouvre en plein écran.");
      return;
    }

    // Vérifier support Web Speech API
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      notifyError("Ton navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }

    setState('requesting_mic');

    try {
      // Test micro d'abord
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      console.log('[SimpleSTT] Microphone OK, starting recognition...');

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onstart = () => {
        console.log('[SimpleSTT] Recognition started');
        setState('listening');
      };

      recognition.onresult = (event) => {
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

        handleResult(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('[SimpleSTT] Error:', event.error);
        
        let msg = 'Erreur vocale';
        switch (event.error) {
          case 'not-allowed':
            msg = 'Autorise le micro dans les paramètres du navigateur.';
            break;
          case 'no-speech':
            msg = "Je n'ai rien entendu. Réessaie.";
            break;
          case 'network':
            msg = 'Problème de connexion. Vérifie ton internet.';
            break;
          case 'aborted':
            // Ignore - arrêt volontaire
            return;
        }
        
        cleanup();
        notifyError(msg);
      };

      recognition.onend = () => {
        console.log('[SimpleSTT] Recognition ended');
        if (state === 'listening' && !hasDetectedRef.current && !hasErroredRef.current) {
          // Finalize avec ce qu'on a
          if (transcript) {
            const phone = extractPhoneNumber(transcript);
            if (phone && phone.length >= 10) {
              hasDetectedRef.current = true;
              onPhoneDetected(phone);
            } else {
              onError?.("Je n'ai pas compris ton numéro. Réessaie ou tape-le.");
            }
          }
          setState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      // Timeout global
      timeoutRef.current = setTimeout(() => {
        if (!hasDetectedRef.current && !hasErroredRef.current) {
          console.log('[SimpleSTT] Timeout');
          cleanup();
          onError?.("Temps écoulé. Réessaie ou tape ton numéro.");
          setState('idle');
        }
      }, 20000);

    } catch (err: any) {
      console.error('[SimpleSTT] Setup error:', err);
      
      let msg = 'Erreur vocale';
      if (err.name === 'NotAllowedError') {
        msg = 'Autorise le micro dans les paramètres du navigateur.';
      } else if (err.name === 'NotFoundError') {
        msg = 'Aucun micro détecté sur cet appareil.';
      }
      
      notifyError(msg);
    }
  }, [cleanup, handleResult, notifyError, onPhoneDetected, onError, state, transcript]);

  const stopListening = useCallback(() => {
    console.log('[SimpleSTT] Stopping...');
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
    // Valeurs factices pour compatibilité (typées explicitement)
    audioLevel: 0,
    isReceivingAudio: state === 'listening',
    levelHistory: [] as number[],
    audioStatus: (state === 'listening' ? 'good' : 'silence') as AudioStatus,
    silenceDuration: 0,
    scribeStatus: state,
    scribeError: errorMessage,
  };
}
