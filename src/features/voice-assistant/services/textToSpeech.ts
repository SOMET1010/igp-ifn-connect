/**
 * Service Text-to-Speech (TTS)
 * Utilise Web Speech API avec fallback
 */

import type { TTSConfig } from '../types/voice.types';

// Configuration par défaut - Voix "Tantie Awa"
const DEFAULT_CONFIG: TTSConfig = {
  rate: 0.9,      // Légèrement plus lent pour clarté
  pitch: 1.1,     // Voix légèrement plus aiguë (féminine)
  volume: 1.0,
  lang: 'fr-FR'
};

// Cache des voix disponibles
let cachedVoices: SpeechSynthesisVoice[] = [];
let preferredVoice: SpeechSynthesisVoice | null = null;

/**
 * Initialise et récupère les voix disponibles
 */
export function initVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('[TTS] Web Speech API non supportée');
      resolve([]);
      return;
    }
    
    const loadVoices = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      
      // Chercher une voix française féminine
      preferredVoice = cachedVoices.find(v => 
        v.lang.startsWith('fr') && v.name.toLowerCase().includes('female')
      ) || cachedVoices.find(v => 
        v.lang.startsWith('fr')
      ) || cachedVoices[0] || null;
      
      console.log('[TTS] Voix chargées:', cachedVoices.length, 'Préférée:', preferredVoice?.name);
      resolve(cachedVoices);
    };
    
    // Les voix peuvent être chargées de façon asynchrone
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      // Fallback timeout
      setTimeout(loadVoices, 1000);
    }
  });
}

/**
 * Vérifie si TTS est disponible
 */
export function isTTSAvailable(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * Parle un texte
 */
export function speak(text: string, config: Partial<TTSConfig> = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isTTSAvailable()) {
      console.warn('[TTS] Non disponible, texte ignoré:', text);
      resolve();
      return;
    }
    
    // Annuler toute parole en cours
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    utterance.rate = finalConfig.rate || 0.9;
    utterance.pitch = finalConfig.pitch || 1.1;
    utterance.volume = finalConfig.volume || 1.0;
    utterance.lang = finalConfig.lang || 'fr-FR';
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => {
      console.log('[TTS] Fin:', text.substring(0, 50));
      resolve();
    };
    
    utterance.onerror = (event) => {
      console.error('[TTS] Erreur:', event.error);
      // Ne pas rejeter pour les erreurs mineures
      if (event.error === 'canceled' || event.error === 'interrupted') {
        resolve();
      } else {
        reject(new Error(event.error));
      }
    };
    
    console.log('[TTS] Parle:', text.substring(0, 50));
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Arrête la parole en cours
 */
export function stopSpeaking(): void {
  if (isTTSAvailable()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Vérifie si le TTS parle actuellement
 */
export function isSpeaking(): boolean {
  return isTTSAvailable() && window.speechSynthesis.speaking;
}

/**
 * Pause la parole
 */
export function pauseSpeaking(): void {
  if (isTTSAvailable()) {
    window.speechSynthesis.pause();
  }
}

/**
 * Reprend la parole
 */
export function resumeSpeaking(): void {
  if (isTTSAvailable()) {
    window.speechSynthesis.resume();
  }
}

// Initialiser les voix au chargement
if (typeof window !== 'undefined') {
  initVoices();
}
