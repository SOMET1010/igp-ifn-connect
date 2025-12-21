import { useState, useRef } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { playPrerecordedAudio, stopAudio } from "@/lib/audioService";

interface CashDenominationPadProps {
  onAddAmount: (value: number) => void;
}

// CFA Bill colors matching real bills + audio keys
const BILLS = [
  { value: 500, bgColor: "bg-amber-100", textColor: "text-amber-900", borderColor: "border-amber-300", label: "500", audioKey: "bill_500" },
  { value: 1000, bgColor: "bg-blue-100", textColor: "text-blue-900", borderColor: "border-blue-300", label: "1 000", audioKey: "bill_1000" },
  { value: 2000, bgColor: "bg-pink-100", textColor: "text-pink-900", borderColor: "border-pink-300", label: "2 000", audioKey: "bill_2000" },
  { value: 5000, bgColor: "bg-green-100", textColor: "text-green-900", borderColor: "border-green-300", label: "5 000", audioKey: "bill_5000" },
  { value: 10000, bgColor: "bg-purple-100", textColor: "text-purple-900", borderColor: "border-purple-300", label: "10 000", audioKey: "bill_10000" },
];

const COINS = [
  { value: 25, label: "25", audioKey: "coin_25" },
  { value: 50, label: "50", audioKey: "coin_50" },
  { value: 100, label: "100", audioKey: "coin_100" },
  { value: 200, label: "200", audioKey: "coin_200" },
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

// TTS fallback using Web Speech API
const speakWithWebSpeech = (text: string, lang: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'dioula' ? 'fr-FR' : 'fr-FR'; // Use French voice for both
    utterance.rate = 0.9;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }
};

export function CashDenominationPad({ onAddAmount }: CashDenominationPadProps) {
  const { t, language } = useLanguage();
  const [showCoins, setShowCoins] = useState(false);
  const [floatingAmounts, setFloatingAmounts] = useState<FloatingAmountProps[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const playDenominationAudio = async (audioKey: string) => {
    // Stop any currently playing audio
    stopAudio(currentAudioRef.current);
    
    // Try pre-recorded audio first
    const result = await playPrerecordedAudio(audioKey, language);
    if (result.success && result.audio) {
      currentAudioRef.current = result.audio;
    } else {
      // Fallback to Web Speech TTS with translated text
      const text = t(audioKey);
      speakWithWebSpeech(text, language);
    }
  };

  const handleDenominationClick = (value: number, audioKey: string) => {
    triggerDenominationFeedback();
    onAddAmount(value);
    
    // Play audio feedback
    playDenominationAudio(audioKey);
    
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

      {/* Quick Bills Section */}
      <div className="bg-muted/30 rounded-2xl p-3">
        <p className="text-xs text-muted-foreground font-medium mb-2 text-center">
          {t("quick_bills") || "Billets rapides"}
        </p>
        
        <div className="grid grid-cols-5 gap-2">
          {BILLS.map((bill) => (
            <Button
              key={bill.value}
              type="button"
              variant="outline"
              className={`
                relative h-16 sm:h-20 flex flex-col items-center justify-center gap-0.5
                ${bill.bgColor} ${bill.textColor} ${bill.borderColor}
                border-2 rounded-xl font-bold
                transition-all duration-150 active:scale-90 hover:brightness-95
                shadow-sm hover:shadow-md
              `}
              onClick={() => handleDenominationClick(bill.value, bill.audioKey)}
            >
              {/* Floating amounts for this bill */}
              {floatingAmounts
                .filter(item => item.value === bill.value)
                .map(item => (
                  <FloatingAmount key={item.id} value={item.value} id={item.id} />
                ))
              }
              
              {/* Bill representation - stylized rectangle */}
              <div className={`w-10 h-5 sm:w-12 sm:h-6 rounded border ${bill.borderColor} ${bill.bgColor} flex items-center justify-center mb-0.5`}>
                <span className="text-[8px] sm:text-[10px] font-bold opacity-60">BCEAO</span>
              </div>
              
              {/* Value */}
              <span className="text-base sm:text-lg font-black leading-none">{bill.label}</span>
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
      >
        <Coins className="w-4 h-4 mr-2" />
        {showCoins ? (t("hide_coins") || "Masquer pièces") : (t("add_coins") || "+ Pièces")}
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
                onClick={() => handleDenominationClick(coin.value, coin.audioKey)}
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
