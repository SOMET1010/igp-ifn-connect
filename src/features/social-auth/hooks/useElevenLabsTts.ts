/**
 * Hook TTS ElevenLabs pour l'authentification sociale PNAVIM
 * Utilise les voix clonées (Tantie Sagesse / Gbairai)
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseElevenLabsTtsOptions {
  voiceId: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseElevenLabsTtsReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
}

export function useElevenLabsTts({
  voiceId,
  onStart,
  onEnd,
  onError
}: UseElevenLabsTtsOptions): UseElevenLabsTtsReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Arrêter toute lecture en cours
    stop();

    setIsLoading(true);

    try {
      console.log(`[ElevenLabs TTS] Speaking with voice: ${voiceId}, text: ${text.substring(0, 50)}...`);
      
      // Appeler l'Edge Function ElevenLabs TTS avec la voix clonée
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            text: text,
            voiceId: voiceId,
            modelId: 'eleven_multilingual_v2'
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
        onStart?.();
      };

      audio.onended = () => {
        setIsSpeaking(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        onEnd?.();
      };

      audio.onerror = () => {
        setIsLoading(false);
        setIsSpeaking(false);
        onError?.('Erreur de lecture audio');
        // Fallback vers Web Speech API
        fallbackToWebSpeech(text);
      };

      await audio.play();
    } catch (error) {
      console.warn('ElevenLabs TTS failed, using fallback:', error);
      setIsLoading(false);
      onError?.('ElevenLabs indisponible, utilisation du fallback');
      // Fallback vers Web Speech API
      fallbackToWebSpeech(text);
    }
  }, [voiceId, stop, onStart, onEnd, onError]);

  const fallbackToWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        onStart?.();
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return {
    speak,
    stop,
    isSpeaking,
    isLoading
  };
}
