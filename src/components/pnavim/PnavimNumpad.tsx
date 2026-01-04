import React from "react";
import { cn } from "@/lib/utils";
import { Delete, Check } from "lucide-react";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PnavimNumpadProps {
  /** Callback quand un chiffre est pressé */
  onDigit: (digit: string) => void;
  /** Callback pour effacer */
  onDelete: () => void;
  /** Callback pour valider */
  onConfirm: () => void;
  /** Désactiver la validation */
  disableConfirm?: boolean;
  /** Afficher le bouton valider */
  showConfirm?: boolean;
  /** Classes additionnelles */
  className?: string;
}

/**
 * Clavier numérique XXL PNAVIM
 * Touches min 64px, feedback haptique
 */
export const PnavimNumpad: React.FC<PnavimNumpadProps> = ({
  onDigit,
  onDelete,
  onConfirm,
  disableConfirm = false,
  showConfirm = true,
  className,
}) => {
  const { triggerTap, triggerSuccess } = useSensoryFeedback();
  const prefersReducedMotion = useReducedMotion();

  const handleDigit = (digit: string) => {
    triggerTap();
    onDigit(digit);
  };

  const handleDelete = () => {
    triggerTap();
    onDelete();
  };

  const handleConfirm = () => {
    if (!disableConfirm) {
      triggerSuccess();
      onConfirm();
    }
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  const buttonBase = cn(
    // Base
    "rounded-2xl font-nunito font-bold text-2xl",
    // Taille min tactile
    "min-h-[64px] min-w-[64px]",
    // Layout
    "flex items-center justify-center",
    // Transitions
    !prefersReducedMotion && "transition-all duration-100",
    // Active
    !prefersReducedMotion && "active:scale-95",
    prefersReducedMotion && "active:opacity-80"
  );

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {/* Chiffres 1-9 */}
      {digits.map((digit) => (
        <button
          key={digit}
          onClick={() => handleDigit(digit)}
          className={cn(
            buttonBase,
            "bg-white border-2 border-charbon/10 text-charbon",
            "hover:bg-orange-sanguine/10 hover:border-orange-sanguine/30",
            "shadow-sm"
          )}
        >
          {digit}
        </button>
      ))}

      {/* Effacer */}
      <button
        onClick={handleDelete}
        className={cn(
          buttonBase,
          "bg-muted border-2 border-charbon/10 text-charbon/70",
          "hover:bg-destructive/10 hover:text-destructive"
        )}
        aria-label="Effacer"
      >
        <Delete className="w-7 h-7" />
      </button>

      {/* 0 */}
      <button
        onClick={() => handleDigit("0")}
        className={cn(
          buttonBase,
          "bg-white border-2 border-charbon/10 text-charbon",
          "hover:bg-orange-sanguine/10 hover:border-orange-sanguine/30",
          "shadow-sm"
        )}
      >
        0
      </button>

      {/* Valider */}
      {showConfirm ? (
        <button
          onClick={handleConfirm}
          disabled={disableConfirm}
          className={cn(
            buttonBase,
            disableConfirm
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-gradient-to-br from-vert-manioc to-green-dark text-white shadow-lg hover:shadow-glow-green"
          )}
          aria-label="Valider"
        >
          <Check className="w-7 h-7" />
        </button>
      ) : (
        <div /> // Placeholder vide
      )}
    </div>
  );
};

export default PnavimNumpad;
