import React from "react";
import { cn } from "@/lib/utils";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface BillOption {
  value: number;
  color: string;
  textColor?: string;
}

interface PnavimBillSelectorProps {
  /** Callback quand un billet est sélectionné */
  onSelect: (value: number) => void;
  /** Billets à afficher (défaut: CFA standards) */
  bills?: BillOption[];
  /** Classes additionnelles */
  className?: string;
}

const defaultBills: BillOption[] = [
  { value: 500, color: "bg-amber-100 border-amber-300", textColor: "text-amber-800" },
  { value: 1000, color: "bg-blue-100 border-blue-300", textColor: "text-blue-800" },
  { value: 2000, color: "bg-pink-100 border-pink-300", textColor: "text-pink-800" },
  { value: 5000, color: "bg-green-100 border-green-300", textColor: "text-green-800" },
  { value: 10000, color: "bg-orange-100 border-orange-300", textColor: "text-orange-800" },
];

/**
 * Sélecteur de billets CFA visuels
 * Grandes cartes tactiles colorées
 */
export const PnavimBillSelector: React.FC<PnavimBillSelectorProps> = ({
  onSelect,
  bills = defaultBills,
  className,
}) => {
  const { triggerMoney } = useSensoryFeedback();
  const prefersReducedMotion = useReducedMotion();

  const handleSelect = (value: number) => {
    triggerMoney();
    onSelect(value);
  };

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {bills.map((bill) => (
        <button
          key={bill.value}
          onClick={() => handleSelect(bill.value)}
          className={cn(
            // Base
            "relative rounded-2xl border-2 p-4",
            bill.color,
            // Min height pour tactile
            "min-h-[72px]",
            // Layout
            "flex flex-col items-center justify-center",
            // Effets
            !prefersReducedMotion && "transition-all duration-150 hover:scale-105 active:scale-95",
            prefersReducedMotion && "active:opacity-80",
            // Ombre
            "shadow-md hover:shadow-lg"
          )}
        >
          {/* Montant */}
          <span className={cn(
            "text-2xl font-nunito font-extrabold",
            bill.textColor || "text-charbon"
          )}>
            {formatAmount(bill.value)}
          </span>
          {/* Devise */}
          <span className={cn(
            "text-xs font-medium opacity-60",
            bill.textColor || "text-charbon"
          )}>
            FCFA
          </span>
        </button>
      ))}
    </div>
  );
};

export default PnavimBillSelector;
