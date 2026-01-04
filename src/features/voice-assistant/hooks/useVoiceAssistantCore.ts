/**
 * Hook principal de l'assistant vocal unifié
 * Orchestre STT, TTS, parsing et états
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { 
  VoiceAssistantState, 
  VoiceMode, 
  VoiceIntent, 
  VoiceCommand,
  TranscriptionEvent 
} from '../types/voice.types';
import { parseVoiceInput } from '../services/intentParser';
import { speak, stopSpeaking, initVoices, isTTSAvailable } from '../services/textToSpeech';
import { 
  initSpeechRecognition, 
  startListening, 
  stopListening, 
  isSTTAvailable,
  cleanup as cleanupSTT 
} from '../services/speechToText';
import { VOICE_SCRIPTS, formatScript, getRandomCongrats } from '@/shared/config/audio/voiceAssistantScripts';

interface UseVoiceAssistantCoreOptions {
  mode: VoiceMode;
  onSaleConfirmed?: (command: VoiceCommand) => void;
  onStockUpdated?: (command: VoiceCommand) => void;
  onArticleCreated?: (command: VoiceCommand) => void;
}

interface UseVoiceAssistantCoreReturn {
  // État
  state: VoiceAssistantState;
  isListening: boolean;
  isProcessing: boolean;
  isOffline: boolean;
  
  // Données
  transcript: string;
  lastCommand: VoiceCommand | null;
  lastPhrase: string;
  
  // Actions
  startVoice: () => void;
  stopVoice: () => void;
  confirm: () => void;
  cancel: () => void;
  repeat: () => void;
  sayText: (text: string) => Promise<void>;
  
  // Disponibilité
  isTTSAvailable: boolean;
  isSTTAvailable: boolean;
}

export function useVoiceAssistantCore({
  mode,
  onSaleConfirmed,
  onStockUpdated,
  onArticleCreated
}: UseVoiceAssistantCoreOptions): UseVoiceAssistantCoreReturn {
  // États
  const [state, setState] = useState<VoiceAssistantState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [lastPhrase, setLastPhrase] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Refs
  const sttInitialized = useRef(false);
  const commandIdCounter = useRef(0);
  
  // Surveiller la connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      speak(VOICE_SCRIPTS.offline.synced);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Initialiser TTS
  useEffect(() => {
    initVoices();
  }, []);
  
  // Callback de transcription
  const handleTranscription = useCallback((event: TranscriptionEvent) => {
    setTranscript(event.text);
    
    if (event.isFinal && event.text.trim()) {
      console.log('[VoiceAssistant] Transcription finale:', event.text);
      
      // Parser l'intent
      const result = parseVoiceInput(event.text);
      
      if (result.success && result.intent) {
        setState('confirming');
        stopListening();
        
        const command: VoiceCommand = {
          id: `cmd-${++commandIdCounter.current}`,
          timestamp: Date.now(),
          rawText: event.text,
          intent: result.intent,
          status: 'pending',
          mode
        };
        
        setLastCommand(command);
        
        // Feedback vocal selon l'intent
        let confirmPhrase = '';
        
        if (result.intent.intent === 'SALE_CREATE') {
          const sale = result.intent as { amountXOF?: number; productName?: string };
          if (sale.amountXOF && sale.productName) {
            confirmPhrase = formatScript(VOICE_SCRIPTS.sales.confirm, {
              product: sale.productName,
              amount: sale.amountXOF.toLocaleString('fr-FR')
            });
          } else if (sale.amountXOF) {
            confirmPhrase = formatScript(VOICE_SCRIPTS.sales.heard, {
              amount: sale.amountXOF.toLocaleString('fr-FR')
            });
          }
        } else if (result.intent.intent === 'CONFIRM') {
          confirm();
          return;
        } else if (result.intent.intent === 'CANCEL') {
          cancel();
          return;
        } else if (result.intent.intent === 'REPEAT') {
          repeat();
          return;
        }
        
        if (confirmPhrase) {
          setLastPhrase(confirmPhrase);
          speak(confirmPhrase);
        }
      } else {
        // Intent non reconnu
        speak(VOICE_SCRIPTS.control.notUnderstood);
      }
    }
  }, [mode]);
  
  // Callback d'erreur STT
  const handleSTTError = useCallback((error: string) => {
    console.error('[VoiceAssistant] Erreur STT:', error);
    setState('error');
    speak(error);
  }, []);
  
  // Callback de statut STT
  const handleSTTStatus = useCallback((status: 'started' | 'stopped' | 'error') => {
    setIsListening(status === 'started');
    if (status === 'started') {
      setState('listening');
    } else if (status === 'stopped' && state === 'listening') {
      setState('processing');
    }
  }, [state]);
  
  // Initialiser STT
  useEffect(() => {
    if (!sttInitialized.current && isSTTAvailable()) {
      sttInitialized.current = initSpeechRecognition(
        handleTranscription,
        handleSTTError,
        handleSTTStatus
      );
    }
    
    return () => {
      cleanupSTT();
      sttInitialized.current = false;
    };
  }, [handleTranscription, handleSTTError, handleSTTStatus]);
  
  // Actions
  const startVoice = useCallback(() => {
    if (!sttInitialized.current) {
      sttInitialized.current = initSpeechRecognition(
        handleTranscription,
        handleSTTError,
        handleSTTStatus
      );
    }
    
    stopSpeaking(); // Arrêter TTS en cours
    setTranscript('');
    setState('listening');
    
    // Vibration si disponible
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    startListening();
  }, [handleTranscription, handleSTTError, handleSTTStatus]);
  
  const stopVoice = useCallback(() => {
    stopListening();
    setState('idle');
  }, []);
  
  const confirm = useCallback(() => {
    if (!lastCommand) return;
    
    const confirmed: VoiceCommand = { ...lastCommand, status: 'confirmed' };
    
    // Callbacks selon le type
    if (confirmed.intent.intent === 'SALE_CREATE') {
      onSaleConfirmed?.(confirmed);
    } else if (confirmed.intent.intent.startsWith('STOCK_')) {
      onStockUpdated?.(confirmed);
    } else if (confirmed.intent.intent.startsWith('ARTICLE_')) {
      onArticleCreated?.(confirmed);
    }
    
    setState('success');
    speak(getRandomCongrats());
    
    // Vibration de succès
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
    
    // Reset après délai
    setTimeout(() => {
      setState('idle');
      setLastCommand(null);
      setTranscript('');
    }, 2000);
  }, [lastCommand, onSaleConfirmed, onStockUpdated, onArticleCreated]);
  
  const cancel = useCallback(() => {
    if (lastCommand) {
      setLastCommand({ ...lastCommand, status: 'cancelled' });
    }
    
    setState('idle');
    setTranscript('');
    speak(VOICE_SCRIPTS.control.cancel);
    
    setTimeout(() => {
      setLastCommand(null);
    }, 1000);
  }, [lastCommand]);
  
  const repeat = useCallback(() => {
    if (lastPhrase) {
      speak(formatScript(VOICE_SCRIPTS.control.repeat, { lastPhrase }));
    } else {
      speak(VOICE_SCRIPTS.control.notUnderstood);
    }
  }, [lastPhrase]);
  
  const sayText = useCallback(async (text: string) => {
    setLastPhrase(text);
    await speak(text);
  }, []);
  
  return {
    state,
    isListening,
    isProcessing: state === 'processing',
    isOffline,
    transcript,
    lastCommand,
    lastPhrase,
    startVoice,
    stopVoice,
    confirm,
    cancel,
    repeat,
    sayText,
    isTTSAvailable: isTTSAvailable(),
    isSTTAvailable: isSTTAvailable()
  };
}
