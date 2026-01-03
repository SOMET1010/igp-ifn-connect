import { useState, useCallback, useRef } from 'react';
import { useScribe } from '@elevenlabs/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface UseVoiceTranscriptionOptions {
  onPhoneDetected: (phone: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceTranscription({ 
  onPhoneDetected, 
  onError 
}: UseVoiceTranscriptionOptions) {
  const [transcript, setTranscript] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasDetectedRef = useRef(false);

  const scribe = useScribe({
    modelId: 'scribe_v2_realtime',
    onPartialTranscript: (data) => {
      console.log('[STT] Partial:', data.text);
      setTranscript(data.text);
      
      // Essayer d'extraire un numéro à chaque mise à jour
      if (!hasDetectedRef.current) {
        const phone = extractPhoneNumber(data.text);
        if (phone && phone.length >= 10) {
          console.log('[STT] Phone detected in partial:', phone);
          hasDetectedRef.current = true;
          onPhoneDetected(phone);
        }
      }
    },
    onCommittedTranscript: (data) => {
      console.log('[STT] Committed:', data.text);
      setTranscript(data.text);
      
      // Dernière tentative d'extraction
      if (!hasDetectedRef.current) {
        const phone = extractPhoneNumber(data.text);
        if (phone && phone.length >= 10) {
          console.log('[STT] Phone detected in committed:', phone);
          hasDetectedRef.current = true;
          onPhoneDetected(phone);
        }
      }
    },
  });

  const startListening = useCallback(async () => {
    setIsConnecting(true);
    hasDetectedRef.current = false;
    setTranscript('');

    try {
      console.log('[STT] Requesting token...');
      
      // Obtenir un token depuis l'edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-scribe-token');
      
      if (error) {
        console.error('[STT] Token error:', error);
        throw new Error('Erreur de connexion au service vocal');
      }
      
      if (!data?.token) {
        console.error('[STT] No token received');
        throw new Error('Token non reçu');
      }

      console.log('[STT] Token received, connecting...');

      // Connecter au service de transcription
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

      // Timeout de détection (15 secondes max)
      detectionTimeoutRef.current = setTimeout(() => {
        if (!hasDetectedRef.current) {
          console.log('[STT] Detection timeout');
          onError?.('Je n\'ai pas compris ton numéro. Réessaie ou tape-le.');
          scribe.disconnect();
        }
      }, 15000);

    } catch (err: any) {
      console.error('[STT] Error:', err);
      setIsConnecting(false);
      
      // Message d'erreur adapté
      if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
        onError?.('Autorise le micro pour utiliser la voix');
        toast.error('Micro non autorisé');
      } else {
        onError?.(err.message || 'Erreur de transcription');
        toast.error('Erreur vocale, utilise le clavier');
      }
      
      throw err;
    }
  }, [scribe, onPhoneDetected, onError]);

  const stopListening = useCallback(() => {
    console.log('[STT] Stopping...');
    
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
    
    scribe.disconnect();
    setIsConnecting(false);
  }, [scribe]);

  return {
    startListening,
    stopListening,
    isConnected: scribe.isConnected,
    isConnecting,
    transcript,
    partialTranscript: scribe.partialTranscript || '',
  };
}
