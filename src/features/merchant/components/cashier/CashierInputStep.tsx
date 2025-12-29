import { Banknote, Smartphone, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { CashDenominationPad } from "@/components/merchant/CashDenominationPad";
import { CalculatorKeypad } from "@/components/merchant/CalculatorKeypad";
import { ProductSelector, type SelectedProduct as ProductSelectorProduct } from "@/components/merchant/ProductSelector";
import type { SelectedProduct, PaymentMethod, StockItemForSelector } from "../../types/transaction.types";
import { formatCurrency } from "../../utils/cashierCalculations";

// ============================================
// Props du composant
// ============================================
interface CashierInputStepProps {
  stocks: StockItemForSelector[];
  stocksLoading: boolean;
  selectedProducts: SelectedProduct[];
  onProductsChange: (products: SelectedProduct[]) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  numericAmount: number;
  onSelectMethod: (method: PaymentMethod) => void;
  isRetrying: boolean;
}

// ============================================
// Composant étape d'entrée
// ============================================
export function CashierInputStep({
  stocks,
  stocksLoading,
  selectedProducts,
  onProductsChange,
  amount,
  onAmountChange,
  numericAmount,
  onSelectMethod,
  isRetrying,
}: CashierInputStepProps) {
  const { t } = useLanguage();
  const { triggerMoney } = useSensoryFeedback();

  const formattedAmount = formatCurrency(numericAmount);

  // Handle method selection with sensory feedback
  const handleSelectMethod = (method: PaymentMethod) => {
    triggerMoney();
    onSelectMethod(method);
  };

  // Handle adding amount from bill/coin denomination
  const handleAddAmount = (value: number) => {
    const currentAmount = parseInt(amount.replace(/\D/g, "")) || 0;
    const newAmount = currentAmount + value;
    onAmountChange(newAmount.toString());
  };

  // Map ProductSelector products to our type
  const handleProductsChange = (products: ProductSelectorProduct[]) => {
    onProductsChange(products as SelectedProduct[]);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-180px)] gap-3">
      {/* Product Selector - Optional */}
      <ProductSelector
        stocks={stocks.map((s) => ({
          id: s.id,
          product_id: s.product_id,
          product_name: s.product_name,
          quantity: Number(s.quantity),
          unit_price: s.unit_price,
          image_url: s.image_url ?? null,
          unit: s.unit,
        }))}
        selectedProducts={selectedProducts as ProductSelectorProduct[]}
        onProductsChange={handleProductsChange}
        isLoading={stocksLoading}
      />

      {/* Amount display - GIANT */}
      <div className="text-center py-4">
        <p className="text-lg text-muted-foreground font-medium mb-2">
          {selectedProducts.length > 0 ? t("total") || "Total" : t("how_much")}
        </p>
        <div className="flex items-baseline justify-center gap-2">
          <span
            className={`text-6xl sm:text-7xl font-black tracking-tight transition-all duration-200 ${
              numericAmount > 0 ? "text-foreground" : "text-muted-foreground/50"
            }`}
          >
            {numericAmount > 0 ? formattedAmount : "0"}
          </span>
          <span className="text-2xl text-muted-foreground font-bold">FCFA</span>
        </div>
      </div>

      {/* CFA Bills Quick Input - Only show if no products selected */}
      {selectedProducts.length === 0 && (
        <>
          <CashDenominationPad onAddAmount={handleAddAmount} />
          <CalculatorKeypad value={amount} onChange={onAmountChange} maxLength={10} />
        </>
      )}

      {/* Spacer pour le sticky */}
      <div className="flex-1" />

      {/* Sticky Cart Summary + Payment Buttons - Design KPATA */}
      <div className="sticky bottom-0 -mx-4 px-4 py-4 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg space-y-4">
        {/* Résumé produits (si présents) */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''} sélectionné{selectedProducts.length > 1 ? 's' : ''}
            </span>
            <span className="font-bold text-foreground">
              {formattedAmount} FCFA
            </span>
          </div>
        )}

        {/* Payment buttons XXL */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleSelectMethod("cash")}
            disabled={numericAmount < 100}
            className="btn-kpata-success h-20 sm:h-24 flex-col gap-2 disabled:opacity-30"
          >
            <Banknote className="w-8 h-8 sm:w-10 sm:h-10" />
            <span className="text-lg sm:text-xl font-black">
              {t("cash").toUpperCase()}
            </span>
          </Button>

          <Button
            onClick={() => handleSelectMethod("mobile_money")}
            disabled={numericAmount < 100}
            className="btn-kpata-primary h-20 sm:h-24 flex-col gap-2 disabled:opacity-30"
          >
            <Smartphone className="w-8 h-8 sm:w-10 sm:h-10" />
            <span className="text-lg sm:text-xl font-black">MOBILE</span>
          </Button>
        </div>

        {/* Retry indicator or offline message */}
        {isRetrying ? (
          <p className="text-center text-sm text-warning flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Nouvelle tentative en cours...
          </p>
        ) : (
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2 opacity-70">
            <Wifi className="w-3 h-3" />
            {t("offline_message")}
          </p>
        )}
      </div>
    </div>
  );
}
