import { useState, useCallback, useRef, useEffect } from 'react';
import { useScribe, CommitStrategy } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAudioLevel } from './useAudioLevel';

// Regex pour extraire les numéros ivoiriens (formats: 07..., 05..., 01..., +225...)
const PHONE_REGEX = /(?:\+?225\s?)?(?:0?[1579])\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/g;

// Mapping des mots en chiffres (français)
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

// Convertit les mots en chiffres dans une phrase
function convertWordsToDigits(text: string): string {
  let result = text.toLowerCase();
  
  // Remplacer les mots par des chiffres
  Object.entries(WORD_TO_DIGIT).forEach(([word, digit]) => {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), digit);
  });
  
  return result;
}

// Extrait et nettoie un numéro de téléphone
function extractPhoneNumber(text: string): string | null {
  // D'abord convertir les mots en chiffres
  const converted = convertWordsToDigits(text);
  
  // Extraire tous les chiffres
  const digitsOnly = converted.replace(/\D/g, '');
  
  // Vérifier si c'est un numéro ivoirien valide (8-10 chiffres)
  if (digitsOnly.length >= 8 && digitsOnly.length <= 12) {
    // Normaliser au format 10 chiffres (avec 0 initial)
    if (digitsOnly.length === 8 && /^[1579]/.test(digitsOnly)) {
      return '0' + digitsOnly;
    }
    if (digitsOnly.length === 10 && digitsOnly.startsWith('0')) {
      return digitsOnly;
    }
    // Avec indicatif pays
    if (digitsOnly.startsWith('225')) {
      const withoutCode = digitsOnly.slice(3);
      if (withoutCode.length === 10) return withoutCode;
      if (withoutCode.length === 8) return '0' + withoutCode;
    }
  }
  
  // Fallback: chercher avec regex
  const matches = converted.match(PHONE_REGEX);
  if (matches && matches.length > 0) {
    return matches[0].replace(/[\s.-]/g, '').replace(/^\+?225/, '0');
  }
  
  return null;
}

type VoiceState = 'idle' | 'requesting_mic' | 'connecting' | 'listening' | 'processing' | 'error';

interface UseVoiceTranscriptionOptions {
  onPhoneDetected: (phone: string) => void;
  onError?: (error: string) => void;
  onDigitsProgress?: (digits: string, count: number) => void;
}

export function useVoiceTranscription({
  onPhoneDetected,
  onError,
  onDigitsProgress,
}: UseVoiceTranscriptionOptions) {
  const [transcript, setTranscript] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [extractedDigits, setExtractedDigits] = useState('');
  const [state, setState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const detectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTextRef = useRef('');
  const hasDetectedRef = useRef(false);
  const disconnectRef = useRef<(() => void) | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Empêche les notifications d'erreur dupliquées (ex: scribe.onError + catch)
  const lastNotifiedErrorRef = useRef<{ msg: string; at: number } | null>(null);


  // Hook pour l'analyse du niveau audio
  const audioLevelHook = useAudioLevel({
    silenceThreshold: 0.03,
    weakThreshold: 0.08,
    smoothingFactor: 0.3,
  });

  // Ref stable pour éviter les dépendances instables dans les callbacks
  const audioLevelHookRef = useRef(audioLevelHook);
  audioLevelHookRef.current = audioLevelHook;

  const clearTimers = () => {
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  // Cleanup stable - pas de useCallback pour éviter les dépendances instables
  const cleanupImpl = () => {
    clearTimers();
    audioLevelHookRef.current.stopAnalyzing();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };
  
  const cleanupRef = useRef(cleanupImpl);
  cleanupRef.current = cleanupImpl;

  const finalizeFromText = (text: string) => {
    if (hasDetectedRef.current) return;

    const phone = extractPhoneNumber(text);
    if (phone && phone.length >= 10) {
      hasDetectedRef.current = true;
      onPhoneDetected(phone);
      return;
    }

    onError?.("Je n'ai pas compris ton numéro. Réessaie ou tape-le.");
  };

  // Auto-fin: quand l'utilisateur fait une pause (silence), on finalise
  const scheduleSilenceFinalize = (nextText: string) => {
    if (hasDetectedRef.current) return;

    const digitCount = nextText.replace(/\D/g, '').length;
    if (digitCount < 6) return;

    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    silenceTimeoutRef.current = setTimeout(() => {
      if (hasDetectedRef.current) return;

      finalizeFromText(lastTextRef.current);
      cleanupRef.current();
      disconnectRef.current?.();
      setState('idle');
    }, 2800);
  };

  const handleTextUpdate = (text: string, source: 'partial' | 'committed') => {
    console.log(`[STT] ${source}:`, text);
    setTranscript(text);
    lastTextRef.current = text;

    if (hasDetectedRef.current) return;

    // Extraire les chiffres en cours pour feedback temps réel
    const converted = convertWordsToDigits(text);
    const digitsOnly = converted.replace(/\D/g, '').slice(0, 10);
    setExtractedDigits(digitsOnly);
    
    // Callback pour feedback progressif
    if (digitsOnly.length > 0) {
      onDigitsProgress?.(digitsOnly, digitsOnly.length);
    }

    // Tentative immédiate d'extraction
    const phone = extractPhoneNumber(text);
    if (phone && phone.length >= 10) {
      console.log('[STT] Phone detected:', phone);
      hasDetectedRef.current = true;
      cleanupRef.current();
      onPhoneDetected(phone);
      disconnectRef.current?.();
      setState('processing');
      return;
    }

    // Sinon, on attend une pause pour finaliser
    scheduleSilenceFinalize(text);
  };

  // Fonction utilitaire pour normaliser les erreurs vocales
  const normalizeVoiceError = useCallback((err: unknown): string => {
    const isInIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();

    // En iframe, toujours le même message clair
    if (isInIframe) {
      return "Le micro ne fonctionne pas dans l'aperçu. Ouvre en plein écran.";
    }

    // Erreur string directe
    if (typeof err === 'string') return err;

    // Erreur standard avec message
    if (err instanceof Error && err.message) {
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        return 'Autorise le micro dans les paramètres du navigateur.';
      }
      if (err.name === 'NotFoundError') {
        return 'Aucun micro détecté sur cet appareil.';
      }
      return err.message;
    }

    // Objet avec type (erreur ElevenLabs)
    if ((err as any)?.type) {
      return `Erreur micro: ${(err as any).type}`;
    }

    // Fallback
    return 'Erreur vocale';
  }, []);

  const notifyErrorOnce = useCallback((msg: string) => {
    setErrorMessage(msg);
    setIsConnecting(false);
    setState('error');

    const now = Date.now();
    const prev = lastNotifiedErrorRef.current;
    if (prev && prev.msg === msg && now - prev.at < 1500) return;
    lastNotifiedErrorRef.current = { msg, at: now };

    onError?.(msg);

    // Fallback toast si aucun handler externe et hors iframe
    const isInIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    if (!onError && !isInIframe) {
      toast.error(msg);
    }
  }, [onError]);

  const scribe = useScribe({
    modelId: 'scribe_v2_realtime',
    commitStrategy: CommitStrategy.VAD,
    onPartialTranscript: (data) => handleTextUpdate(data.text, 'partial'),
    onCommittedTranscript: (data) => handleTextUpdate(data.text, 'committed'),
    onError: (err) => {
      console.error('[STT] Scribe error:', err);
      const msg = normalizeVoiceError(err);
      notifyErrorOnce(msg);
      cleanupRef.current();
      disconnectRef.current?.();
    },
  });

  // Garder une référence stable pour les callbacks de timers
  disconnectRef.current = () => {
    try {
      scribe.disconnect();
    } catch {
      // ignore
    }
  };

  const startListening = useCallback(async () => {
    // Réinitialiser la déduplication d'erreurs pour cette tentative
    lastNotifiedErrorRef.current = null;

    setIsConnecting(true);
    setState('requesting_mic');
    setErrorMessage(null);
    hasDetectedRef.current = false;
    setTranscript('');
    setExtractedDigits('');
    lastTextRef.current = '';
    cleanupRef.current();

    try {
      console.log('[STT] Requesting microphone...');

      // D'abord, demander l'accès au micro pour l'analyse audio
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      
      // Démarrer l'analyse du niveau audio IMMÉDIATEMENT
      audioLevelHookRef.current.startAnalyzing(stream);
      console.log('[STT] Audio level analysis started');

      setState('connecting');
      console.log('[STT] Requesting token...');

      // Obtenir un token depuis la fonction backend
      const { data, error } = await supabase.functions.invoke('elevenlabs-scribe-token');

      if (error) {
        console.error('[STT] Token error:', error);
        throw new Error('Service vocal indisponible');
      }

      if (!data?.token) {
        console.error('[STT] No token received');
        throw new Error('Service vocal indisponible');
      }

      console.log('[STT] Token received, connecting...');

      await scribe.connect({
        token: data.token,
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('[STT] Connected successfully');
      setIsConnecting(false);
      setState('listening');

      // Timeout global (si aucune détection)
      detectionTimeoutRef.current = setTimeout(() => {
        if (!hasDetectedRef.current) {
          console.log('[STT] Detection timeout');
          finalizeFromText(lastTextRef.current);
          cleanupRef.current();
          disconnectRef.current?.();
          setState('idle');
        }
      }, 20000);
    } catch (err: any) {
      console.error('[STT] Error:', err);
      cleanupRef.current();

      const msg = normalizeVoiceError(err);
      notifyErrorOnce(msg);

      throw err;
    }
  }, [scribe, normalizeVoiceError, notifyErrorOnce]);

  const stopListening = useCallback(() => {
    console.log('[STT] Stopping...');
    cleanupRef.current();
    try {
      scribe.disconnect();
    } finally {
      setIsConnecting(false);
      setState('idle');
    }
  }, [scribe]);

  // Cleanup on unmount - pas de dépendance pour éviter la boucle
  useEffect(() => {
    return () => {
      cleanupRef.current();
    };
  }, []);

  return {
    startListening,
    stopListening,
    isConnected: scribe.isConnected,
    isConnecting,
    transcript,
    partialTranscript: scribe.partialTranscript || '',
    extractedDigits,
    errorMessage,
    scribeStatus: scribe.status,
    scribeError: scribe.error,
    // Propriétés pour le feedback audio
    audioLevel: audioLevelHook.smoothedLevel,
    isReceivingAudio: audioLevelHook.isReceivingAudio,
    levelHistory: audioLevelHook.levelHistory,
    audioStatus: audioLevelHook.audioStatus,
    silenceDuration: audioLevelHook.silenceDuration,
    state,
  };
}
