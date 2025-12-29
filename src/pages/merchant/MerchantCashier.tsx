import { useState, useEffect, useCallback } from "react";
import { EnhancedHeader } from "@/components/shared/EnhancedHeader";
import { UnifiedBottomNav } from "@/components/shared/UnifiedBottomNav";
import { AudioButton } from "@/components/shared/AudioButton";
import { merchantNavItems } from "@/config/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSuccessFeedback } from "@/components/merchant/CalculatorKeypad";
import { getCashierScript } from "@/features/voice-auth/config/cashierScripts";
import {
  useMerchantStock,
  useCashierPayment,
  useScannedProducts,
  CashierInputStep,
  CashierConfirmStep,
  CashierSuccessStep,
  parseManualAmount,
  formatCurrency,
  type SelectedProduct,
} from "@/features/merchant";

export default function MerchantCashier() {
  const { t, language } = useLanguage();
  const triggerSuccessFeedback = useSuccessFeedback();
  
  // State local pour l'entrée manuelle et les produits
  const [amount, setAmount] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);
  
  // Récupérer les produits scannés depuis le Scanner
  const { scannedProducts, hasScannedProducts, clearScannedProducts } = useScannedProducts();
  
  // Pré-charger les produits scannés au montage
  useEffect(() => {
    if (hasScannedProducts && selectedProducts.length === 0) {
      setSelectedProducts(scannedProducts);
      // Nettoyer sessionStorage après chargement
      clearScannedProducts();
    }
  }, [hasScannedProducts, scannedProducts, clearScannedProducts, selectedProducts.length]);
  
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

  // Auto-play welcome audio on first load (SUTA inclusif)
  const playWelcomeAudio = useCallback(() => {
    if (!hasPlayedWelcome && step === "input" && 'speechSynthesis' in window) {
      const text = getCashierScript("cashier_welcome", language);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
      setHasPlayedWelcome(true);
    }
  }, [hasPlayedWelcome, step, language]);

  // Play welcome on mount
  useEffect(() => {
    const timer = setTimeout(playWelcomeAudio, 500);
    return () => clearTimeout(timer);
  }, [playWelcomeAudio]);

  // Reset complet du formulaire
  const handleReset = () => {
    resetForm();
    setAmount("");
    setSelectedProducts([]);
    setHasPlayedWelcome(false);
  };

  // Texte audio contextuel
  const getStepAudioText = () => {
    if (step === "input") {
      return numericAmount > 0 
        ? `${formatCurrency(numericAmount)} francs CFA` 
        : getCashierScript("cashier_welcome", language);
    }
    if (step === "confirm") {
      const methodText = method === "cash" 
        ? getCashierScript("cashier_cash", language)
        : getCashierScript("cashier_mobile", language);
      return `${formatCurrency(numericAmount)} francs CFA. ${methodText}`;
    }
    return `${t("audio_cashier_success")}: ${formatCurrency(numericAmount)} francs CFA`;
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

      <EnhancedHeader
        title={t("collect_title")}
        showBack
        backTo={step === "input" ? "/marchand" : undefined}
        onSignOut={step !== "input" ? handleReset : undefined}
        showNotifications={false}
        showLanguageToggle={false}
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
