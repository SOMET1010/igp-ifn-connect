import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LanguageCode } from "@/lib/translations";
import logger from "@/infra/logger";

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
  language?: LanguageCode;
}

// Langues supportées par LAFRICAMOBILE STT
const LAFRICAMOBILE_STT_LANGUAGES: LanguageCode[] = ['dioula'];

// Convertir un Blob en Base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
  const [isSupported, setIsSupported] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const useLafricamobile = LAFRICAMOBILE_STT_LANGUAGES.includes(language);

  useEffect(() => {
    // Vérifier le support selon le mode
    if (useLafricamobile) {
      // Pour LAFRICAMOBILE, vérifier MediaRecorder
      setIsSupported(typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia !== undefined);
    } else {
      // Pour Web Speech API
      setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }
  }, [useLafricamobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const processAudioWithLafricamobile = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const base64Audio = await blobToBase64(audioBlob);
      
      logger.debug('Sending audio to LAFRICAMOBILE STT', { module: 'VoiceInput' });
      
      const { data, error } = await supabase.functions.invoke('lafricamobile-stt', {
        body: { 
          audio: base64Audio, 
          language: language 
        }
      });

      if (error) {
        logger.error('Edge function error', error, { module: 'VoiceInput' });
        throw new Error(error.message || 'Erreur de transcription');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Transcription échouée');
      }

      if (data.transcription) {
        onResult(data.transcription);
        toast.success("Transcription réussie");
      } else {
        toast.warning("Aucune parole détectée");
      }
    } catch (error) {
      logger.error('LAFRICAMOBILE STT error', error, { module: 'VoiceInput' });
      toast.error("Erreur de reconnaissance vocale");
    } finally {
      setIsProcessing(false);
    }
  }, [language, onResult]);

  const startLafricamobileRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Trouver un mimeType supporté
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        
        if (audioBlob.size > 0) {
          await processAudioWithLafricamobile(audioBlob);
        }
      };

      mediaRecorder.onerror = (event) => {
        logger.error('MediaRecorder error', event, { module: 'VoiceInput' });
        toast.error("Erreur d'enregistrement");
        stopRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Limite de 30 secondes
      recordingTimeoutRef.current = setTimeout(() => {
        if (isRecording) {
          toast.info("Durée maximale atteinte");
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      logger.error('Failed to start recording', error, { module: 'VoiceInput' });
      if ((error as Error).name === 'NotAllowedError') {
        toast.error("Accès au microphone refusé");
      } else {
        toast.error("Impossible de démarrer l'enregistrement");
      }
    }
  }, [isRecording, processAudioWithLafricamobile, stopRecording]);

  const startWebSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      logger.error('Speech recognition error', event.error, { module: 'VoiceInput' });
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error("Accès au microphone refusé");
      } else {
        toast.error("Erreur de reconnaissance vocale");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [onResult]);

  const handleClick = useCallback(() => {
    if (!isSupported) {
      toast.error("La reconnaissance vocale n'est pas supportée par ce navigateur");
      return;
    }

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
  }, [isSupported, useLafricamobile, isRecording, isProcessing, isListening, stopRecording, startLafricamobileRecording, startWebSpeechRecognition]);

  if (!isSupported) {
    return null;
  }

  const isActive = isListening || isRecording;
  const isDisabled = isProcessing;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        "h-14 w-14 rounded-full border-2 transition-all duration-200",
        isActive 
          ? "bg-destructive border-destructive text-destructive-foreground animate-pulse" 
          : isProcessing
            ? "bg-muted border-muted-foreground"
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
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </Button>
  );
}
