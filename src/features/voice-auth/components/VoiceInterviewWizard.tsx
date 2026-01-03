import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Check, ChevronRight, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useSpeechTts } from "../hooks/useSpeechTts";
import type { VoiceAuthLang } from "../config/audioScripts";

interface InterviewQuestion {
  key: string;
  question: string;
  prompt: string;
}

interface InterviewAnswer {
  key: string;
  rawTranscription: string;
  processedValue: string;
  confidence: number;
}

interface VoiceInterviewWizardProps {
  lang: VoiceAuthLang;
  onComplete: (data: Record<string, string>) => void;
  onCancel?: () => void;
}

type RecordingState = "idle" | "listening" | "processing" | "confirmed";

export function VoiceInterviewWizard({ 
  lang, 
  onComplete, 
  onCancel 
}: VoiceInterviewWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [currentAnswer, setCurrentAnswer] = useState<InterviewAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { speakRaw, isSpeaking, stop: stopSpeaking } = useSpeechTts({
    lang,
    onEnd: () => {
      // Auto-start recording after speaking
      if (recordingState === "idle" && questions[currentStep]) {
        setTimeout(() => startRecording(), 500);
      }
    },
  });

  // Charger les questions au montage
  useEffect(() => {
    loadQuestions();
  }, [lang]);

  // Lire la question quand on change d'étape
  useEffect(() => {
    if (questions[currentStep] && recordingState === "idle") {
      speakQuestion(questions[currentStep].question);
    }
  }, [currentStep, questions]);

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("voice-interview", {
        body: { step: 0, language: lang },
      });

      if (error) throw error;

      // Charger toutes les questions
      const allQuestions: InterviewQuestion[] = [];
      for (let i = 0; i < data.totalSteps; i++) {
        const { data: q } = await supabase.functions.invoke("voice-interview", {
          body: { step: i, language: lang },
        });
        if (q?.question) {
          allQuestions.push(q.question);
        }
      }
      
      setQuestions(allQuestions);
    } catch (err) {
      console.error("Failed to load questions:", err);
      setError("Erreur de chargement des questions");
    }
  };

  const speakQuestion = (text: string) => {
    stopSpeaking();
    speakRaw(text);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          sampleRate: 16000 
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processRecording();
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecordingState("listening");
      setError(null);
      
      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 8000);
      
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Impossible d'accéder au micro");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecordingState("processing");
    }
  };

  const processRecording = async () => {
    try {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke("voice-interview", {
          body: {
            audio: base64Audio,
            language: lang,
            questionKey: questions[currentStep]?.key,
          },
        });

        if (error) throw error;

        if (data.success) {
          const answer: InterviewAnswer = {
            key: data.questionKey,
            rawTranscription: data.rawTranscription,
            processedValue: data.processedValue,
            confidence: data.confidence,
          };
          
          setCurrentAnswer(answer);
          setRecordingState("confirmed");
          
          // Lire la confirmation
          const confirmText = getConfirmationText(data.processedValue, data.questionKey);
          speakRaw(confirmText);
        } else {
          setError(data.error || "Erreur de transcription");
          setRecordingState("idle");
        }
      };
      
      reader.readAsDataURL(audioBlob);
      
    } catch (err) {
      console.error("Failed to process recording:", err);
      setError("Erreur de traitement audio");
      setRecordingState("idle");
    }
  };

  const getConfirmationText = (value: string, key: string) => {
    const confirmations: Record<string, Record<string, string>> = {
      suta: {
        full_name: `Tu t'appelles ${value}, c'est bien ça ?`,
        activity_type: `Tu vends ${value}, d'accord ?`,
        market_name: `Tu travailles au ${value}, c'est ça ?`,
        phone: `Ton numéro c'est ${value}, c'est bon ?`,
      },
      nouchi: {
        full_name: `C'est ${value} ton nom ?`,
        activity_type: `Tu fais ${value} là ?`,
        market_name: `Tu es au ${value} ?`,
        phone: `C'est ${value} ton numéro ?`,
      },
      fr: {
        full_name: `Vous êtes ${value}, correct ?`,
        activity_type: `Vous vendez ${value}, correct ?`,
        market_name: `Vous êtes au ${value}, correct ?`,
        phone: `Votre numéro est ${value}, correct ?`,
      },
    };

    return confirmations[lang]?.[key] || `${value}, c'est correct ?`;
  };

  const confirmAnswer = () => {
    if (currentAnswer) {
      setAnswers([...answers, currentAnswer]);
      setCurrentAnswer(null);
      
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
        setRecordingState("idle");
      } else {
        // Interview terminée
        const data: Record<string, string> = {};
        [...answers, currentAnswer].forEach(a => {
          data[a.key] = a.processedValue;
        });
        onComplete(data);
      }
    }
  };

  const retryAnswer = () => {
    setCurrentAnswer(null);
    setRecordingState("idle");
    speakQuestion(questions[currentStep]?.prompt || questions[currentStep]?.question);
  };

  const handleMicClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    
    if (recordingState === "idle") {
      startRecording();
    } else if (recordingState === "listening") {
      stopRecording();
    }
  };

  const getMicButtonClass = () => {
    switch (recordingState) {
      case "listening":
        return "bg-red-500 animate-pulse";
      case "processing":
        return "bg-amber-500";
      case "confirmed":
        return "bg-green-500";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  };

  const progress = questions.length > 0 ? ((currentStep + (currentAnswer ? 1 : 0)) / questions.length) * 100 : 0;

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              idx < currentStep ? "bg-green-500" :
              idx === currentStep ? "bg-primary" :
              "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Current question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center space-y-2"
        >
          <p className="text-lg font-medium text-foreground">
            {questions[currentStep]?.question || "Chargement..."}
          </p>
          {currentAnswer && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xl font-bold text-primary"
            >
              "{currentAnswer.processedValue}"
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Microphone button */}
      <motion.button
        onClick={handleMicClick}
        disabled={recordingState === "processing" || recordingState === "confirmed"}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center",
          "text-white shadow-lg transition-all",
          getMicButtonClass(),
          recordingState === "processing" && "cursor-wait",
          recordingState === "confirmed" && "cursor-default"
        )}
        whileTap={{ scale: 0.95 }}
        animate={recordingState === "listening" ? { scale: [1, 1.1, 1] } : {}}
        transition={recordingState === "listening" ? { repeat: Infinity, duration: 1 } : {}}
      >
        {recordingState === "listening" ? (
          <MicOff className="w-10 h-10" />
        ) : recordingState === "processing" ? (
          <motion.div
            className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        ) : recordingState === "confirmed" ? (
          <Check className="w-10 h-10" />
        ) : (
          <Mic className="w-10 h-10" />
        )}
      </motion.button>

      {/* Recording indicator */}
      {recordingState === "listening" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-red-500"
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium">Écoute en cours...</span>
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}

      {/* Confirmation buttons */}
      {recordingState === "confirmed" && currentAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 w-full max-w-xs"
        >
          <Button
            variant="outline"
            onClick={retryAnswer}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Répéter
          </Button>
          <Button
            onClick={confirmAnswer}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirmer
          </Button>
        </motion.div>
      )}

      {/* Re-listen button */}
      {recordingState === "idle" && !isSpeaking && questions[currentStep] && (
        <button
          onClick={() => speakQuestion(questions[currentStep].question)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Volume2 className="w-4 h-4" />
          Réécouter la question
        </button>
      )}

      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Passer à l'inscription classique
        </button>
      )}
    </div>
  );
}

export default VoiceInterviewWizard;
