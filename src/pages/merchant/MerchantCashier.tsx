import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BottomNav } from "@/components/shared/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home, Wallet, Heart, User, Banknote, Smartphone, CreditCard } from "lucide-react";

const navItems = [
  { icon: Home, label: "Accueil", href: "/marchand" },
  { icon: Wallet, label: "Encaisser", href: "/marchand/encaisser" },
  { icon: Heart, label: "CMU", href: "/marchand/cmu" },
  { icon: User, label: "Profil", href: "/marchand/profil" },
];

type PaymentMethod = "cash" | "mobile_money" | "transfer";
type Step = "amount" | "method" | "confirm" | "success";

interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    value: "cash",
    label: "Espèces",
    icon: <Banknote className="w-6 h-6" />,
    description: "Paiement en liquide",
  },
  {
    value: "mobile_money",
    label: "Mobile Money",
    icon: <Smartphone className="w-6 h-6" />,
    description: "Orange, MTN, Wave, Moov",
  },
  {
    value: "transfer",
    label: "Virement",
    icon: <CreditCard className="w-6 h-6" />,
    description: "Transfert bancaire",
  },
];

export default function MerchantCashier() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");

  const numericAmount = parseFloat(amount.replace(/\s/g, "")) || 0;
  const cmuDeduction = Math.round(numericAmount * 0.01); // 1% CMU
  const rstiDeduction = Math.round(numericAmount * 0.005); // 0.5% RSTI

  const formatAmount = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatAmount(e.target.value));
  };

  const handleConfirm = async () => {
    if (!user) {
      toast.error("Non connecté");
      return;
    }

    setIsLoading(true);

    try {
      // Get merchant ID
      const { data: merchantData } = await supabase
        .from("merchants")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!merchantData) {
        toast.error("Profil marchand non trouvé");
        setIsLoading(false);
        return;
      }

      // Create transaction
      const ref = `TXN-${Date.now().toString(36).toUpperCase()}`;
      
      const { error } = await supabase.from("transactions").insert({
        merchant_id: merchantData.id,
        amount: numericAmount,
        transaction_type: method,
        cmu_deduction: cmuDeduction,
        rsti_deduction: rstiDeduction,
        reference: ref,
      });

      if (error) {
        console.error("Transaction error:", error);
        toast.error("Erreur lors de l'enregistrement");
        setIsLoading(false);
        return;
      }

      // Update merchant RSTI balance
      await supabase
        .from("merchants")
        .update({ 
          rsti_balance: supabase.rpc ? undefined : rstiDeduction 
        })
        .eq("id", merchantData.id);

      setTransactionRef(ref);
      setStep("success");
      toast.success("Transaction enregistrée !");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setMethod("cash");
    setStep("amount");
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
            onClick={() => step === "amount" ? navigate("/marchand") : setStep("amount")}
            className="text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Encaisser</h1>
            <p className="text-sm text-secondary-foreground/80">
              {step === "amount" && "Saisir le montant"}
              {step === "method" && "Mode de paiement"}
              {step === "confirm" && "Confirmation"}
              {step === "success" && "Succès"}
            </p>
          </div>
        </div>
      </header>

      <main className="p-4">
        {step === "amount" && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Label className="text-lg text-muted-foreground">Montant à encaisser</Label>
              <div className="mt-4 relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="text-center text-5xl font-bold h-24 border-0 border-b-4 border-secondary rounded-none bg-transparent focus-visible:ring-0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
                  FCFA
                </span>
              </div>
            </div>

            {numericAmount > 0 && (
              <Card className="bg-muted/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cotisation CMU (1%)</span>
                    <span className="font-medium text-red-500">-{cmuDeduction.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Épargne RSTI (0.5%)</span>
                    <span className="font-medium text-secondary">+{rstiDeduction.toLocaleString()} FCFA</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => setStep("method")}
              disabled={numericAmount < 100}
              className="w-full btn-xxl bg-secondary hover:bg-secondary/90"
            >
              Continuer
            </Button>
          </div>
        )}

        {step === "method" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-foreground">
                {numericAmount.toLocaleString()} FCFA
              </p>
            </div>

            <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <Label
                    key={pm.value}
                    htmlFor={pm.value}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      method === pm.value
                        ? "border-secondary bg-secondary/5"
                        : "border-border hover:border-secondary/50"
                    }`}
                  >
                    <RadioGroupItem value={pm.value} id={pm.value} className="sr-only" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      method === pm.value ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {pm.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{pm.label}</p>
                      <p className="text-sm text-muted-foreground">{pm.description}</p>
                    </div>
                    {method === pm.value && (
                      <Check className="w-5 h-5 text-secondary" />
                    )}
                  </Label>
                ))}
              </div>
            </RadioGroup>

            <Button
              onClick={() => setStep("confirm")}
              className="w-full btn-xxl bg-secondary hover:bg-secondary/90"
            >
              Confirmer
            </Button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-6">
            <Card className="border-2 border-secondary">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="text-4xl font-bold text-foreground">
                    {numericAmount.toLocaleString()} <span className="text-lg">FCFA</span>
                  </p>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode de paiement</span>
                    <span className="font-medium">
                      {paymentMethods.find(p => p.value === method)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cotisation CMU</span>
                    <span className="text-red-500">-{cmuDeduction.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Épargne RSTI</span>
                    <span className="text-secondary">+{rstiDeduction.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full btn-xxl bg-secondary hover:bg-secondary/90"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Valider la transaction
                </>
              )}
            </Button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-6 py-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
              <Check className="w-12 h-12 text-secondary" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">Transaction réussie !</h2>
              <p className="text-muted-foreground mt-2">
                {numericAmount.toLocaleString()} FCFA encaissés
              </p>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Référence</p>
                <p className="font-mono font-bold text-foreground">{transactionRef}</p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetForm}
                className="flex-1 h-14 rounded-xl"
              >
                Nouvelle vente
              </Button>
              <Button
                onClick={() => navigate("/marchand")}
                className="flex-1 h-14 rounded-xl bg-secondary hover:bg-secondary/90"
              >
                Accueil
              </Button>
            </div>
          </div>
        )}
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}
