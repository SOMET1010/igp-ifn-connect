import { Banknote, Smartphone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/shared/contexts";
import { useSensoryFeedback } from "@/shared/hooks";
import type { PaymentMethod } from "../../types/transaction.types";
import { formatCurrency } from "../../utils/cashierCalculations";

// ============================================
// Props du composant
// ============================================
interface CashierConfirmStepProps {
  amount: number;
  method: PaymentMethod;
  cmuDeduction: number;
  rstiDeduction: number;
  isLoading: boolean;
  onConfirm: () => void;
  onEdit: () => void;
}

// ============================================
// Composant étape de confirmation
// ============================================
export function CashierConfirmStep({
  amount,
  method,
  cmuDeduction,
  rstiDeduction,
  isLoading,
  onConfirm,
  onEdit,
}: CashierConfirmStepProps) {
  const { t } = useLanguage();
  const { triggerTap } = useSensoryFeedback();
  const formattedAmount = formatCurrency(amount);

  const handleEdit = () => {
    triggerTap();
    onEdit();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-2 border-secondary">
        <CardContent className="p-6 space-y-6">
          {/* Montant principal */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t("amount")}</p>
            <p className="text-5xl font-bold text-foreground mt-1">
              {formattedAmount}
              <span className="text-xl text-muted-foreground ml-2">FCFA</span>
            </p>
          </div>

          {/* Méthode de paiement */}
          <div
            className={`flex items-center justify-center gap-3 p-4 rounded-xl ${
              method === "cash" ? "bg-success/10" : "bg-primary/10"
            }`}
          >
            {method === "cash" ? (
              <Banknote className="w-8 h-8 text-success" />
            ) : (
              <Smartphone className="w-8 h-8 text-primary" />
            )}
            <span className="text-xl font-bold">
              {method === "cash" ? t("cash") : t("mobile_money")}
            </span>
          </div>

          {/* Déductions */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t("cmu_contribution")} (1%)
              </span>
              <span className="font-bold text-destructive">
                -{formatCurrency(cmuDeduction)} FCFA
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {t("rsti_savings")} (0.5%)
              </span>
              <span className="font-bold text-secondary">
                +{formatCurrency(rstiDeduction)} FCFA
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action - Design KPATA */}
      <div className="space-y-3">
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className={`w-full h-16 rounded-2xl text-xl font-bold shadow-lg kpata-interactive ${
            method === "cash"
              ? "btn-kpata-success"
              : "btn-kpata-primary"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
              <span>{t("processing")}</span>
            </div>
          ) : (
            `✓ ${t("confirm").toUpperCase()}`
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleEdit}
          disabled={isLoading}
          className="btn-kpata-secondary w-full h-14"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t("edit")}
        </Button>
      </div>
    </div>
  );
}
