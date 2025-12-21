import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OTPInput from "@/components/auth/OTPInput";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Step = "phone" | "otp" | "register";

export default function MerchantLogin() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const email = `${phone.replace(/\s/g, "")}@marchand.igp.ci`;

  const handlePhoneSubmit = async () => {
    if (phone.length < 8) {
      toast.error("Numéro de téléphone invalide");
      return;
    }

    setIsLoading(true);

    // Check if merchant exists
    const { data: existingMerchant } = await supabase
      .from("merchants")
      .select("id, full_name")
      .eq("phone", phone.replace(/\s/g, ""))
      .single();

    if (existingMerchant) {
      setFullName(existingMerchant.full_name);
      setIsNewUser(false);
    } else {
      setIsNewUser(true);
    }

    // Simulate OTP send
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    toast.success(`Code de vérification : ${generatedOtp}`, { duration: 10000 });
    
    setIsLoading(false);
    setStep("otp");
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Code invalide");
      return;
    }

    setIsLoading(true);

    if (isNewUser) {
      setIsLoading(false);
      setStep("register");
      return;
    }

    // Existing user - sign in
    const { error } = await signIn(email, "marchand123");
    
    if (error) {
      // Try signing up if user doesn't exist in auth
      const { error: signUpError } = await signUp(email, "marchand123", fullName);
      if (signUpError) {
        toast.error("Erreur de connexion");
        setIsLoading(false);
        return;
      }
    }

    toast.success("Connexion réussie !");
    setIsLoading(false);
    navigate("/marchand");
  };

  const handleRegisterSubmit = async () => {
    if (fullName.length < 3) {
      toast.error("Nom trop court");
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, "marchand123", fullName);
    
    if (error) {
      toast.error("Erreur lors de l'inscription");
      setIsLoading(false);
      return;
    }

    toast.success("Compte créé avec succès !");
    setIsLoading(false);
    navigate("/marchand");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-forest text-primary-foreground py-8 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-5xl mb-4">💵</div>
          <h1 className="text-2xl font-bold">Espace Marchand</h1>
          <p className="text-sm opacity-90 mt-2">
            Encaisser, vendre et être protégé
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-6 py-8">
        {step === "phone" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Connexion</h2>
              <p className="text-muted-foreground mt-1">
                Entrez votre numéro de téléphone
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-semibold">
                  📱 Téléphone
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center h-14 px-4 bg-muted rounded-xl text-lg font-medium">
                    +225
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="07 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2 flex-1"
                  />
                </div>
              </div>

              <Button
                onClick={handlePhoneSubmit}
                disabled={isLoading || phone.length < 8}
                className="w-full btn-xxl bg-secondary hover:bg-secondary/90"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Vérification</h2>
              <p className="text-muted-foreground mt-1">
                Entrez le code reçu par SMS
              </p>
              <p className="text-sm text-primary mt-2 font-medium">
                +225 {phone}
              </p>
            </div>

            <OTPInput value={otp} onChange={setOtp} />

            <Button
              onClick={handleOtpSubmit}
              disabled={isLoading || otp.length !== 6}
              className="w-full btn-xxl bg-secondary hover:bg-secondary/90"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Valider"
              )}
            </Button>

            <button
              onClick={() => setStep("phone")}
              className="w-full text-center text-muted-foreground text-sm"
            >
              ← Modifier le numéro
            </button>
          </div>
        )}

        {step === "register" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Bienvenue !</h2>
              <p className="text-muted-foreground mt-1">
                Créez votre compte marchand
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-semibold">
                  👤 Votre nom complet
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ex: Kouamé Adjoua"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 text-lg rounded-xl border-2"
                />
              </div>

              <Button
                onClick={handleRegisterSubmit}
                disabled={isLoading || fullName.length < 3}
                className="w-full btn-xxl bg-secondary hover:bg-secondary/90"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Créer mon compte
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 px-6 text-center">
        <p className="text-xs text-muted-foreground">
          🇨🇮 Plateforme IGP & IFN
        </p>
      </footer>
    </div>
  );
}
