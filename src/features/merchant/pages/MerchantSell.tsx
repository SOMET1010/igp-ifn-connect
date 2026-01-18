/**
 * Page unifiée de vente - /marchand/vendre
 * Refactorisée avec Design System Jùlaba
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AudioButton, ImmersiveBackground } from "@/shared/ui";
import { 
  JulabaPageLayout, 
  JulabaHeader, 
  JulabaTabBar, 
  JulabaBottomNav 
} from "@/shared/ui/julaba";
import { MERCHANT_NAV_ITEMS } from "@/config/navigation-julaba";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSuccessFeedback } from "@/features/merchant/components/CalculatorKeypad";
import { getCashierScript } from "@/shared/config/audio/cashierScripts";
import { useMarketBackground } from "@/features/merchant/hooks/useMarketBackground";
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

// Import composants scanner
import { ScannerTab } from "./components/ScannerTab";

// Import vente rapide
import { QuickSaleScreen } from "@/features/sales";

// Onglets Jùlaba avec emojis
const SELL_TABS = [
  { id: "montant", label: "Montant", emoji: "💵" },
  { id: "scanner", label: "Scanner", emoji: "📷" },
  { id: "rapide", label: "Vocal", emoji: "🎤" },
];

export default function MerchantSell() {
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const triggerSuccessFeedback = useSuccessFeedback();
  
  // Tab depuis URL ou défaut
  const initialMode = searchParams.get("mode") || "montant";
  const [activeTab, setActiveTab] = useState(initialMode);
  
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
      clearScannedProducts();
    }
  }, [hasScannedProducts, scannedProducts, clearScannedProducts, selectedProducts.length]);
  
  // Stock data
  const { stocks, isLoading: stocksLoading } = useMerchantStock();
  
  // Fond de marché
  const { imageUrl: marketBgUrl } = useMarketBackground();
  
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

  // Quand un scanner produit des items, switcher sur montant
  const handleScannerCheckout = (products: SelectedProduct[]) => {
    setSelectedProducts(products);
    setActiveTab("montant");
  };

  // Auto-play welcome audio on first load
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

  useEffect(() => {
    if (activeTab === "montant") {
      const timer = setTimeout(playWelcomeAudio, 500);
      return () => clearTimeout(timer);
    }
  }, [playWelcomeAudio, activeTab]);

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
    <JulabaPageLayout background="warm" className="pb-20">
      {/* Fond immersif */}
      <ImmersiveBackground 
        variant="market-blur" 
        backgroundImageUrl={marketBgUrl}
        showWaxPattern 
        showBlobs 
      />

      {/* Floating Audio Button */}
      {activeTab === "montant" && (
        <AudioButton
          textToRead={getStepAudioText()}
          className="fixed bottom-24 right-4 z-50"
          size="lg"
        />
      )}

      <JulabaHeader
        title="💰 Vendre"
        backPath={step === "input" ? "/marchand" : undefined}
        rightAction={step !== "input" ? {
          emoji: "🔄",
          label: "Annuler",
          onClick: handleReset,
        } : undefined}
      />

      <main className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Onglets Jùlaba avec emojis */}
        <JulabaTabBar
          tabs={SELL_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* TAB: Montant (Cashier classique) */}
        {activeTab === "montant" && (
          <div className="space-y-4">
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
          </div>
        )}

        {/* TAB: Scanner */}
        {activeTab === "scanner" && (
          <ScannerTab onCheckout={handleScannerCheckout} />
        )}

        {/* TAB: Vente Rapide Vocale */}
        {activeTab === "rapide" && (
          <div className="rounded-xl overflow-hidden border bg-background">
            <QuickSaleScreen onClose={() => setActiveTab("montant")} />
          </div>
        )}
      </main>

      <JulabaBottomNav items={MERCHANT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
}
