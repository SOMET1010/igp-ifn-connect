import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Banknote, Smartphone, Home, Wallet, User, Package, RotateCcw, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/shared/BottomNav";
import { CalculatorKeypad, useSuccessFeedback } from "@/components/merchant/CalculatorKeypad";
import { DailyRevenue } from "@/components/merchant/DailyRevenue";
import { QRReceipt } from "@/components/merchant/QRReceipt";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { icon: Home, label: "Accueil", href: "/marchand" },
  { icon: Package, label: "Stock", href: "/marchand/stock" },
  { icon: Wallet, label: "Encaisser", href: "/marchand/encaisser" },
  { icon: User, label: "Profil", href: "/marchand/profil" },
];

type PaymentMethod = "cash" | "mobile_money";
type Step = "input" | "confirm" | "success";

export default function MerchantCashier() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const triggerSuccessFeedback = useSuccessFeedback();
  
  const [step, setStep] = useState<Step>("input");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [merchantName, setMerchantName] = useState("");

  const numericAmount = parseInt(amount.replace(/\D/g, "")) || 0;
  const cmuDeduction = Math.round(numericAmount * 0.01);
  const rstiDeduction = Math.round(numericAmount * 0.005);

  // Format amount with spaces for display
  const formattedAmount = numericAmount.toLocaleString("fr-FR");

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

  const handleMethodSelect = (selectedMethod: PaymentMethod) => {
    if (numericAmount < 100) {
      toast.error("Montant minimum: 100 FCFA");
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
        toast.error("Profil marchand non trouvé");
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
        toast.error("Erreur lors de l'enregistrement");
        setIsLoading(false);
        return;
      }

      // Update RSTI balance
      const currentBalance = Number(merchantData.rsti_balance || 0);
      await supabase
        .from("merchants")
        .update({ rsti_balance: currentBalance + rstiDeduction })
        .eq("id", merchantData.id);

      // Create CMU payment entry
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
      setRefreshTrigger(prev => prev + 1);
      
      // Multi-sensory success feedback
      triggerSuccessFeedback();
      toast.success("Transaction réussie !");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
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
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => step === "input" ? navigate("/marchand") : resetForm()}
            className="text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Ma Caisse</h1>
            <p className="text-sm text-secondary-foreground/80">
              {step === "input" && "Encaisser une vente"}
              {step === "confirm" && "Confirmer le paiement"}
              {step === "success" && "Transaction réussie"}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {step === "input" && (
          <>
            {/* Daily Revenue Card */}
            <DailyRevenue refreshTrigger={refreshTrigger} />

            {/* Amount Display */}
            <Card className="border-2 border-border">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Montant à encaisser</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className={`text-5xl sm:text-6xl font-bold transition-all duration-200 ${
                      numericAmount > 0 ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {numericAmount > 0 ? formattedAmount : "0"}
                    </span>
                    <span className="text-xl text-muted-foreground">FCFA</span>
                  </div>
                  
                  {numericAmount > 0 && (
                    <div className="mt-4 flex justify-center gap-4 text-sm animate-fade-in">
                      <span className="text-destructive">CMU: -{cmuDeduction.toLocaleString()}</span>
                      <span className="text-secondary">RSTI: +{rstiDeduction.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calculator Keypad */}
            <CalculatorKeypad
              value={amount}
              onChange={setAmount}
              maxLength={10}
            />

            {/* Payment Method Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button
                onClick={() => handleMethodSelect("cash")}
                disabled={numericAmount < 100}
                className="h-20 sm:h-24 flex-col gap-2 bg-success hover:bg-success/90 text-success-foreground rounded-2xl text-lg font-bold shadow-lg transition-all duration-200 active:scale-95"
              >
                <Banknote className="w-8 h-8 sm:w-10 sm:h-10" />
                <span>ESPÈCES</span>
              </Button>
              
              <Button
                onClick={() => handleMethodSelect("mobile_money")}
                disabled={numericAmount < 100}
                className="h-20 sm:h-24 flex-col gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-bold shadow-lg transition-all duration-200 active:scale-95"
              >
                <Smartphone className="w-8 h-8 sm:w-10 sm:h-10" />
                <span>MOBILE MONEY</span>
              </Button>
            </div>
          </>
        )}

        {step === "confirm" && method && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-2 border-secondary">
              <CardContent className="p-6 space-y-6">
                {/* Amount */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="text-5xl font-bold text-foreground mt-1">
                    {formattedAmount}
                    <span className="text-xl text-muted-foreground ml-2">FCFA</span>
                  </p>
                </div>

                {/* Payment Method */}
                <div className={`flex items-center justify-center gap-3 p-4 rounded-xl ${
                  method === "cash" ? "bg-success/10" : "bg-primary/10"
                }`}>
                  {method === "cash" ? (
                    <Banknote className="w-8 h-8 text-success" />
                  ) : (
                    <Smartphone className="w-8 h-8 text-primary" />
                  )}
                  <span className="text-xl font-bold">
                    {method === "cash" ? "Espèces" : "Mobile Money"}
                  </span>
                </div>

                {/* Deductions */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Cotisation CMU (1%)</span>
                    <span className="font-bold text-destructive">-{cmuDeduction.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Épargne RSTI (0.5%)</span>
                    <span className="font-bold text-secondary">+{rstiDeduction.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
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
                    <span>Traitement...</span>
                  </div>
                ) : (
                  "✓ VALIDER"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
                className="w-full h-14 rounded-xl text-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Modifier
              </Button>
            </div>
          </div>
        )}

        {step === "success" && method && (
          <div className="space-y-6 animate-scale-in">
            {/* QR Receipt */}
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

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={resetForm}
                className="h-14 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nouvelle vente
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/marchand/historique")}
                className="h-14 rounded-xl font-bold"
              >
                <List className="w-5 h-5 mr-2" />
                Historique
              </Button>
            </div>

            <Button
              onClick={() => navigate("/marchand")}
              variant="ghost"
              className="w-full h-12 rounded-xl"
            >
              <Home className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        )}
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}
