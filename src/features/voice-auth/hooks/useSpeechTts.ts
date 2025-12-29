import { useCallback, useRef, useState } from 'react';
import { VoiceAuthLang, VoiceScriptKey, getVoiceScript } from '../config/audioScripts';

interface UseSpeechTtsOptions {
  lang: VoiceAuthLang;
  onStart?: () => void;
  onEnd?: () => void;
}

interface UseSpeechTtsReturn {
  speak: (key: VoiceScriptKey, variables?: Record<string, string>) => void;
  speakRaw: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

/**
 * Hook TTS multi-langue avec fallback Web Speech API
 * Priorité: fichiers audio pré-enregistrés > Web Speech API
 */
export function useSpeechTts({ 
  lang, 
  onStart, 
  onEnd 
}: UseSpeechTtsOptions): UseSpeechTtsReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stop = useCallback(() => {
    // Stop audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    // Stop Web Speech API
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
  }, [isSupported]);

  const speakWithWebSpeech = useCallback((text: string) => {
    if (!isSupported) return;

    stop();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR'; // French for both FR and Nouchi
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      onStart?.();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, stop, onStart, onEnd]);

  const tryPlayPrerecorded = useCallback(async (key: string): Promise<boolean> => {
    const audioPath = `/audio/${lang}/${key}.mp3`;
    
    return new Promise((resolve) => {
      const audio = new Audio(audioPath);
      audioRef.current = audio;
      
      audio.oncanplaythrough = () => {
        setIsSpeaking(true);
        onStart?.();
        audio.play().catch(() => resolve(false));
      };
      
      audio.onended = () => {
        setIsSpeaking(false);
        onEnd?.();
        resolve(true);
      };
      
      audio.onerror = () => {
        resolve(false);
      };
      
      // Timeout for loading
      setTimeout(() => {
        if (!audio.duration) {
          resolve(false);
        }
      }, 500);
    });
  }, [lang, onStart, onEnd]);

  const speak = useCallback(async (
    key: VoiceScriptKey, 
    variables?: Record<string, string>
  ) => {
    stop();
    
    // Try pre-recorded audio first
    const played = await tryPlayPrerecorded(key);
    
    if (!played) {
      // Fallback to Web Speech API with script text
      const text = getVoiceScript(lang, key, variables);
      speakWithWebSpeech(text);
    }
  }, [lang, stop, tryPlayPrerecorded, speakWithWebSpeech]);

  const speakRaw = useCallback((text: string) => {
    stop();
    speakWithWebSpeech(text);
  }, [stop, speakWithWebSpeech]);

  return {
    speak,
    speakRaw,
    stop,
    isSpeaking,
    isSupported,
  };
}

export default useSpeechTts;
