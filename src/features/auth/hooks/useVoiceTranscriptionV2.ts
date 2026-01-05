/**
 * useVoiceTranscriptionV2 - Transcription vocale avec feedback audio temps réel
 * 
 * Version améliorée avec :
 * - Feedback visuel du niveau audio (l'utilisateur VOIT que le micro capte)
 * - Gestion manuelle du MediaStream pour l'analyse audio
 * - Meilleure gestion des erreurs et états
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAudioLevel } from './useAudioLevel';

// Regex pour extraire les numéros ivoiriens
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

interface UseVoiceTranscriptionV2Options {
  onPhoneDetected: (phone: string) => void;
  onError?: (error: string) => void;
  onDigitsProgress?: (digits: string, count: number) => void;
}

type TranscriptionState = 'idle' | 'requesting_mic' | 'connecting' | 'listening' | 'processing' | 'error';

export function useVoiceTranscriptionV2({
  onPhoneDetected,
  onError,
  onDigitsProgress,
}: UseVoiceTranscriptionV2Options) {
  // États
  const [state, setState] = useState<TranscriptionState>('idle');
  const [transcript, setTranscript] = useState('');
  const [extractedDigits, setExtractedDigits] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Analyse du niveau audio
  const { 
    level: audioLevel, 
    isReceivingAudio, 
    startAnalyzing, 
    stopAnalyzing, 
    levelHistory 
  } = useAudioLevel({ threshold: 0.02, updateInterval: 50 });
  
  // Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const hasDetectedRef = useRef(false);
  const lastTextRef = useRef('');
  const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const globalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const cleanup = useCallback(() => {
    console.log('[VoiceV2] Cleanup');
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (globalTimeoutRef.current) {
      clearTimeout(globalTimeoutRef.current);
      globalTimeoutRef.current = null;
    }
    
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    stopAnalyzing();
  }, [stopAnalyzing]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);
  
  const handleTranscriptUpdate = useCallback((text: string, isFinal: boolean) => {
    console.log(`[VoiceV2] Transcript (${isFinal ? 'final' : 'partial'}):`, text);
    setTranscript(text);
    lastTextRef.current = text;
    
    if (hasDetectedRef.current) return;
    
    // Extraire les chiffres pour feedback
    const converted = convertWordsToDigits(text);
    const digitsOnly = converted.replace(/\D/g, '').slice(0, 10);
    setExtractedDigits(digitsOnly);
    
    if (digitsOnly.length > 0) {
      onDigitsProgress?.(digitsOnly, digitsOnly.length);
    }
    
    // Tentative d'extraction du numéro
    const phone = extractPhoneNumber(text);
    if (phone && phone.length >= 10) {
      console.log('[VoiceV2] Phone detected:', phone);
      hasDetectedRef.current = true;
      setState('processing');
      onPhoneDetected(phone);
      cleanup();
      return;
    }
    
    // Si on a assez de chiffres, attendre un silence pour finaliser
    if (isFinal && digitsOnly.length >= 8) {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        if (!hasDetectedRef.current && lastTextRef.current) {
          const finalPhone = extractPhoneNumber(lastTextRef.current);
          if (finalPhone && finalPhone.length >= 10) {
            hasDetectedRef.current = true;
            onPhoneDetected(finalPhone);
          } else {
            onError?.("Je n'ai pas compris ton numéro. Réessaie ou tape-le.");
          }
          cleanup();
        }
      }, 2000);
    }
  }, [onPhoneDetected, onDigitsProgress, onError, cleanup]);
  
  const startListening = useCallback(async () => {
    if (state !== 'idle' && state !== 'error') {
      console.log('[VoiceV2] Already listening, ignoring');
      return;
    }
    
    hasDetectedRef.current = false;
    setTranscript('');
    setExtractedDigits('');
    setErrorMessage(null);
    
    try {
      // Étape 1: Demander accès au micro
      setState('requesting_mic');
      console.log('[VoiceV2] Requesting microphone...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });
      
      mediaStreamRef.current = stream;
      
      // Démarrer l'analyse du niveau audio IMMÉDIATEMENT
      startAnalyzing(stream);
      console.log('[VoiceV2] Audio level analysis started');
      
      // Étape 2: Obtenir le token ElevenLabs
      setState('connecting');
      console.log('[VoiceV2] Getting token...');
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-scribe-token');
      
      if (error || !data?.token) {
        throw new Error('Service vocal indisponible');
      }
      
      // Étape 3: Connecter au WebSocket ElevenLabs
      console.log('[VoiceV2] Connecting to WebSocket...');
      
      const ws = new WebSocket(`wss://api.elevenlabs.io/v1/realtime_scribe?model_id=scribe_v2_realtime&token=${data.token}`);
      webSocketRef.current = ws;
      
      ws.onopen = () => {
        console.log('[VoiceV2] WebSocket connected');
        setState('listening');
        
        // Configurer l'envoi audio
        setupAudioSending(stream, ws);
        
        // Timeout global de 20 secondes
        globalTimeoutRef.current = setTimeout(() => {
          if (!hasDetectedRef.current) {
            console.log('[VoiceV2] Global timeout');
            onError?.("Temps écoulé. Réessaie ou tape ton numéro.");
            cleanup();
            setState('error');
          }
        }, 20000);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[VoiceV2] WS message:', data.type);
          
          if (data.type === 'partial_transcript') {
            handleTranscriptUpdate(data.text, false);
          } else if (data.type === 'committed_transcript') {
            handleTranscriptUpdate(data.text, true);
          } else if (data.type === 'error') {
            console.error('[VoiceV2] WS error:', data);
          }
        } catch (e) {
          console.error('[VoiceV2] Parse error:', e);
        }
      };
      
      ws.onerror = (event) => {
        console.error('[VoiceV2] WebSocket error:', event);
        setErrorMessage('Erreur de connexion');
        setState('error');
        cleanup();
      };
      
      ws.onclose = () => {
        console.log('[VoiceV2] WebSocket closed');
        // Retourner à idle si pas d'erreur explicite
        setState((currentState) => currentState === 'listening' ? 'idle' : currentState);
      };
      
    } catch (err: any) {
      console.error('[VoiceV2] Error:', err);
      
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        setErrorMessage('Autorise le micro pour utiliser la voix');
        toast.error('Micro non autorisé');
      } else {
        setErrorMessage(err?.message || 'Erreur de transcription');
        toast.error('Erreur vocale, utilise le clavier');
      }
      
      setState('error');
      onError?.(err?.message || 'Erreur de transcription');
      cleanup();
    }
  }, [state, startAnalyzing, handleTranscriptUpdate, onError, cleanup]);
  
  const setupAudioSending = (stream: MediaStream, ws: WebSocket) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      
      // Utiliser ScriptProcessorNode pour capturer l'audio
      // Note: deprecated mais plus compatible que AudioWorklet
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      processor.onaudioprocess = (event) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        
        const inputData = event.inputBuffer.getChannelData(0);
        
        // Convertir Float32 en Int16 pour ElevenLabs
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Encoder en base64
        const base64 = btoa(String.fromCharCode(...new Uint8Array(int16Data.buffer)));
        
        // Envoyer au serveur
        ws.send(JSON.stringify({
          type: 'audio',
          audio: base64,
        }));
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      console.log('[VoiceV2] Audio sending configured');
    } catch (err) {
      console.error('[VoiceV2] Audio setup error:', err);
    }
  };
  
  const stopListening = useCallback(() => {
    console.log('[VoiceV2] Stop listening');
    cleanup();
    setState('idle');
  }, [cleanup]);
  
  return {
    // État
    state,
    isIdle: state === 'idle',
    isRequestingMic: state === 'requesting_mic',
    isConnecting: state === 'connecting',
    isListening: state === 'listening',
    isProcessing: state === 'processing',
    hasError: state === 'error',
    errorMessage,
    
    // Transcription
    transcript,
    extractedDigits,
    
    // Niveau audio (NOUVEAU - feedback visuel)
    audioLevel,
    isReceivingAudio,
    levelHistory,
    
    // Actions
    startListening,
    stopListening,
  };
}

export default useVoiceTranscriptionV2;
