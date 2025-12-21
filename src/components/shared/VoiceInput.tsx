import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function VoiceInput({ onResult, placeholder = "Parlez maintenant...", className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  const startListening = () => {
    if (!isSupported) {
      toast.error("La reconnaissance vocale n'est pas supportée par ce navigateur");
      return;
    }

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
      console.error('Speech recognition error:', event.error);
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
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={startListening}
      disabled={isListening}
      className={cn(
        "h-14 w-14 rounded-full border-2 transition-all duration-200",
        isListening 
          ? "bg-destructive border-destructive text-destructive-foreground animate-pulse" 
          : "border-primary text-primary hover:bg-primary hover:text-primary-foreground",
        className
      )}
    >
      {isListening ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </Button>
  );
}
