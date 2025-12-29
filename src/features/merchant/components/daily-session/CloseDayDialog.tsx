import { useState, useEffect } from "react";
import { Moon, Banknote, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "../../utils/cashierCalculations";
import type { SessionSummary } from "../../types/dailySession.types";
import { cn } from "@/lib/utils";

// Images des billets
import bill500 from "@/assets/bills/500-fcfa.png";
import bill1000 from "@/assets/bills/1000-fcfa.png";
import bill2000 from "@/assets/bills/2000-fcfa.png";
import bill5000 from "@/assets/bills/5000-fcfa.png";
import bill10000 from "@/assets/bills/10000-fcfa.png";

const BILLS = [
  { value: 500, image: bill500, label: "500" },
  { value: 1000, image: bill1000, label: "1 000" },
  { value: 2000, image: bill2000, label: "2 000" },
  { value: 5000, image: bill5000, label: "5 000" },
  { value: 10000, image: bill10000, label: "10 000" },
];

interface CloseDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { closing_cash: number; notes?: string }) => void;
  getSummary: () => Promise<SessionSummary | null>;
  isLoading?: boolean;
}

export function CloseDayDialog({
  open,
  onOpenChange,
  onConfirm,
  getSummary,
  isLoading = false,
}: CloseDayDialogProps) {
  const { t } = useLanguage();
  const [closingCash, setClosingCash] = useState(0);
  const [notes, setNotes] = useState("");
  const [billCounts, setBillCounts] = useState<Record<number, number>>({});
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Charger le récapitulatif à l'ouverture
  useEffect(() => {
    if (open) {
      setLoadingSummary(true);
      getSummary()
        .then(setSummary)
        .finally(() => setLoadingSummary(false));
    }
  }, [open, getSummary]);

  // Calculer le total à partir des billets
  useEffect(() => {
    const total = Object.entries(billCounts).reduce(
      (sum, [value, count]) => sum + Number(value) * count, 
      0
    );
    setClosingCash(total);
  }, [billCounts]);

  const expectedCash = summary?.expectedCash || 0;
  const difference = closingCash - expectedCash;
  const isBalanced = Math.abs(difference) < 100;
  const isExcess = difference > 0;
  const isDeficit = difference < 0;

  const handleBillClick = (value: number) => {
    setBillCounts(prev => ({
      ...prev,
      [value]: (prev[value] || 0) + 1
    }));
    if ("vibrate" in navigator) {
      navigator.vibrate(40);
    }
  };

  const handleBillReset = (value: number) => {
    setBillCounts(prev => ({
      ...prev,
      [value]: 0
    }));
  };

  const handleConfirm = () => {
    onConfirm({
      closing_cash: closingCash,
      notes: notes || undefined,
    });
  };

  const handleReset = () => {
    setClosingCash(0);
    setNotes("");
    setBillCounts({});
    setSummary(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleReset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Moon className="w-6 h-6 text-indigo-500" />
            Fermer la journée
          </DialogTitle>
          <DialogDescription>
            Comptez votre caisse et validez le récapitulatif
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Récapitulatif de la journée */}
          {loadingSummary ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-muted rounded-xl" />
            </div>
          ) : summary && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Récapitulatif du jour
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Ventes</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(summary.totalSales)} FCFA
                  </p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold">{summary.totalTransactions}</p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Fond de caisse</p>
                  <p className="text-lg font-bold">{formatCurrency(summary.openingCash)} FCFA</p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Caisse attendue</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(summary.expectedCash)} FCFA
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Compteur de billets */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary" />
              Comptez votre caisse
            </Label>

            <div className="grid grid-cols-5 gap-2">
              {BILLS.map((bill) => (
                <div key={bill.value} className="flex flex-col items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="relative h-16 w-full p-1 rounded-xl transition-all duration-150 active:scale-90"
                    onClick={() => handleBillClick(bill.value)}
                  >
                    <div className="w-full h-10 overflow-hidden rounded-lg shadow-md border border-border/50">
                      <img 
                        src={bill.image} 
                        alt={`${bill.value} FCFA`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {billCounts[bill.value] > 0 && (
                      <span className="absolute -top-2 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {billCounts[bill.value]}
                      </span>
                    )}
                  </Button>
                  {billCounts[bill.value] > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground h-6 px-2"
                      onClick={() => handleBillReset(bill.value)}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Saisie manuelle alternative */}
            <div className="pt-2">
              <Label className="text-xs text-muted-foreground">Ou saisie directe</Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  placeholder="0"
                  value={closingCash || ""}
                  onChange={(e) => {
                    setClosingCash(parseInt(e.target.value) || 0);
                    setBillCounts({});
                  }}
                  className="text-lg font-bold text-center h-12 pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  FCFA
                </span>
              </div>
            </div>
          </div>

          {/* Indicateur d'écart */}
          {closingCash > 0 && summary && (
            <div className={cn(
              "rounded-xl p-4 text-center",
              isBalanced && "bg-green-100 dark:bg-green-900/30",
              isExcess && "bg-blue-100 dark:bg-blue-900/30",
              isDeficit && "bg-red-100 dark:bg-red-900/30"
            )}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {isBalanced && <CheckCircle className="w-5 h-5 text-green-600" />}
                {isExcess && <TrendingUp className="w-5 h-5 text-blue-600" />}
                {isDeficit && <TrendingDown className="w-5 h-5 text-red-600" />}
                <p className={cn(
                  "font-semibold",
                  isBalanced && "text-green-700 dark:text-green-400",
                  isExcess && "text-blue-700 dark:text-blue-400",
                  isDeficit && "text-red-700 dark:text-red-400"
                )}>
                  {isBalanced && "Caisse équilibrée !"}
                  {isExcess && `Excédent de ${formatCurrency(difference)} FCFA`}
                  {isDeficit && `Déficit de ${formatCurrency(Math.abs(difference))} FCFA`}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Compté: {formatCurrency(closingCash)} FCFA | Attendu: {formatCurrency(expectedCash)} FCFA
              </p>
            </div>
          )}

          {/* Notes optionnelles */}
          <div className="space-y-2">
            <Label htmlFor="close-notes" className="text-sm text-muted-foreground">
              Notes (optionnel)
            </Label>
            <Textarea
              id="close-notes"
              placeholder="Ex: Remis 100 000 à la banque..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Bouton de confirmation */}
          <Button
            onClick={handleConfirm}
            disabled={isLoading || closingCash === 0}
            className="btn-kpata-primary w-full"
          >
            {isLoading ? "Fermeture..." : "Fermer ma journée"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
