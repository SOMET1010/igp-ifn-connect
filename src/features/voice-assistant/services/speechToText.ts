/**
 * Service Speech-to-Text (STT)
 * Utilise Web Speech API avec fallback
 */

import type { TranscriptionEvent } from '../types/voice.types';

// Types pour Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// Instance de reconnaissance
let recognition: SpeechRecognition | null = null;
let isListening = false;

// Callbacks
type TranscriptionCallback = (event: TranscriptionEvent) => void;
type ErrorCallback = (error: string) => void;
type StatusCallback = (status: 'started' | 'stopped' | 'error') => void;

let onTranscription: TranscriptionCallback | null = null;
let onError: ErrorCallback | null = null;
let onStatus: StatusCallback | null = null;

/**
 * Vérifie si STT est disponible
 */
export function isSTTAvailable(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Initialise le service de reconnaissance vocale
 */
export function initSpeechRecognition(
  transcriptionCallback: TranscriptionCallback,
  errorCallback: ErrorCallback,
  statusCallback: StatusCallback
): boolean {
  if (!isSTTAvailable()) {
    console.warn('[STT] Web Speech API non supportée');
    errorCallback('La reconnaissance vocale n\'est pas disponible sur ce navigateur');
    return false;
  }
  
  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognitionClass();
  
  // Configuration
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'fr-FR';
  recognition.maxAlternatives = 1;
  
  // Callbacks
  onTranscription = transcriptionCallback;
  onError = errorCallback;
  onStatus = statusCallback;
  
  // Event handlers
  recognition.onstart = () => {
    console.log('[STT] Démarré');
    isListening = true;
    onStatus?.('started');
  };
  
  recognition.onend = () => {
    console.log('[STT] Arrêté');
    isListening = false;
    onStatus?.('stopped');
  };
  
  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('[STT] Erreur:', event.error);
    isListening = false;
    
    let message = 'Erreur de reconnaissance vocale';
    switch (event.error) {
      case 'no-speech':
        message = 'Aucune parole détectée';
        break;
      case 'audio-capture':
        message = 'Micro non accessible';
        break;
      case 'not-allowed':
        message = 'Autorisation micro refusée';
        break;
      case 'network':
        message = 'Erreur réseau';
        break;
      case 'aborted':
        // Normal, pas une vraie erreur
        return;
    }
    
    onError?.(message);
    onStatus?.('error');
  };
  
  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalTranscript = '';
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      
      if (result.isFinal) {
        finalTranscript += transcript;
        onTranscription?.({
          text: transcript,
          isFinal: true,
          confidence: confidence || 0.8,
          timestamp: Date.now()
        });
      } else {
        interimTranscript += transcript;
        onTranscription?.({
          text: transcript,
          isFinal: false,
          confidence: confidence || 0.5,
          timestamp: Date.now()
        });
      }
    }
    
    console.log('[STT] Résultat:', { final: finalTranscript, interim: interimTranscript });
  };
  
  console.log('[STT] Initialisé');
  return true;
}

/**
 * Démarre l'écoute
 */
export function startListening(): boolean {
  if (!recognition) {
    console.error('[STT] Non initialisé');
    return false;
  }
  
  if (isListening) {
    console.warn('[STT] Déjà en écoute');
    return true;
  }
  
  try {
    recognition.start();
    return true;
  } catch (error) {
    console.error('[STT] Erreur démarrage:', error);
    return false;
  }
}

/**
 * Arrête l'écoute
 */
export function stopListening(): void {
  if (recognition && isListening) {
    recognition.stop();
  }
}

/**
 * Annule l'écoute (sans déclencher onresult)
 */
export function abortListening(): void {
  if (recognition) {
    recognition.abort();
  }
}

/**
 * Vérifie si on écoute actuellement
 */
export function getIsListening(): boolean {
  return isListening;
}

/**
 * Nettoie les ressources
 */
export function cleanup(): void {
  if (recognition) {
    recognition.abort();
    recognition = null;
  }
  isListening = false;
  onTranscription = null;
  onError = null;
  onStatus = null;
}
