import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { digitToScriptKey, getCashierScript } from "@/shared/config/audio/cashierScripts";
import type { LanguageCode } from "@/lib/translations";

interface CalculatorKeypadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  speakDigits?: boolean;
  language?: LanguageCode;
}

const keys = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["00", "0", "DEL"],
];

// Multi-sensory feedback
const triggerFeedback = (type: "key" | "delete" | "error") => {
  // Vibration feedback
  if ("vibrate" in navigator) {
    switch (type) {
      case "key":
        navigator.vibrate(30);
        break;
      case "delete":
        navigator.vibrate([20, 10, 20]);
        break;
      case "error":
        navigator.vibrate([50, 30, 50, 30, 50]);
        break;
    }
  }

  // Audio feedback (using Web Audio API for instant response)
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case "key":
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        break;
      case "delete":
        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.08;
        break;
      case "error":
        oscillator.frequency.value = 200;
        gainNode.gain.value = 0.15;
        break;
    }

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05);
  } catch {
    // Audio not available
  }
};

// TTS Helper - Speak digit or action
const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.0;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }
};

export function CalculatorKeypad({ 
  value, 
  onChange, 
  maxLength = 12,
  speakDigits = false,
  language = 'fr'
}: CalculatorKeypadProps) {
  const handleKeyPress = (key: string) => {
    if (key === "DEL") {
      triggerFeedback("delete");
      onChange(value.slice(0, -1));
      
      // Speak "Effacé" if speakDigits enabled
      if (speakDigits) {
        speakText(getCashierScript("cashier_cleared", language));
      }
    } else {
      // Check max length
      const currentDigits = value.replace(/\D/g, "");
      if (currentDigits.length >= maxLength) {
        triggerFeedback("error");
        return;
      }
      triggerFeedback("key");
      onChange(value + key);
      
      // Speak the digit if speakDigits enabled
      if (speakDigits) {
        const scriptKey = digitToScriptKey[key];
        if (scriptKey) {
          speakText(getCashierScript(scriptKey, language));
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-2xl">
      {keys.map((row, rowIndex) => (
        row.map((key) => (
          <Button
            key={`${rowIndex}-${key}`}
            type="button"
            variant={key === "DEL" ? "destructive" : "outline"}
            className={`
              h-20 sm:h-24 text-3xl sm:text-4xl font-bold rounded-xl
              transition-all duration-150 active:scale-90
              ${key === "DEL" 
                ? "bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30" 
                : "bg-card hover:bg-secondary/10 text-foreground border-border hover:border-secondary"
              }
            `}
            onClick={() => handleKeyPress(key)}
            aria-label={key === "DEL" ? "Effacer" : key}
          >
            {key === "DEL" ? (
              <Delete className="w-8 h-8 sm:w-10 sm:h-10" />
            ) : (
              key
            )}
          </Button>
        ))
      ))}
    </div>
  );
}

// Hook for triggering success feedback
export function useSuccessFeedback() {
  return () => {
    // Victory vibration pattern
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Success sound (pleasant ascending tone)
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = 0.15;

      // Play ascending notes
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        osc.frequency.value = freq;
        osc.connect(gainNode);
        osc.start(audioContext.currentTime + i * 0.1);
        osc.stop(audioContext.currentTime + i * 0.1 + 0.15);
      });
    } catch {
      // Audio not available
    }
  };
}
