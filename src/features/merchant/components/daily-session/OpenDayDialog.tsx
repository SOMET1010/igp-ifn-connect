import { useState, useEffect } from "react";
import { Sun, Banknote } from "lucide-react";
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

interface OpenDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { opening_cash: number; notes?: string }) => void;
  isLoading?: boolean;
}

export function OpenDayDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: OpenDayDialogProps) {
  const { t } = useLanguage();
  const [openingCash, setOpeningCash] = useState(0);
  const [notes, setNotes] = useState("");
  const [billCounts, setBillCounts] = useState<Record<number, number>>({});

  // Calculer le total à partir des billets
  useEffect(() => {
    const total = Object.entries(billCounts).reduce(
      (sum, [value, count]) => sum + Number(value) * count, 
      0
    );
    setOpeningCash(total);
  }, [billCounts]);

  const handleBillClick = (value: number) => {
    setBillCounts(prev => ({
      ...prev,
      [value]: (prev[value] || 0) + 1
    }));
    // Vibration feedback
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
      opening_cash: openingCash,
      notes: notes || undefined,
    });
  };

  const handleReset = () => {
    setOpeningCash(0);
    setNotes("");
    setBillCounts({});
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleReset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sun className="w-6 h-6 text-amber-500" />
            Ouvrir la journée
          </DialogTitle>
          <DialogDescription>
            Comptez votre fond de caisse pour démarrer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Compteur de billets */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary" />
              Billets en caisse
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
                  value={openingCash || ""}
                  onChange={(e) => {
                    setOpeningCash(parseInt(e.target.value) || 0);
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

          {/* Affichage du total */}
          <div className="bg-primary/10 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total fond de caisse</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(openingCash)} <span className="text-lg">FCFA</span>
            </p>
          </div>

          {/* Notes optionnelles */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm text-muted-foreground">
              Notes (optionnel)
            </Label>
            <Textarea
              id="notes"
              placeholder="Ex: Reçu 50 000 de la banque..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Bouton de confirmation */}
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="btn-kpata-primary w-full"
          >
            {isLoading ? "Ouverture..." : "Ouvrir ma journée"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
