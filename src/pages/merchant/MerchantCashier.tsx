import { useState } from "react";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { AudioButton } from "@/components/shared/AudioButton";
import { merchantNavItems } from "@/config/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSuccessFeedback } from "@/components/merchant/CalculatorKeypad";
import { useMerchantStock } from "@/hooks/useMerchantStock";
import {
  useCashierPayment,
  CashierInputStep,
  CashierConfirmStep,
  CashierSuccessStep,
  parseManualAmount,
  formatCurrency,
  type SelectedProduct,
} from "@/features/merchant";

export default function MerchantCashier() {
  const { t } = useLanguage();
  const triggerSuccessFeedback = useSuccessFeedback();
  
  // State local pour l'entrée manuelle et les produits
  const [amount, setAmount] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  
  // Stock data
  const { stocks, isLoading: stocksLoading } = useMerchantStock();
  
  // Hook métier de paiement
  const {
    step,
    method,
    isLoading,
    transactionRef,
    merchantName,
    showReceipt,
    isRetrying,
    numericAmount,
    cmuDeduction,
    rstiDeduction,
    selectPaymentMethod,
    confirmPayment,
    resetForm,
    setShowReceipt,
  } = useCashierPayment(parseManualAmount(amount), selectedProducts);

  // Reset complet du formulaire
  const handleReset = () => {
    resetForm();
    setAmount("");
    setSelectedProducts([]);
  };

  // Texte audio contextuel
  const getStepAudioText = () => {
    if (step === "input") {
      return numericAmount > 0 ? `${formatCurrency(numericAmount)} FCFA` : t("how_much");
    }
    if (step === "confirm") {
      return `${t("audio_cashier_confirm")} ${formatCurrency(numericAmount)} FCFA ${method === "cash" ? t("cash") : t("mobile_money")}`;
    }
    return `${t("audio_cashier_success")}: ${formatCurrency(numericAmount)} FCFA`;
  };

  // Mapping stocks pour le sélecteur de produits
  const stocksForSelector = stocks.map((s) => ({
    id: s.id,
    product_id: s.product_id,
    product_name: s.product?.name || "",
    quantity: Number(s.quantity),
    unit_price: s.unit_price,
    image_url: null,
    unit: s.product?.unit,
  }));

  // Étape succès - rendu séparé
  if (step === "success" && method) {
    return (
      <CashierSuccessStep
        transactionRef={transactionRef}
        amount={numericAmount}
        method={method}
        cmuDeduction={cmuDeduction}
        rstiDeduction={rstiDeduction}
        merchantName={merchantName}
        showReceipt={showReceipt}
        onShowReceipt={() => setShowReceipt(true)}
        onNewSale={handleReset}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Floating Audio Button */}
      <AudioButton
        textToRead={getStepAudioText()}
        className="fixed bottom-24 right-4 z-50"
        size="lg"
      />

      <UnifiedHeader
        title={t("collect_title")}
        showBack
        backTo={step === "input" ? "/marchand" : undefined}
        onSignOut={step !== "input" ? handleReset : undefined}
      />

      <main className="p-4 space-y-4">
        {step === "input" && (
          <CashierInputStep
            stocks={stocksForSelector}
            stocksLoading={stocksLoading}
            selectedProducts={selectedProducts}
            onProductsChange={setSelectedProducts}
            amount={amount}
            onAmountChange={setAmount}
            numericAmount={numericAmount}
            onSelectMethod={(m) => selectPaymentMethod(m, t)}
            isRetrying={isRetrying}
          />
        )}

        {step === "confirm" && method && (
          <CashierConfirmStep
            amount={numericAmount}
            method={method}
            cmuDeduction={cmuDeduction}
            rstiDeduction={rstiDeduction}
            isLoading={isLoading}
            onConfirm={() => confirmPayment(t, triggerSuccessFeedback)}
            onEdit={resetForm}
          />
        )}
      </main>

      <UnifiedBottomNav items={merchantNavItems} />
    </div>
  );
}
