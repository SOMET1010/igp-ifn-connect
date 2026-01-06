import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  getSpeechRecognitionConstructor, 
  type SpeechRecognition, 
  type SpeechRecognitionEvent,
  type SpeechRecognitionErrorEvent 
} from '@/shared/types';

/**
 * 
 * Au lieu de capturer 10 chiffres d'un coup (qui échoue souvent),
 * on écoute UN chiffre à la fois avec confirmation vocale.
 */

export type DigitVoiceState = 'idle' | 'listening' | 'processing' | 'error';

// Mapping mots → chiffres (français + dioula + phonétiques)
const WORD_TO_DIGIT: Record<string, string> = {
  // Français standard
  'zéro': '0', 'zero': '0', 'oh': '0', 'héros': '0',
  'un': '1', 'une': '1', 'hein': '1', 'hin': '1',
  'deux': '2', 'deu': '2', 'deuh': '2',
  'trois': '3', 'troi': '3', 'troua': '3',
  'quatre': '4', 'catre': '4', 'katre': '4',
  'cinq': '5', 'saint': '5', 'sain': '5', 'sink': '5', 'saink': '5',
  'six': '6', 'cis': '6', 'scie': '6',
  'sept': '7', 'sète': '7', 'sett': '7',
  'huit': '8', 'ouïe': '8', 'huitte': '8',
  'neuf': '9', 'oeuf': '9', 'noeud': '9', 'neuffe': '9',
  'dix': '10',
  
  // Chiffres directs
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  
  // Variantes africaines / ivoiriennes courantes
  'zéwo': '0', 'zewo': '0',
  'dé': '2', 'déh': '2',
  'twa': '3', 'trwa': '3',
  'kat': '4', 'katr': '4',
  'sènk': '5', 'senk': '5',
  'siss': '6', 'sis': '6',
  'sèt': '7', 'sét': '7',
  'wit': '8', 'wuit': '8', 'ouit': '8',
  'nèf': '9', 'nèff': '9',
  
  // Dioula
  'kelen': '1', 'fila': '2', 'saba': '3', 'naani': '4',
  'duuru': '5', 'wɔɔrɔ': '6', 'wolonwula': '7', 
  'segin': '8', 'kɔnɔntɔn': '9', 'tan': '10',
};

// Priorité de correspondance (mots plus longs d'abord pour éviter faux positifs)
const SORTED_WORDS = Object.keys(WORD_TO_DIGIT).sort((a, b) => b.length - a.length);

// Normaliser le texte (enlever accents, ponctuation)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^\w\s]/g, ' ') // Ponctuation → espaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Extraire UN SEUL chiffre du texte avec meilleure précision
function extractSingleDigit(text: string): string | null {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  
  // 1. Chercher un chiffre direct en premier (plus fiable)
  for (const word of words) {
    if (/^\d$/.test(word)) {
      return word;
    }
  }
  
  // 2. Chercher les mots correspondants (plus longs d'abord)
  for (const key of SORTED_WORDS) {
    const normalizedKey = normalizeText(key);
    // Correspondance exacte de mot
    if (words.includes(normalizedKey)) {
      const digit = WORD_TO_DIGIT[key];
      if (digit === '10') return '1';
      return digit;
    }
    // Ou le texte contient le mot
    if (normalized.includes(normalizedKey) && normalizedKey.length >= 2) {
      const digit = WORD_TO_DIGIT[key];
      if (digit === '10') return '1';
      return digit;
    }
  }
  
  // 3. Dernier recours: chercher un chiffre n'importe où
  const digitMatch = normalized.match(/\d/);
  if (digitMatch) {
    return digitMatch[0];
  }
  
  return null;
}

// La fonction getSpeechRecognitionConstructor est importée depuis @/shared/types

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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCleaningUpRef = useRef(false);
  const shouldRestartRef = useRef(false);
  const isActiveRef = useRef(false); // Tracks if we should keep listening
  const restartDelayMsRef = useRef(200); // Delay before restarting recognition

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
    const SpeechRecognitionClass = getSpeechRecognitionConstructor();
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
    restartDelayMsRef.current = 200;
    isActiveRef.current = true; // Mark as active
    
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
      recognition.continuous = false; // Un résultat à la fois pour plus de contrôle
      recognition.interimResults = false; // Seulement les résultats finaux
      recognition.maxAlternatives = 5;
      
      recognitionRef.current = recognition;
      
      let lastDetectedDigit: string | null = null;
      let lastDetectionTime = 0;
      const MIN_DETECTION_INTERVAL = 800; // Minimum 800ms entre deux détections
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        const transcript = result?.[0]?.transcript?.trim?.() ?? '';

        // Afficher ce qu'on entend
        setLastHeard(transcript);

        // Essayer toutes les alternatives pour trouver un chiffre
        let detectedDigit: string | null = null;

        for (let alt = 0; alt < (result?.length ?? 0); alt++) {
          const altTranscript = result[alt].transcript;
          const digit = extractSingleDigit(altTranscript);
          if (digit) {
            detectedDigit = digit;
            break;
          }
        }

        const now = Date.now();

        if (detectedDigit) {
          // Éviter les doublons rapides du même chiffre
          if (detectedDigit === lastDetectedDigit && (now - lastDetectionTime) < MIN_DETECTION_INTERVAL) {
            setErrorMessage(null);
            restartDelayMsRef.current = 350;
            shouldRestartRef.current = true;
            try { recognition.stop(); } catch { /* ignore */ }
            return;
          }

          lastDetectedDigit = detectedDigit;
          lastDetectionTime = now;

          setErrorMessage(null);
          onDigitDetected(detectedDigit);

          // Pause (pour éviter de capter "oui"/bruit juste après)
          restartDelayMsRef.current = 700;
          shouldRestartRef.current = true;
          try { recognition.stop(); } catch { /* ignore */ }
          return;
        }

        // Pas de chiffre
        setErrorMessage('Répète le chiffre');
        restartDelayMsRef.current = 450;
        shouldRestartRef.current = true;
        try { recognition.stop(); } catch { /* ignore */ }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'aborted') return; // Ignoré

        if (event.error === 'no-speech') {
          setErrorMessage('Je n\'entends rien');
          restartDelayMsRef.current = 500;
          shouldRestartRef.current = true;
        } else if (event.error === 'not-allowed') {
          setState('error');
          setErrorMessage('Micro non autorisé');
          onError?.('Micro non autorisé');
        } else {
          restartDelayMsRef.current = 450;
          shouldRestartRef.current = true;
        }
      };
      
      recognition.onend = () => {
        // Redémarrer seulement si on est en mode actif
        if (shouldRestartRef.current && isActiveRef.current && recognitionRef.current) {
          const delay = Math.max(200, restartDelayMsRef.current);
          shouldRestartRef.current = false;
          restartDelayMsRef.current = 200;

          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch {
              // ignore (InvalidStateError si déjà démarré)
            }
          }, delay);
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
    isActiveRef.current = false; // Stop restart loop
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
