import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { PhoneInput } from '@/components/shared/PhoneInput';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OTPInput from "@/components/auth/OTPInput";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { phoneSchema, fullNameSchema, otpSchema, getValidationError } from "@/lib/validationSchemas";
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { InstitutionalFooter } from '@/components/shared/InstitutionalFooter';
import { LoginCard } from '@/components/shared/LoginCard';
import { useRetryOperation } from "@/hooks/useRetryOperation";
import { authLogger } from "@/infra/logger";

type Step = "phone" | "otp" | "register";

const STEPS_CONFIG: Record<Step, { title: string; subtitle: string }> = {
  phone: { title: 'Connexion Marchand', subtitle: 'Étape 1 · Numéro de téléphone' },
  otp: { title: 'Vérification', subtitle: 'Étape 2 · Code de sécurité' },
  register: { title: 'Création de compte', subtitle: 'Étape 3 · Informations marchand' },
};

export default function MerchantLogin() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Hook de retry pour les opérations réseau
  const { execute: executeWithRetry, state: retryState } = useRetryOperation({
    maxRetries: 3,
    baseDelay: 1500,
    onRetry: (attempt) => {
      toast.info(`Nouvelle tentative de connexion (${attempt}/3)...`);
    },
    onExhausted: () => {
      toast.error("Échec après plusieurs tentatives. Vérifiez votre connexion.");
    },
  });

  const email = `${phone.replace(/\s/g, "")}@marchand.igp.ci`;

  const handlePhoneSubmit = async () => {
    const error = getValidationError(phoneSchema, phone);
    if (error) {
      toast.error(error);
      return;
    }

    setIsLoading(true);

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

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    toast.success(`Code de vérification : ${generatedOtp}`, { duration: 10000 });
    
    setIsLoading(false);
    setStep("otp");
  };

  const handleOtpSubmit = async () => {
    const validationError = getValidationError(otpSchema, otp);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    if (isNewUser) {
      setIsLoading(false);
      setStep("register");
      return;
    }

    const result = await executeWithRetry(async () => {
      const { error: signInError } = await signIn(email, "marchand123");
      
      if (signInError) {
        const { error: signUpError } = await signUp(email, "marchand123", fullName);
        if (signUpError) {
          throw signUpError;
        }
      }
      return true;
    });

    setIsLoading(false);

    if (result) {
      toast.success("Connexion réussie");
      navigate("/marchand");
    }
  };

  const handleRegisterSubmit = async () => {
    const validationError = getValidationError(fullNameSchema, fullName);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    const result = await executeWithRetry(async () => {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password: "marchand123",
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName }
        }
      });
      
      if (signUpError || !data.user) {
        throw signUpError || new Error("Échec inscription");
      }

      const userId = data.user.id;
      const cleanPhone = phone.replace(/\s/g, "");

      const { error: merchantError } = await supabase.from("merchants").insert({
        user_id: userId,
        full_name: fullName,
        phone: cleanPhone,
        cmu_number: `CMU-${Date.now()}`,
        activity_type: "Détaillant",
        status: "validated"
      });

      if (merchantError) {
        authLogger.error("Merchant creation error:", merchantError);
        throw merchantError;
      }

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "merchant"
      });

      if (roleError) {
        authLogger.warn("Role assignment error:", { error: roleError.message });
      }

      return true;
    });

    setIsLoading(false);

    if (result) {
      toast.success("Compte marchand créé avec succès");
      navigate("/marchand");
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
    } else if (step === 'register') {
      setStep('otp');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <InstitutionalHeader
        subtitle="Espace Marchand"
        showBackButton={step !== 'phone'}
        onBack={handleBack}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <LoginCard
          title={STEPS_CONFIG[step].title}
          subtitle={STEPS_CONFIG[step].subtitle}
        >
          {step === "phone" && (
            <>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                disabled={isLoading}
              />

              <Button
                onClick={handlePhoneSubmit}
                disabled={isLoading || phone.length < 8}
                className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  retryState.isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      Nouvelle tentative...
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Envoi...
                    </>
                  )
                ) : (
                  'Continuer'
                )}
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="space-y-3">
                <p className="text-center text-xs text-muted-foreground">
                  Code envoyé au +225 {phone}
                </p>
                <div className="flex justify-center">
                  <OTPInput value={otp} onChange={setOtp} />
                </div>
              </div>

              <Button
                onClick={handleOtpSubmit}
                disabled={isLoading || otp.length !== 6}
                className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Valider"
                )}
              </Button>

              <button
                onClick={() => setStep("phone")}
                className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Modifier le numéro
              </button>
            </>
          )}

          {step === "register" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="form-label-lg">
                  Nom complet
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ex: Kouamé Adjoua"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-institutional"
                />
              </div>

              <Button
                onClick={handleRegisterSubmit}
                disabled={isLoading || fullName.length < 3}
                className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Création...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
              
              <button
                onClick={() => setStep("otp")}
                className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            </>
          )}
        </LoginCard>

        {/* Note institutionnelle */}
        <p className="text-xs text-muted-foreground text-center mt-6 max-w-sm">
          Plateforme opérée par l'ANSUT pour le compte de la DGE
        </p>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
