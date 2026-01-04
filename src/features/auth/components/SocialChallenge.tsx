import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, ShieldCheck } from 'lucide-react';

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
 * SocialChallenge - Mini-check social ultra simple
 * 
 * 1 question max, avec pictogrammes
 * Pas de lecture, pas d'écriture
 * Juste des icônes à taper
 */
export function SocialChallenge({
  question,
  options,
  onAnswer,
  isLoading = false,
  voiceEnabled = false,
}: SocialChallengeProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Question */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-white">{question}</h3>
        <p className="text-white/70 text-xs mt-1">
          Tape sur ta réponse
        </p>
      </div>

      {/* Options avec pictogrammes */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer(option.value)}
            disabled={isLoading}
            className={cn(
              "bg-white/95 rounded-2xl p-4 flex flex-col items-center gap-2",
              "hover:bg-white transition-all shadow-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <span className="text-4xl">{option.icon}</span>
            <span className="text-sm font-semibold text-gray-700">{option.label}</span>
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
        🔒 Vérification de sécurité rapide
      </p>
    </div>
  );
}
