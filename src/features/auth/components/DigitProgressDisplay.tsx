import React from 'react';
import { cn } from '@/shared/lib';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Mic } from 'lucide-react';

interface DigitProgressDisplayProps {
  digits: string;
  currentIndex: number;
  isListening: boolean;
  totalDigits?: number;
  className?: string;
}

/**
 * DigitProgressDisplay - Affiche la progression des chiffres dictés
 * 
 * Affiche 10 cases pour un numéro de téléphone ivoirien.
 * La case courante pulse pendant l'écoute.
 */
export function DigitProgressDisplay({
  digits,
  currentIndex,
  isListening,
  totalDigits = 10,
  className
}: DigitProgressDisplayProps) {
  const digitArray = digits.split('');
  
  return (
    <div className={cn("flex flex-wrap justify-center gap-2", className)}>
      {Array.from({ length: totalDigits }).map((_, index) => {
        const digit = digitArray[index];
        const isFilled = digit !== undefined;
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        
        return (
          <motion.div
            key={index}
            className={cn(
              "relative w-10 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all",
              "border-2",
              isFilled 
                ? "bg-primary/20 border-primary text-primary" 
                : isCurrent 
                  ? "bg-orange-sanguine/10 border-orange-sanguine border-dashed"
                  : "bg-muted/30 border-muted-foreground/20 text-muted-foreground/40"
            )}
            animate={isCurrent && isListening ? {
              scale: [1, 1.05, 1],
              borderColor: ['hsl(var(--orange-sanguine))', 'hsl(var(--primary))', 'hsl(var(--orange-sanguine))'],
            } : {}}
            transition={{
              duration: 1,
              repeat: isCurrent && isListening ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <AnimatePresence mode="wait">
              {isFilled ? (
                <motion.span
                  key={`digit-${index}-${digit}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-xl font-bold"
                >
                  {digit}
                </motion.span>
              ) : isCurrent && isListening ? (
                <motion.div
                  key="mic"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="text-orange-sanguine"
                >
                  <Mic className="w-5 h-5" />
                </motion.div>
              ) : (
                <span className="text-muted-foreground/30">–</span>
              )}
            </AnimatePresence>
            
            {/* Indicateur de position */}
            {index === 1 || index === 3 || index === 5 || index === 7 ? (
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-muted-foreground/10" />
            ) : null}
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * DigitConfirmation - Affiche le chiffre détecté avec animation
 */
interface DigitConfirmationProps {
  digit: string;
  onConfirm: () => void;
  onReject: () => void;
}

export function DigitConfirmation({ digit, onConfirm, onReject }: DigitConfirmationProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <motion.div 
        className="bg-card rounded-3xl p-8 shadow-2xl text-center"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        <div className="text-6xl font-bold text-primary mb-4">{digit}</div>
        <p className="text-muted-foreground mb-6">C'est bon ?</p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={onReject}
            className="px-6 py-3 rounded-full bg-destructive/20 text-destructive font-medium"
          >
            Non
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Oui
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
