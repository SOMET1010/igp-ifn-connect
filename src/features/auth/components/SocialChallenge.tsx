import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, ShieldAlert, Volume2 } from 'lucide-react';
import { useVoiceQueue } from '@/shared/hooks/useVoiceQueue';

interface SocialChallengeOption {
  label: string;
  icon: string;
  value: string;
}

interface SocialChallengeProps {
  question: string;
  options: SocialChallengeOption[];
  onAnswer: (value: string) => void;
  isLoading?: boolean;
  voiceEnabled?: boolean;
}

/**
 * SocialChallenge - Mini-check social ultra simple (Risk Gate Orange 🟠)
 * 
 * 1 question max, avec pictogrammes
 * Pas de lecture, pas d'écriture
 * Juste des icônes à taper
 * Bouton écouter la question
 */
export function SocialChallenge({
  question,
  options,
  onAnswer,
  isLoading = false,
  voiceEnabled = false,
}: SocialChallengeProps) {
  const { speak, isSpeaking } = useVoiceQueue();
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleListenQuestion = () => {
    speak(question, { priority: 'high' });
  };

  const handleOptionClick = (value: string) => {
    if (isLoading) return;
    setSelectedValue(value);
    // Petit délai pour montrer la sélection
    setTimeout(() => {
      onAnswer(value);
    }, 200);
  };

  return (
    <div className="space-y-4">
      {/* Header avec indicateur orange */}
      <div className="flex justify-center">
        <motion.div 
          className="w-14 h-14 rounded-full bg-amber-500/30 flex items-center justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          <ShieldAlert className="w-7 h-7 text-white" />
        </motion.div>
      </div>

      {/* Badge risque */}
      <div className="flex justify-center">
        <span className="bg-amber-500/30 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
          🟠 Petite vérification
        </span>
      </div>

      {/* Question */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-white">{question}</h3>
        <p className="text-white/70 text-xs mt-1">
          Tape sur ta réponse
        </p>
      </div>

      {/* Bouton écouter */}
      <div className="flex justify-center">
        <button
          onClick={handleListenQuestion}
          disabled={isSpeaking}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
            isSpeaking 
              ? "bg-white text-amber-600" 
              : "bg-white/20 text-white hover:bg-white/30"
          )}
        >
          <Volume2 className={cn("w-4 h-4", isSpeaking && "animate-pulse")} />
          {isSpeaking ? "Écoute..." : "🔊 Écouter la question"}
        </button>
      </div>

      {/* Options avec pictogrammes */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOptionClick(option.value)}
            disabled={isLoading}
            className={cn(
              "bg-white/95 rounded-2xl p-4 flex flex-col items-center gap-2",
              "hover:bg-white transition-all shadow-lg border-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              selectedValue === option.value 
                ? "border-emerald-500 bg-emerald-50" 
                : "border-transparent"
            )}
          >
            <span className="text-4xl">{option.icon}</span>
            <span className={cn(
              "text-sm font-semibold",
              selectedValue === option.value ? "text-emerald-600" : "text-gray-700"
            )}>
              {option.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      )}

      {/* Message de confiance */}
      <p className="text-center text-white/60 text-xs">
        🔒 C'est juste pour ta sécurité
      </p>
    </div>
  );
}
