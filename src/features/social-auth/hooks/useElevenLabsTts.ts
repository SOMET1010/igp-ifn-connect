/**
 * Hook TTS ElevenLabs pour l'authentification sociale PNAVIM
 * Priorité aux voix pré-enregistrées, fallback vers ElevenLabs TTS
 */

import { useState, useCallback, useRef } from 'react';
import type { PersonaType } from '@/features/social-auth/config/personas';
import { 
  hasPrerecordedMessage, 
  playPrerecordedMessage,
  type MessageKey 
} from '@/shared/services/audio/prerecordedPersonaAudio';

interface UseElevenLabsTtsOptions {
  voiceId: string;
  persona?: PersonaType;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseElevenLabsTtsReturn {
  speak: (text: string, messageKey?: MessageKey) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isLoading: boolean;
}

export function useElevenLabsTts({
  voiceId,
  persona,
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

  const speak = useCallback(async (text: string, messageKey?: MessageKey) => {
    if (!text.trim()) return;

    // Arrêter toute lecture en cours
    stop();

    // 1. Essayer d'abord les messages pré-enregistrés si persona et messageKey fournis
    if (persona && messageKey && hasPrerecordedMessage(persona, messageKey)) {
      console.log(`[TTS] Using prerecorded audio for ${persona}/${messageKey}`);
      setIsLoading(true);
      
      const result = await playPrerecordedMessage(persona, messageKey, {
        onStart: () => {
          setIsLoading(false);
          setIsSpeaking(true);
          onStart?.();
        },
        onEnd: () => {
          setIsSpeaking(false);
          onEnd?.();
        },
        onError: (error) => {
          setIsSpeaking(false);
          setIsLoading(false);
          onError?.(error);
        }
      });

      if (result.success) {
        audioRef.current = result.audio || null;
        return;
      }
      // Si échec, continuer vers ElevenLabs TTS
      console.log('[TTS] Prerecorded failed, falling back to ElevenLabs');
    }

    // 2. Fallback vers ElevenLabs TTS
    setIsLoading(true);

    try {
      console.log(`[ElevenLabs TTS] Speaking with voice: ${voiceId}, text: ${text.substring(0, 50)}...`);
      
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
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.warn('ElevenLabs TTS failed:', error);
      setIsLoading(false);
      setIsSpeaking(false);
      onError?.(error instanceof Error ? error.message : 'Erreur TTS');
    }
  }, [voiceId, persona, stop, onStart, onEnd, onError]);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading
  };
}
