import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * useDigitByDigitVoice - Écoute vocale chiffre par chiffre
 * 
 * Au lieu de capturer 10 chiffres d'un coup (qui échoue souvent),
 * on écoute UN chiffre à la fois avec confirmation vocale.
 */

export type DigitVoiceState = 'idle' | 'listening' | 'processing' | 'error';

// Mapping mots → chiffres (français + dioula)
const WORD_TO_DIGIT: Record<string, string> = {
  // Français
  'zéro': '0', 'zero': '0', 'oh': '0', 'o': '0',
  'un': '1', 'une': '1', 'hein': '1',
  'deux': '2', 'de': '2',
  'trois': '3', 'toi': '3',
  'quatre': '4', 'cat': '4', 'quart': '4',
  'cinq': '5', 'saint': '5', 'sain': '5', 'sein': '5',
  'six': '6', 'si': '6', 'cis': '6', 'scie': '6',
  'sept': '7', 'set': '7', 'cette': '7', 'c\'est': '7',
  'huit': '8', 'oui': '8', 'ui': '8', 'wii': '8',
  'neuf': '9', 'oeuf': '9', 'noeud': '9',
  'dix': '10',
  // Chiffres directs
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  // Dioula approximatif
  'kelen': '1', 'fila': '2', 'saba': '3', 'naani': '4',
  'duuru': '5', 'wɔɔrɔ': '6', 'wolonwula': '7', 
  'segin': '8', 'kɔnɔntɔn': '9', 'tan': '10',
};

// Extraire UN SEUL chiffre du texte
function extractSingleDigit(text: string): string | null {
  const normalized = text.toLowerCase().trim();
  
  // 1. Chercher dans le mapping de mots
  for (const [word, digit] of Object.entries(WORD_TO_DIGIT)) {
    if (normalized.includes(word)) {
      // Si c'est "dix", retourner "1" et "0" séparément ? Non, juste le premier
      if (digit === '10') return '1'; // On prendra le 0 au prochain tour
      return digit;
    }
  }
  
  // 2. Chercher un chiffre isolé dans le texte
  const digitMatch = normalized.match(/\d/);
  if (digitMatch) {
    return digitMatch[0];
  }
  
  return null;
}

// Obtenir le SpeechRecognition natif
function getSpeechRecognition(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

interface UseDigitByDigitVoiceOptions {
  onDigitDetected: (digit: string) => void;
  onError?: (message: string) => void;
  language?: string;
}

export function useDigitByDigitVoice({
  onDigitDetected,
  onError,
  language = 'fr-FR'
}: UseDigitByDigitVoiceOptions) {
  // États
  const [state, setState] = useState<DigitVoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isReceivingAudio, setIsReceivingAudio] = useState(false);
  const [lastHeard, setLastHeard] = useState<string>('');
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCleaningUpRef = useRef(false);
  const shouldRestartRef = useRef(false);

  // Nettoyage complet
  const cleanup = useCallback(() => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Arrêter l'intervalle audio
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Arrêter la reconnaissance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) { /* ignore */ }
      recognitionRef.current = null;
    }
    
    // Libérer le flux audio
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    // Fermer le contexte audio
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) { /* ignore */ }
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setAudioLevel(0);
    setIsReceivingAudio(false);
    
    isCleaningUpRef.current = false;
  }, []);

  // Démarrer l'écoute pour UN chiffre
  const startListening = useCallback(async (): Promise<boolean> => {
    // Vérifier le support
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      const msg = 'Reconnaissance vocale non supportée';
      setErrorMessage(msg);
      setState('error');
      onError?.(msg);
      return false;
    }
    
    // Vérifier iframe
    try {
      if (window.self !== window.top) {
        const msg = 'Micro bloqué dans l\'aperçu';
        setErrorMessage(msg);
        setState('error');
        onError?.(msg);
        return false;
      }
    } catch {
      const msg = 'Micro bloqué';
      setErrorMessage(msg);
      setState('error');
      onError?.(msg);
      return false;
    }
    
    // Nettoyer avant de démarrer
    cleanup();
    setState('listening');
    setErrorMessage(null);
    setLastHeard('');
    shouldRestartRef.current = false;
    
    try {
      // Demander le micro
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true } 
      });
      streamRef.current = stream;
      
      // Configurer l'analyse audio pour feedback visuel
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      intervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
          setAudioLevel(avg);
          setIsReceivingAudio(avg > 0.03);
        }
      }, 50);
      
      // Configurer la reconnaissance vocale
      const recognition = new SpeechRecognitionClass();
      recognition.lang = language;
      recognition.continuous = false; // UN résultat puis stop
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      
      recognitionRef.current = recognition;
      
      recognition.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        setLastHeard(transcript);
        
        if (result.isFinal) {
          const digit = extractSingleDigit(transcript);
          
          if (digit) {
            setState('processing');
            // Petit délai pour feedback visuel
            setTimeout(() => {
              onDigitDetected(digit);
              // Préparer pour le prochain chiffre
              shouldRestartRef.current = true;
            }, 100);
          } else {
            // Pas de chiffre reconnu, relancer
            setErrorMessage('Répète le chiffre');
            shouldRestartRef.current = true;
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        if (event.error === 'aborted') return; // Ignoré
        
        console.log('[DigitVoice] Error:', event.error);
        
        if (event.error === 'no-speech') {
          setErrorMessage('Je n\'entends rien');
          shouldRestartRef.current = true;
        } else if (event.error === 'not-allowed') {
          setState('error');
          setErrorMessage('Micro non autorisé');
          onError?.('Micro non autorisé');
        } else {
          shouldRestartRef.current = true;
        }
      };
      
      recognition.onend = () => {
        // Relancer si nécessaire
        if (shouldRestartRef.current && state === 'listening' && recognitionRef.current) {
          shouldRestartRef.current = false;
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) { /* ignore */ }
          }, 100);
        }
      };
      
      recognition.start();
      return true;
      
    } catch (err) {
      console.error('[DigitVoice] Start error:', err);
      const msg = 'Impossible d\'accéder au micro';
      setErrorMessage(msg);
      setState('error');
      onError?.(msg);
      cleanup();
      return false;
    }
  }, [cleanup, language, onDigitDetected, onError, state]);

  // Arrêter l'écoute
  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    cleanup();
    setState('idle');
  }, [cleanup]);

  // Cleanup au démontage
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    state,
    isListening: state === 'listening',
    isProcessing: state === 'processing',
    errorMessage,
    lastHeard,
    audioLevel,
    isReceivingAudio,
    startListening,
    stopListening,
  };
}
