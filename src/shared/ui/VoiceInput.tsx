import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Loader2, Square, AlertCircle, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageCode } from "@/shared/lib";
import logger from "@/infra/logger";
import { useAudioLevel } from "@/shared/audio";
import { AudioLevelMeter } from "./AudioLevelMeter";
import { 
  getSpeechRecognitionConstructor, 
  type SpeechRecognitionEvent,
  type SpeechRecognitionErrorEvent 
} from '@/shared/types';

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
  language?: LanguageCode;
}

// Langues supportées par LAFRICAMOBILE STT
const LAFRICAMOBILE_STT_LANGUAGES: LanguageCode[] = ['dioula'];

// Détecter le format audio supporté
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return 'audio/webm';
}

// Convertir un Blob en Base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier audio'));
    reader.readAsDataURL(blob);
  });
}

// Vérifier le support de l'enregistrement
function checkRecordingSupport(): { supported: boolean; reason?: string } {
  if (typeof window === 'undefined') {
    return { supported: false, reason: 'Environnement non navigateur' };
  }
  
  if (!navigator.mediaDevices?.getUserMedia) {
    return { supported: false, reason: 'getUserMedia non supporté' };
  }
  
  if (typeof MediaRecorder === 'undefined') {
    return { supported: false, reason: 'MediaRecorder non supporté' };
  }
  
  return { supported: true };
}

// Vérifier le support de Web Speech API
function checkWebSpeechSupport(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function VoiceInput({ 
  onResult, 
  placeholder = "Parlez maintenant...", 
  className,
  language = 'fr'
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { level: audioLevel, smoothedLevel: peakLevel, isClipping, startAnalysis, stopAnalysis } = useAudioLevel();

  const useLafricamobile = LAFRICAMOBILE_STT_LANGUAGES.includes(language);
  
  // Vérifier le support au montage
  const [support, setSupport] = useState<{ recording: boolean; webSpeech: boolean }>({
    recording: false,
    webSpeech: false
  });

  useEffect(() => {
    const recordingCheck = checkRecordingSupport();
    const webSpeechCheck = checkWebSpeechSupport();
    
    setSupport({
      recording: recordingCheck.supported,
      webSpeech: webSpeechCheck
    });

    logger.debug('Voice input support check', { 
      module: 'VoiceInput',
      recording: recordingCheck,
      webSpeech: webSpeechCheck,
      language,
      useLafricamobile
    });
  }, [language, useLafricamobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignorer
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    stopAnalysis();
    setIsRecording(false);
    setRecordingDuration(0);
  }, [stopAnalysis]);

  const processAudioWithLafricamobile = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    setErrorMessage(null);
    
    try {
      logger.info('Processing audio with LAFRICAMOBILE STT', { 
        module: 'VoiceInput',
        blobSize: audioBlob.size,
        blobType: audioBlob.type
      });

      if (audioBlob.size < 1000) {
        throw new Error('Enregistrement trop court');
      }

      const base64Audio = await blobToBase64(audioBlob);
      
      logger.debug('Audio converted to base64', { 
        module: 'VoiceInput',
        base64Length: base64Audio.length
      });
      
      const { data, error } = await supabase.functions.invoke('lafricamobile-stt', {
        body: { 
          audio: base64Audio, 
          language: language 
        }
      });

      if (error) {
        logger.error('Edge function error', error, { module: 'VoiceInput' });
        throw new Error(error.message || 'Erreur de connexion au service');
      }

      logger.debug('LAFRICAMOBILE STT response', { module: 'VoiceInput', data });

      if (!data?.success) {
        throw new Error(data?.error || 'Transcription échouée');
      }

      if (data.transcription && data.transcription.trim()) {
        onResult(data.transcription);
        toast.success("Transcription réussie", {
          description: data.transcription.substring(0, 50) + (data.transcription.length > 50 ? '...' : '')
        });
      } else {
        toast.warning("Aucune parole détectée", {
          description: "Essayez de parler plus fort ou plus clairement"
        });
      }
    } catch (error) {
      const err = error as Error;
      logger.error('LAFRICAMOBILE STT error', err, { module: 'VoiceInput' });
      setErrorMessage(err.message);
      toast.error("Erreur de reconnaissance vocale", {
        description: err.message
      });
    } finally {
      setIsProcessing(false);
    }
  }, [language, onResult]);

  const startLafricamobileRecording = useCallback(async () => {
    if (!support.recording) {
      toast.error("Enregistrement non supporté", {
        description: "Votre navigateur ne supporte pas l'enregistrement audio"
      });
      return;
    }

    setErrorMessage(null);
    
    try {
      logger.info('Starting LAFRICAMOBILE recording', { module: 'VoiceInput' });
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      // Démarrer l'analyse de niveau audio
      startAnalysis(stream);

      const mimeType = getSupportedMimeType();
      logger.debug('Using mimeType', { module: 'VoiceInput', mimeType });

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          logger.debug('Audio chunk received', { 
            module: 'VoiceInput', 
            size: event.data.size,
            totalChunks: audioChunksRef.current.length
          });
        }
      };

      mediaRecorder.onstop = async () => {
        logger.info('Recording stopped', { 
          module: 'VoiceInput',
          totalChunks: audioChunksRef.current.length
        });
        
        if (audioChunksRef.current.length === 0) {
          setErrorMessage('Aucune donnée audio capturée');
          toast.error("Erreur d'enregistrement", {
            description: "Aucune donnée audio capturée"
          });
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        
        logger.debug('Audio blob created', { 
          module: 'VoiceInput',
          size: audioBlob.size,
          type: audioBlob.type
        });
        
        if (audioBlob.size > 0) {
          await processAudioWithLafricamobile(audioBlob);
        }
      };

      mediaRecorder.onerror = (event) => {
        logger.error('MediaRecorder error', event, { module: 'VoiceInput' });
        setErrorMessage("Erreur d'enregistrement");
        toast.error("Erreur d'enregistrement");
        cleanup();
      };

      // Démarrer l'enregistrement
      mediaRecorder.start(500); // Chunks toutes les 500ms
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Timer pour afficher la durée
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // Limite de 30 secondes
      recordingTimeoutRef.current = setTimeout(() => {
        logger.info('Max recording duration reached', { module: 'VoiceInput' });
        toast.info("Durée maximale atteinte (30s)");
        stopRecording();
      }, 30000);

      logger.info('Recording started successfully', { module: 'VoiceInput' });

    } catch (error) {
      const err = error as Error;
      logger.error('Failed to start recording', err, { module: 'VoiceInput' });
      
      let message = "Impossible de démarrer l'enregistrement";
      if (err.name === 'NotAllowedError') {
        message = "Accès au microphone refusé";
      } else if (err.name === 'NotFoundError') {
        message = "Aucun microphone détecté";
      } else if (err.name === 'NotReadableError') {
        message = "Microphone en cours d'utilisation";
      }
      
      setErrorMessage(message);
      toast.error(message);
      cleanup();
    }
  }, [support.recording, processAudioWithLafricamobile, cleanup]);

  const stopRecording = useCallback(() => {
    logger.info('Stopping recording', { module: 'VoiceInput' });
    
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    stopAnalysis();
    setIsRecording(false);
    setRecordingDuration(0);
  }, [stopAnalysis]);

  const startWebSpeechRecognition = useCallback(() => {
    if (!support.webSpeech) {
      toast.error("Reconnaissance vocale non supportée", {
        description: "Votre navigateur ne supporte pas la reconnaissance vocale"
      });
      return;
    }

    setErrorMessage(null);
    
    try {
      const SpeechRecognitionClass = getSpeechRecognitionConstructor();
      if (!SpeechRecognitionClass) {
        throw new Error('Speech recognition not supported');
      }
      const recognition = new SpeechRecognitionClass();
      
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        logger.info('Web Speech recognition started', { module: 'VoiceInput' });
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        logger.info('Web Speech result', { 
          module: 'VoiceInput',
          transcript,
          confidence
        });
        
        onResult(transcript);
        setIsListening(false);
        
        toast.success("Transcription réussie", {
          description: transcript.substring(0, 50) + (transcript.length > 50 ? '...' : '')
        });
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        logger.error('Speech recognition error', event.error, { module: 'VoiceInput' });
        setIsListening(false);
        
        let message = "Erreur de reconnaissance vocale";
        if (event.error === 'not-allowed') {
          message = "Accès au microphone refusé";
        } else if (event.error === 'no-speech') {
          message = "Aucune parole détectée";
        } else if (event.error === 'network') {
          message = "Erreur réseau";
        }
        
        setErrorMessage(message);
        toast.error(message);
      };

      recognition.onend = () => {
        logger.debug('Web Speech recognition ended', { module: 'VoiceInput' });
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      logger.error('Failed to start Web Speech recognition', error, { module: 'VoiceInput' });
      setErrorMessage("Impossible de démarrer la reconnaissance vocale");
      toast.error("Erreur de reconnaissance vocale");
    }
  }, [support.webSpeech, onResult]);

  const handleClick = useCallback(() => {
    setErrorMessage(null);
    
    if (useLafricamobile) {
      if (isRecording) {
        stopRecording();
      } else if (!isProcessing) {
        startLafricamobileRecording();
      }
    } else {
      if (!isListening) {
        startWebSpeechRecognition();
      }
    }
  }, [useLafricamobile, isRecording, isProcessing, isListening, stopRecording, startLafricamobileRecording, startWebSpeechRecognition]);

  // Vérifier si supporté
  const isSupported = useLafricamobile ? support.recording : support.webSpeech;
  
  if (!isSupported) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled
        className={cn(
          "h-14 w-14 rounded-full border-2 opacity-50",
          className
        )}
        title="Reconnaissance vocale non supportée"
      >
        <MicOff className="w-6 h-6 text-muted-foreground" />
      </Button>
    );
  }

  const isActive = isListening || isRecording;
  const isDisabled = isProcessing;

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "h-14 w-14 rounded-full border-2 transition-all duration-200 relative",
          isActive 
            ? "bg-destructive border-destructive text-destructive-foreground animate-pulse" 
            : isProcessing
              ? "bg-muted border-muted-foreground"
              : errorMessage
                ? "border-destructive text-destructive"
                : "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
          className
        )}
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isRecording ? (
          <Square className="w-5 h-5 fill-current" />
        ) : isListening ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : errorMessage ? (
          <AlertCircle className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </Button>
      
      {/* Afficher l'indicateur de niveau audio et la durée */}
      {isRecording && (
        <div className="flex flex-col items-center gap-2">
          <AudioLevelMeter 
            level={audioLevel} 
            peakLevel={peakLevel}
            isClipping={isClipping}
            variant="bar"
            size="md"
            showPeak={true}
          />
          
          {isClipping && (
            <span className="text-xs text-destructive animate-pulse">
              ⚠️ Signal trop fort
            </span>
          )}
          
          <span className="text-sm font-mono text-destructive animate-pulse">
            {String(Math.floor(recordingDuration / 60)).padStart(2, '0')}:
            {String(recordingDuration % 60).padStart(2, '0')}
          </span>
        </div>
      )}
      
      {/* Afficher le statut */}
      {isProcessing && (
        <span className="text-xs text-muted-foreground">Transcription en cours...</span>
      )}
      
      {/* Afficher l'erreur */}
      {errorMessage && !isActive && !isProcessing && (
        <span className="text-xs text-destructive max-w-[150px] text-center">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
