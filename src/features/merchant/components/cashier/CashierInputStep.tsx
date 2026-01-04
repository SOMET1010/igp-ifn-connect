import { Banknote, Smartphone, Wifi, RefreshCw, Mic, Ear, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { CashDenominationPad } from "@/components/merchant/CashDenominationPad";
import { CalculatorKeypad } from "@/components/merchant/CalculatorKeypad";
import { ProductSelector, type SelectedProduct as ProductSelectorProduct } from "@/components/merchant/ProductSelector";
import { GlassCard } from "@/components/shared/GlassCard";
import { VibrantTotalBar } from "@/components/shared/VibrantTotalBar";
import { WaxPattern } from "@/components/shared/WaxPattern";
import type { SelectedProduct, PaymentMethod, StockItemForSelector } from "../../types/transaction.types";
import { formatCurrency } from "../../utils/cashierCalculations";
import { getCashierScript } from "@/shared/config/audio/cashierScripts";

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
// TTS Helper - Synthèse vocale rapide
// ============================================
const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }
};

// ============================================
// Composant étape d'entrée AFRO-FUTURISTE
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
  const { t, language } = useLanguage();
  const { triggerMoney, triggerTap } = useSensoryFeedback();

  const formattedAmount = formatCurrency(numericAmount);
  const isAmountEmpty = numericAmount === 0;

  // Handle method selection with sensory + vocal feedback
  const handleSelectMethod = (method: PaymentMethod) => {
    triggerMoney();
    const scriptKey = method === "cash" ? "cashier_cash" : "cashier_mobile";
    speakText(getCashierScript(scriptKey, language));
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

  // Tap on speaking header to play welcome audio
  const handleSpeakingHeaderTap = () => {
    triggerTap();
    speakText(getCashierScript("cashier_welcome", language));
  };

  // Tap on amount zone to speak current amount or "listening"
  const handleAmountZoneTap = () => {
    triggerTap();
    if (numericAmount > 0) {
      speakText(`${formattedAmount} francs CFA`);
    } else {
      speakText(getCashierScript("cashier_listening", language));
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-180px)] gap-4">
      {/* Product Selector dans une GlassCard */}
      <GlassCard borderColor="orange" padding="sm">
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
      </GlassCard>

      {/* Speaking Header - INCLUSIF avec style glass */}
      <button 
        type="button"
        onClick={handleSpeakingHeaderTap}
        className="flex items-center justify-center gap-2 py-3 px-4 bg-white/70 backdrop-blur-sm rounded-xl border border-orange-sanguine/20 transition-all hover:bg-white/80"
        aria-label={t("how_much")}
      >
        <Mic className="w-5 h-5 text-orange-sanguine animate-pulse" />
        <span className="text-sm text-charbon font-medium font-inter">
          {selectedProducts.length > 0 
            ? t("total") || "Total" 
            : t("say_amount") || "Dis le montant ou appuie sur un billet"
          }
        </span>
      </button>

      {/* Amount Zone - VIBRANT TOTAL BAR */}
      {numericAmount > 0 ? (
        <VibrantTotalBar
          label="Total à encaisser"
          amount={formattedAmount}
          currency="FCFA"
          onClick={handleAmountZoneTap}
        />
      ) : (
        <button
          type="button"
          onClick={handleAmountZoneTap}
          className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-dashed border-orange-sanguine/30 px-6 py-6 text-center transition-all hover:border-orange-sanguine/50"
          aria-label={t("listening") || "J'écoute"}
        >
          {/* Wax pattern subtil */}
          <WaxPattern variant="geometric" opacity={0.04} className="absolute inset-0" />
          
          <div className="relative z-10">
            {/* Ear icon when listening */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Ear className="w-6 h-6 text-orange-sanguine animate-pulse" />
              <span className="text-sm text-muted-foreground font-inter">
                {t("listening") || "J'écoute..."}
              </span>
            </div>
            
            {/* Giant Amount Display */}
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl sm:text-6xl font-nunito font-extrabold text-charbon/30">
                0
              </span>
              <span className="text-xl text-muted-foreground font-bold">FCFA</span>
            </div>
          </div>
        </button>
      )}

      {/* Message si aucun produit sélectionné */}
      {selectedProducts.length === 0 && (
        <GlassCard borderColor="orange" padding="md" className="text-center">
          <ShoppingBag className="w-10 h-10 mx-auto text-orange-sanguine/50 mb-2" />
          <p className="text-charbon/70 font-inter text-sm">
            Sélectionnez des produits ci-dessus pour encaisser
          </p>
        </GlassCard>
      )}

      {/* Spacer pour le sticky */}
      <div className="flex-1" />

      {/* Sticky Payment Buttons - Design AFRO-FUTURISTE */}
      <div className="sticky bottom-0 -mx-4 px-4 py-4 space-y-4">
        {/* Fond glassmorphism pour le sticky */}
        <div className="absolute inset-0 bg-sable/95 backdrop-blur-xl border-t border-orange-sanguine/20" />
        
        <div className="relative z-10 space-y-4">
          {/* Résumé produits (si présents) */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center justify-between text-sm px-1">
              <span className="text-charbon/70 font-inter">
                {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''} sélectionné{selectedProducts.length > 1 ? 's' : ''}
              </span>
              <span className="font-bold text-charbon font-nunito">
                {formattedAmount} FCFA
              </span>
            </div>
          )}

          {/* Payment buttons MASSIFS - Style pilule */}
          <div className="grid grid-cols-2 gap-4">
            {/* Bouton ESPÈCES - Vert succès */}
            <Button
              onClick={() => handleSelectMethod("cash")}
              disabled={selectedProducts.length === 0 || numericAmount < 100}
              className="relative h-28 rounded-3xl flex-col gap-2 overflow-hidden
                bg-gradient-to-br from-vert-manioc to-green-700
                shadow-xl shadow-vert-manioc/30
                hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-40 disabled:hover:scale-100
                transition-all duration-300"
              aria-label={t("cash") || "Espèces"}
            >
              <Banknote className="w-12 h-12 text-white" />
              <span className="text-xl font-nunito font-extrabold text-white">
                {t("cash")?.toUpperCase() || "ESPÈCES"}
              </span>
            </Button>

            {/* Bouton MOBILE - Bleu/Violet */}
            <Button
              onClick={() => handleSelectMethod("mobile_money")}
              disabled={selectedProducts.length === 0 || numericAmount < 100}
              className="relative h-28 rounded-3xl flex-col gap-2 overflow-hidden
                bg-gradient-to-br from-blue-500 to-violet-600
                shadow-xl shadow-blue-500/30
                hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-40 disabled:hover:scale-100
                transition-all duration-300"
              aria-label="Mobile Money"
            >
              <Smartphone className="w-12 h-12 text-white" />
              <span className="text-xl font-nunito font-extrabold text-white">MOBILE</span>
            </Button>
          </div>

          {/* Retry indicator or offline message */}
          {isRetrying ? (
            <p className="text-center text-sm text-orange-sanguine flex items-center justify-center gap-2 font-inter">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Nouvelle tentative en cours...
            </p>
          ) : (
            <p className="text-center text-xs text-charbon/50 flex items-center justify-center gap-2 font-inter">
              <Wifi className="w-3 h-3" />
              {t("offline_message")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
