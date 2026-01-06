/**
 * PhoneNumPad - Clavier numérique dédié pour saisie téléphone CI
 * 
 * Caractéristiques:
 * - Grille 3x4 avec boutons 0-9
 * - Effacer 1 chiffre / Effacer tout
 * - Blocage automatique à 10 chiffres
 * - Affichage formaté "01 23 45 67 89"
 * - Feedback haptique
 */

import React, { useCallback } from 'react';
import { Delete, X, Check } from 'lucide-react';
import { cn } from '@/shared/lib';
import { motion } from 'framer-motion';

interface PhoneNumPadProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (phone: string) => void;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'];

/**
 * Formater un numéro pour affichage: "0123456789" → "01 23 45 67 89"
 */
function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const chunks: string[] = [];
  
  for (let i = 0; i < cleaned.length; i += 2) {
    chunks.push(cleaned.slice(i, i + 2));
  }
  
  return chunks.join(' ');
}

export function PhoneNumPad({
  value,
  onChange,
  onComplete,
  maxLength = 10,
  disabled = false,
  className,
}: PhoneNumPadProps) {
  const isComplete = value.length >= maxLength;
  const remaining = maxLength - value.length;

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(15);
    }
  }, []);

  const handleDigit = useCallback((digit: string) => {
    if (disabled || value.length >= maxLength) return;
    
    triggerHaptic();
    const newValue = value + digit;
    onChange(newValue);
    
    if (newValue.length >= maxLength) {
      onComplete?.(newValue);
    }
  }, [value, onChange, onComplete, maxLength, disabled, triggerHaptic]);

  const handleDelete = useCallback(() => {
    if (disabled || value.length === 0) return;
    
    triggerHaptic();
    onChange(value.slice(0, -1));
  }, [value, onChange, disabled, triggerHaptic]);

  const handleClear = useCallback(() => {
    if (disabled) return;
    
    triggerHaptic();
    onChange('');
  }, [onChange, disabled, triggerHaptic]);

  const renderKey = (key: string) => {
    if (key === 'delete') {
      return (
        <motion.button
          key={key}
          type="button"
          onClick={handleDelete}
          disabled={disabled || value.length === 0}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "flex items-center justify-center h-14 rounded-xl bg-muted/50 hover:bg-muted transition-colors",
            "text-muted-foreground disabled:opacity-30"
          )}
        >
          <Delete className="w-6 h-6" />
        </motion.button>
      );
    }

    if (key === 'clear') {
      return (
        <motion.button
          key={key}
          type="button"
          onClick={handleClear}
          disabled={disabled || value.length === 0}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "flex items-center justify-center h-14 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors",
            "text-destructive disabled:opacity-30"
          )}
        >
          <X className="w-6 h-6" />
        </motion.button>
      );
    }

    return (
      <motion.button
        key={key}
        type="button"
        onClick={() => handleDigit(key)}
        disabled={disabled || isComplete}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "flex items-center justify-center h-14 rounded-xl font-bold text-2xl transition-colors",
          "bg-background hover:bg-muted border border-border",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        )}
      >
        {key}
      </motion.button>
    );
  };

  return (
    <div className={cn("w-full max-w-xs mx-auto", className)}>
      {/* Affichage du numéro formaté */}
      <div className="mb-4 p-4 bg-muted/30 rounded-2xl border border-border">
        <div className="text-center">
          <p className="text-3xl font-mono font-bold tracking-wider text-foreground min-h-[2.5rem]">
            {value.length > 0 ? formatPhoneDisplay(value) : (
              <span className="text-muted-foreground">__ __ __ __ __</span>
            )}
          </p>
          
          {/* Indicateur de progression */}
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: maxLength }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i < value.length ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
          
          {/* Message d'état */}
          <p className={cn(
            "text-sm mt-2 transition-colors",
            isComplete ? "text-emerald-600 font-medium" : "text-muted-foreground"
          )}>
            {isComplete ? (
              <span className="flex items-center justify-center gap-1">
                <Check className="w-4 h-4" />
                Numéro complet !
              </span>
            ) : (
              `${remaining} chiffre${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`
            )}
          </p>
        </div>
      </div>

      {/* Grille du clavier */}
      <div className="grid grid-cols-3 gap-2">
        {DIGITS.map(renderKey)}
      </div>
    </div>
  );
}
