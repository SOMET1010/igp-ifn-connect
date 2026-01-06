import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import OTPInput from "@/features/auth/components/OTPInput";
import { Loader2, RefreshCw } from "lucide-react";
import { PhoneInput } from "@/components/shared/PhoneInput";
import { phoneSchema, fullNameSchema, otpSchema, getValidationError } from "@/lib/validationSchemas";
import { InstitutionalHeader } from "@/components/shared/InstitutionalHeader";
import { InstitutionalFooter } from "@/components/shared/InstitutionalFooter";
import { LoginCard } from "@/components/shared/LoginCard";
import { supabase } from "@/integrations/supabase/client";
import { authLogger } from "@/infra/logger";
import { useRetryOperation } from "@/hooks/useRetryOperation";
import { AudioButton } from "@/components/shared/AudioButton";
import { BackgroundDecor } from "@/components/shared/BackgroundDecor";
import { LoginRoleConfig, LoginStep } from "../types/login.types";

interface GenericOtpLoginPageProps {
  config: LoginRoleConfig;
}

/**
 * Composant générique pour les pages de login basées sur OTP (phone + code)
 * Utilisé par: MerchantLogin, AgentLogin, CooperativeLogin
 */
export const GenericOtpLoginPage: React.FC<GenericOtpLoginPageProps> = ({ config }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, isAuthenticated, checkRole } = useAuth();

  const [step, setStep] = useState<LoginStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");

  const { execute: executeWithRetry, state: retryState } = useRetryOperation({
    maxRetries: 3,
    baseDelay: 1500,
    onRetry: (attempt) => {
      toast({
        title: "Nouvelle tentative",
        description: `Tentative ${attempt}/3 en cours...`,
      });
    },
    onExhausted: () => {
      toast({
        title: "Échec de connexion",
        description: "Vérifiez votre connexion internet.",
        variant: "destructive",
      });
    },
  });

  // Redirect if already authenticated with correct role
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        const hasRole = await checkRole(config.role);
        if (hasRole) {
          navigate(config.redirectTo);
        }
      }
    };
    checkAuth();
  }, [isAuthenticated, checkRole, navigate, config.role, config.redirectTo]);

  const generateMockOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    return code;
  };

  const handleSendOtp = async () => {
    const validationError = getValidationError(phoneSchema, phone);
    if (validationError) {
      toast({
        title: "Erreur",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const code = generateMockOtp();
    toast({
      title: "Code OTP envoyé",
      description: `Code de démonstration: ${code}`,
      duration: 10000,
    });

    setStep("otp");
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    const validationError = getValidationError(otpSchema, otp);
    if (validationError) {
      toast({
        title: "Erreur",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    if (otp !== generatedOtp) {
      toast({
        title: "Code incorrect",
        description: "Le code saisi ne correspond pas",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const email = config.emailPattern(phone);
    const password = config.passwordPattern(phone);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      if (signInError.message.includes("Invalid login credentials")) {
        setIsLoading(false);
        setStep("register");
        return;
      }

      toast({
        title: "Erreur de connexion",
        description: signInError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // User exists - link entity and assign role
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (config.updateEntityOnLogin) {
          await config.updateEntityOnLogin(user.id, phone);
        }

        const { error: roleError } = await supabase.rpc(config.roleRpcName, {
          p_user_id: user.id,
        });

        if (roleError) {
          authLogger.warn("Role assignment error:", { error: roleError.message });
        }
      }

      toast({
        title: "Connexion réussie",
        description: config.successMessage,
      });
      navigate(config.redirectTo);
    } catch (err) {
      authLogger.error("Post-login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    const validationError = getValidationError(fullNameSchema, fullName);
    if (validationError) {
      toast({
        title: "Erreur",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const email = config.emailPattern(phone);
    const password = config.passwordPattern(phone);

    const result = await executeWithRetry(async () => {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast({
            title: "Compte existant",
            description: "Ce numéro est déjà enregistré. Essayez de vous connecter.",
            variant: "destructive",
          });
          setStep("otp");
          return false;
        }
        throw signUpError;
      }

      if (!data.user) {
        throw new Error("Échec inscription");
      }

      const userId = data.user.id;
      const cleanPhone = phone.replace(/\s/g, "");

      // Create entity in the appropriate table
      // Use type assertion as the createEntityData returns the correct shape for the table
      const entityData = config.createEntityData(userId, cleanPhone, fullName);
      const { error: entityError } = await supabase
        .from(config.tableName)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(entityData as any);

      if (entityError) {
        authLogger.error(`${config.tableName} creation error:`, entityError);
        throw entityError;
      }

      // Assign role
      const { error: roleError } = await supabase.rpc(config.roleRpcName, {
        p_user_id: userId,
      });

      if (roleError) {
        authLogger.warn("Role assignment error:", { error: roleError.message });
      }

      return true;
    });

    setIsLoading(false);

    if (result) {
      toast({
        title: "Compte créé",
        description: config.successMessage,
      });
      navigate(config.redirectTo);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("phone");
      setOtp("");
    } else if (step === "register") {
      setStep("otp");
    }
  };

  const BackgroundIcon = config.backgroundIcon;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <BackgroundDecor
        icons={[{ Icon: BackgroundIcon, position: "bottom-right", size: "xl", rotate: -10 }]}
        opacity={5}
      />

      <InstitutionalHeader
        subtitle={config.headerSubtitle}
        showBackButton={step !== "phone"}
        onBack={handleBack}
      />

      <AudioButton
        textToRead={config.audioTexts[step]}
        className="fixed bottom-24 right-4 z-50"
        size="lg"
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <LoginCard
          title={config.stepsConfig[step].title}
          subtitle={config.stepsConfig[step].subtitle}
        >
          {step === "phone" && (
            <>
              <PhoneInput value={phone} onChange={setPhone} disabled={isLoading} />

              <Button
                onClick={handleSendOtp}
                disabled={phone.length !== 10 || isLoading}
                className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  retryState.isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Nouvelle tentative...
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Envoi...
                    </>
                  )
                ) : (
                  "Recevoir le code OTP"
                )}
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="space-y-3">
                <Label className="form-label-lg text-center block">
                  Code de vérification
                </Label>
                <div className="flex justify-center">
                  <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Code envoyé au +225 {phone}
                </p>
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || isLoading}
                className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier le code"
                )}
              </Button>

              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full text-center text-sm text-primary hover:underline"
              >
                Renvoyer le code
              </button>
            </>
          )}

          {step === "register" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="form-label-lg">
                  {config.registerFieldLabel}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={config.registerFieldPlaceholder}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-institutional"
                />
              </div>

              <div className="bg-muted rounded-md p-3 text-sm">
                <p className="text-xs text-muted-foreground">Téléphone vérifié</p>
                <p className="font-medium text-foreground">+225 {phone}</p>
              </div>

              <Button
                onClick={handleRegister}
                disabled={fullName.trim().length < 3 || isLoading}
                className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Création...
                  </>
                ) : (
                  config.registerButtonLabel
                )}
              </Button>
            </>
          )}
        </LoginCard>

        <p className="text-xs text-muted-foreground text-center mt-6 max-w-sm">
          Plateforme opérée par l'ANSUT pour le compte de la DGE
        </p>
      </main>

      <InstitutionalFooter />
    </div>
  );
};
