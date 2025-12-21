import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Smartphone, Home, Wallet, User, Package, RotateCcw, List, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/shared/BottomNav";
import { AudioButton } from "@/components/shared/AudioButton";
import { CalculatorKeypad, useSuccessFeedback } from "@/components/merchant/CalculatorKeypad";
import { QRReceipt } from "@/components/merchant/QRReceipt";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PaymentMethod = "cash" | "mobile_money";
type Step = "input" | "confirm" | "success";

export default function MerchantCashier() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const triggerSuccessFeedback = useSuccessFeedback();
  
  const [step, setStep] = useState<Step>("input");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [merchantName, setMerchantName] = useState("");

  const numericAmount = parseInt(amount.replace(/\D/g, "")) || 0;
  const cmuDeduction = Math.round(numericAmount * 0.01);
  const rstiDeduction = Math.round(numericAmount * 0.005);
  const formattedAmount = numericAmount.toLocaleString("fr-FR");

  const navItems = [
    { icon: Home, label: t("home"), href: "/marchand" },
    { icon: Package, label: t("stock"), href: "/marchand/stock" },
    { icon: Wallet, label: t("collect"), href: "/marchand/encaisser" },
    { icon: User, label: t("profile"), href: "/marchand/profil" },
  ];

  useEffect(() => {
    const fetchMerchantName = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("merchants")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      if (data) setMerchantName(data.full_name);
    };
    fetchMerchantName();
  }, [user]);

  // Build context-aware audio text
  const getStepAudioText = () => {
    if (step === "input") {
      return numericAmount > 0 
        ? `${formattedAmount} FCFA`
        : t("how_much");
    }
    if (step === "confirm") {
      return `${t("audio_cashier_confirm")} ${formattedAmount} FCFA ${method === "cash" ? t("cash") : t("mobile_money")}`;
    }
    return `${t("audio_cashier_success")}: ${formattedAmount} FCFA`;
  };

  const handleMethodSelect = (selectedMethod: PaymentMethod) => {
    if (numericAmount < 100) {
      toast.error(t("min_amount_error"));
      return;
    }
    setMethod(selectedMethod);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!user || !method) return;

    setIsLoading(true);

    try {
      const { data: merchantData } = await supabase
        .from("merchants")
        .select("id, rsti_balance")
        .eq("user_id", user.id)
        .single();

      if (!merchantData) {
        toast.error(t("min_amount_error"));
        setIsLoading(false);
        return;
      }

      const ref = `TXN-${Date.now().toString(36).toUpperCase()}`;
      
      const { data: txData, error } = await supabase.from("transactions").insert({
        merchant_id: merchantData.id,
        amount: numericAmount,
        transaction_type: method,
        cmu_deduction: cmuDeduction,
        rsti_deduction: rstiDeduction,
        reference: ref,
      }).select("id").single();

      if (error) {
        console.error("Transaction error:", error);
        toast.error(t("min_amount_error"));
        setIsLoading(false);
        return;
      }

      const currentBalance = Number(merchantData.rsti_balance || 0);
      await supabase
        .from("merchants")
        .update({ rsti_balance: currentBalance + rstiDeduction })
        .eq("id", merchantData.id);

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      await supabase.from("cmu_payments").insert({
        merchant_id: merchantData.id,
        amount: cmuDeduction,
        period_start: periodStart.toISOString().split("T")[0],
        period_end: periodEnd.toISOString().split("T")[0],
        transaction_id: txData.id,
      });

      setTransactionRef(ref);
      setStep("success");
      
      triggerSuccessFeedback();
      toast.success(t("payment_success") + " !");
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("min_amount_error"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setMethod(null);
    setStep("input");
    setTransactionRef("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Floating Audio Button */}
      <AudioButton 
        textToRead={getStepAudioText()}
        className="fixed bottom-24 right-4 z-50"
        size="lg"
      />

      {/* Simplified Header - Just title */}
      <header className="bg-secondary text-secondary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step === "input" ? navigate("/marchand") : resetForm()}
            className="text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold">{t("collect_title")}</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {step === "input" && (
          <div className="flex flex-col min-h-[calc(100vh-180px)] justify-between">
            {/* Amount display - GIANT */}
            <div className="text-center py-6">
              <p className="text-lg text-muted-foreground font-medium mb-3">{t("how_much")}</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className={`text-6xl sm:text-7xl font-black tracking-tight transition-all duration-200 ${
                  numericAmount > 0 ? "text-foreground" : "text-muted-foreground/50"
                }`}>
                  {numericAmount > 0 ? formattedAmount : "0"}
                </span>
                <span className="text-2xl text-muted-foreground font-bold">FCFA</span>
              </div>
            </div>

            {/* Calculator Keypad XXL */}
            <CalculatorKeypad
              value={amount}
              onChange={setAmount}
              maxLength={10}
            />

            {/* Payment buttons XXL */}
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleMethodSelect("cash")}
                  disabled={numericAmount < 100}
                  className="h-24 sm:h-28 flex-col gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/30 text-white rounded-2xl shadow-lg transition-all duration-200 active:scale-95"
                >
                  <Banknote className="w-10 h-10 sm:w-12 sm:h-12" />
                  <span className="text-xl sm:text-2xl font-black">{t("cash").toUpperCase()}</span>
                </Button>
                
                <Button
                  onClick={() => handleMethodSelect("mobile_money")}
                  disabled={numericAmount < 100}
                  className="h-24 sm:h-28 flex-col gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/30 text-white rounded-2xl shadow-lg transition-all duration-200 active:scale-95"
                >
                  <Smartphone className="w-10 h-10 sm:w-12 sm:h-12" />
                  <span className="text-xl sm:text-2xl font-black">MOBILE</span>
                </Button>
              </div>

              {/* Offline reassurance message */}
              <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2 opacity-70">
                <Wifi className="w-4 h-4" />
                {t("offline_message")}
              </p>
            </div>
          </div>
        )}

        {step === "confirm" && method && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-2 border-secondary">
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t("amount")}</p>
                  <p className="text-5xl font-bold text-foreground mt-1">
                    {formattedAmount}
                    <span className="text-xl text-muted-foreground ml-2">FCFA</span>
                  </p>
                </div>

                <div className={`flex items-center justify-center gap-3 p-4 rounded-xl ${
                  method === "cash" ? "bg-success/10" : "bg-primary/10"
                }`}>
                  {method === "cash" ? (
                    <Banknote className="w-8 h-8 text-success" />
                  ) : (
                    <Smartphone className="w-8 h-8 text-primary" />
                  )}
                  <span className="text-xl font-bold">
                    {method === "cash" ? t("cash") : t("mobile_money")}
                  </span>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("cmu_contribution")} (1%)</span>
                    <span className="font-bold text-destructive">-{cmuDeduction.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("rsti_savings")} (0.5%)</span>
                    <span className="font-bold text-secondary">+{rstiDeduction.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`w-full h-16 rounded-2xl text-xl font-bold shadow-lg transition-all duration-200 ${
                  method === "cash" 
                    ? "bg-success hover:bg-success/90 text-success-foreground" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
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
                onClick={resetForm}
                disabled={isLoading}
                className="w-full h-14 rounded-xl text-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("edit")}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && method && (
          <div className="space-y-6 animate-scale-in">
            <QRReceipt
              transaction={{
                reference: transactionRef,
                amount: numericAmount,
                paymentMethod: method,
                cmuDeduction,
                rstiDeduction,
                date: new Date(),
                merchantName,
              }}
            />

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={resetForm}
                className="h-14 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {t("new_sale")}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/marchand/historique")}
                className="h-14 rounded-xl font-bold"
              >
                <List className="w-5 h-5 mr-2" />
                {t("history")}
              </Button>
            </div>

            <Button
              onClick={() => navigate("/marchand")}
              variant="ghost"
              className="w-full h-12 rounded-xl"
            >
              <Home className="w-5 h-5 mr-2" />
              {t("return_home")}
            </Button>
          </div>
        )}
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}
