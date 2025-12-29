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
    <div className="flex flex-col min-h-[calc(100vh-180px)] justify-between gap-3">
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

      {/* Payment buttons XXL - Design KPATA */}
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleSelectMethod("cash")}
            disabled={numericAmount < 100}
            className="btn-kpata-success h-24 sm:h-28 flex-col gap-2 disabled:opacity-30"
          >
            <Banknote className="w-10 h-10 sm:w-12 sm:h-12" />
            <span className="text-xl sm:text-2xl font-black">
              {t("cash").toUpperCase()}
            </span>
          </Button>

          <Button
            onClick={() => handleSelectMethod("mobile_money")}
            disabled={numericAmount < 100}
            className="btn-kpata-primary h-24 sm:h-28 flex-col gap-2 disabled:opacity-30"
          >
            <Smartphone className="w-10 h-10 sm:w-12 sm:h-12" />
            <span className="text-xl sm:text-2xl font-black">MOBILE</span>
          </Button>
        </div>

        {/* Retry indicator or offline message */}
        {isRetrying ? (
          <p className="text-center text-sm text-warning flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Nouvelle tentative en cours...
          </p>
        ) : (
          <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2 opacity-70">
            <Wifi className="w-4 h-4" />
            {t("offline_message")}
          </p>
        )}
      </div>
    </div>
  );
}
