import { useState, useRef } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/shared/contexts";
import { playPrerecordedAudio, stopAudio } from "@/shared/lib";
import { getCashierScript, type CashierScriptKey } from "@/shared/config/audio/cashierScripts";

// Import bill images
import bill500 from "@/assets/bills/500-fcfa.png";
import bill1000 from "@/assets/bills/1000-fcfa.png";
import bill2000 from "@/assets/bills/2000-fcfa.png";
import bill5000 from "@/assets/bills/5000-fcfa.png";
import bill10000 from "@/assets/bills/10000-fcfa.png";

interface CashDenominationPadProps {
  onAddAmount: (value: number) => void;
  speakAmount?: boolean;
}

// CFA Bills with realistic images - mapping to cashier scripts
const BILLS = [
  { value: 500, image: bill500, label: "500", scriptKey: "cashier_bill_500" as CashierScriptKey },
  { value: 1000, image: bill1000, label: "1 000", scriptKey: "cashier_bill_1000" as CashierScriptKey },
  { value: 2000, image: bill2000, label: "2 000", scriptKey: "cashier_bill_2000" as CashierScriptKey },
  { value: 5000, image: bill5000, label: "5 000", scriptKey: "cashier_bill_5000" as CashierScriptKey },
  { value: 10000, image: bill10000, label: "10 000", scriptKey: "cashier_bill_10000" as CashierScriptKey },
];

const COINS = [
  { value: 25, label: "25", scriptKey: "cashier_coin_25" as CashierScriptKey },
  { value: 50, label: "50", scriptKey: "cashier_coin_50" as CashierScriptKey },
  { value: 100, label: "100", scriptKey: "cashier_coin_100" as CashierScriptKey },
  { value: 200, label: "200", scriptKey: "cashier_coin_200" as CashierScriptKey },
];

// Multi-sensory feedback for denomination tap
const triggerDenominationFeedback = () => {
  // Vibration feedback - short tap
  if ("vibrate" in navigator) {
    navigator.vibrate(40);
  }

  // Audio feedback - pleasant "pop" sound
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Pleasant pop frequency
    oscillator.frequency.value = 600;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch {
    // Audio not available
  }
};

interface FloatingAmountProps {
  value: number;
  id: string;
}

function FloatingAmount({ value }: FloatingAmountProps) {
  return (
    <span 
      className="absolute -top-8 left-1/2 -translate-x-1/2 text-xl font-bold text-success pointer-events-none animate-fade-out"
      style={{
        animation: "floatUp 0.6s ease-out forwards"
      }}
    >
      +{value.toLocaleString("fr-FR")}
    </span>
  );
}

// TTS using Web Speech API
const speakWithWebSpeech = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }
};

export function CashDenominationPad({ onAddAmount, speakAmount = false }: CashDenominationPadProps) {
  const { language } = useLanguage();
  const [showCoins, setShowCoins] = useState(false);
  const [floatingAmounts, setFloatingAmounts] = useState<FloatingAmountProps[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const playDenominationAudio = async (scriptKey: CashierScriptKey) => {
    if (!speakAmount) return;
    
    // Stop any currently playing audio
    stopAudio(currentAudioRef.current);
    
    // Try pre-recorded audio first (using script key as audio key)
    const result = await playPrerecordedAudio(scriptKey, language);
    if (result.success && result.audio) {
      currentAudioRef.current = result.audio;
    } else {
      // Fallback to Web Speech TTS with script text
      const text = getCashierScript(scriptKey, language);
      speakWithWebSpeech(text);
    }
  };

  const handleDenominationClick = (value: number, scriptKey: CashierScriptKey) => {
    triggerDenominationFeedback();
    onAddAmount(value);
    
    // Play audio feedback
    playDenominationAudio(scriptKey);
    
    // Add floating animation
    const id = `${Date.now()}-${value}`;
    setFloatingAmounts(prev => [...prev, { value, id }]);
    
    // Remove after animation
    setTimeout(() => {
      setFloatingAmounts(prev => prev.filter(item => item.id !== id));
    }, 600);
  };

  return (
    <div className="space-y-3">
      {/* CSS for floating animation */}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        }
      `}</style>

      {/* Quick Bills Section - ENLARGED */}
      <div className="bg-muted/30 rounded-2xl p-3">
        {/* Removed text label - pictograms speak for themselves */}
        <div className="grid grid-cols-5 gap-2">
          {BILLS.map((bill) => (
            <Button
              key={bill.value}
              type="button"
              variant="ghost"
              className="
                relative bill-button-xl h-24 p-1 flex flex-col items-center justify-center gap-1
                rounded-xl
                transition-all duration-150 active:scale-90 hover:brightness-95
                shadow-sm hover:shadow-lg
                bg-transparent hover:bg-muted/50
              "
              onClick={() => handleDenominationClick(bill.value, bill.scriptKey)}
              aria-label={`${bill.value} FCFA`}
            >
              {/* Floating amounts for this bill */}
              {floatingAmounts
                .filter(item => item.value === bill.value)
                .map(item => (
                  <FloatingAmount key={item.id} value={item.value} id={item.id} />
                ))
              }
              
              {/* Realistic bill image - ENLARGED */}
              <div className="w-full h-14 overflow-hidden rounded-lg shadow-md border border-border/50">
                <img 
                  src={bill.image} 
                  alt={`${bill.value} FCFA`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Value label */}
              <span className="text-xs sm:text-sm font-black text-foreground leading-none mt-0.5">
                {bill.label}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Coins Toggle Button */}
      <Button
        type="button"
        variant="ghost"
        className="w-full h-10 text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setShowCoins(!showCoins)}
        aria-expanded={showCoins}
        aria-label={showCoins ? "Masquer pièces" : "Afficher pièces"}
      >
        <Coins className="w-5 h-5 mr-2" />
        {showCoins ? "−" : "+"}
      </Button>

      {/* Coins Section - Hidden by default */}
      {showCoins && (
        <div className="bg-muted/20 rounded-xl p-3 animate-fade-in">
          <div className="grid grid-cols-4 gap-2">
            {COINS.map((coin) => (
              <Button
                key={coin.value}
                type="button"
                variant="outline"
                className="
                  relative h-14 flex flex-col items-center justify-center
                  bg-gradient-to-b from-amber-200 to-amber-300 
                  border-2 border-amber-400 rounded-full
                  text-amber-900 font-bold
                  transition-all duration-150 active:scale-90
                  shadow-sm hover:shadow-md
                "
                onClick={() => handleDenominationClick(coin.value, coin.scriptKey)}
                aria-label={`${coin.value} FCFA`}
              >
                {/* Floating amounts for this coin */}
                {floatingAmounts
                  .filter(item => item.value === coin.value)
                  .map(item => (
                    <FloatingAmount key={item.id} value={item.value} id={item.id} />
                  ))
                }
                
                <span className="text-lg font-black">{coin.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
