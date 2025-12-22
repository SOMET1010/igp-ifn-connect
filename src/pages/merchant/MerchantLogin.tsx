import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, ArrowLeft, Shield, UserPlus, Lock, Smartphone, Headphones } from "lucide-react";
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
import { ContextualBanner } from '@/components/shared/ContextualBanner';
import { SecondaryFeatures } from '@/components/shared/SecondaryFeatures';
import { LoginCard } from '@/components/shared/LoginCard';

type Step = "phone" | "otp" | "register";

// Messages contextuels selon l'étape
const STEP_BANNERS: Record<Step, { icon: string; message: string }> = {
  phone: { icon: '🛒', message: 'Accès réservé aux marchands enregistrés' },
  otp: { icon: '🔒', message: 'Ne partagez jamais votre code de vérification' },
  register: { icon: '✨', message: 'Créez votre compte marchand en 30 secondes' },
};

// Configuration du stepper
const STEPS_CONFIG: Record<Step, { number: number; title: string; subtitle: string }> = {
  phone: { number: 1, title: 'Connexion Marchand', subtitle: 'Étape 1 · Numéro de téléphone' },
  otp: { number: 2, title: 'Vérification OTP', subtitle: 'Étape 2 · Code de sécurité' },
  register: { number: 3, title: 'Créer votre compte', subtitle: 'Étape 3 · Informations marchand' },
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

  const email = `${phone.replace(/\s/g, "")}@marchand.igp.ci`;
  const currentConfig = STEPS_CONFIG[step];
  const currentBanner = STEP_BANNERS[step];

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

    const { error: signInError } = await signIn(email, "marchand123");
    
    if (signInError) {
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
    const validationError = getValidationError(fullNameSchema, fullName);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password: "marchand123",
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: fullName }
      }
    });
    
    if (signUpError || !data.user) {
      toast.error("Erreur lors de l'inscription");
      setIsLoading(false);
      return;
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
      console.error("Merchant creation error:", merchantError);
      toast.error("Erreur lors de la création du profil marchand");
      setIsLoading(false);
      return;
    }

    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "merchant"
    });

    if (roleError) {
      console.error("Role assignment error:", roleError);
    }

    toast.success("Compte marchand créé avec succès !");
    setIsLoading(false);
    navigate("/marchand");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header institutionnel */}
      <InstitutionalHeader
        subtitle="Espace Marchand"
        showBackButton={step !== 'phone'}
        onBack={() => setStep(step === 'register' ? 'otp' : 'phone')}
        showOfficialBadge={true}
      />

      {/* Bandeau contextuel */}
      <ContextualBanner
        icon={currentBanner.icon}
        message={currentBanner.message}
        variant="compact"
        maxWidth="md"
        fontWeight="medium"
      />

      <main className="flex-1 max-w-md mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <LoginCard
          variant="compact"
          icon={step === 'phone' ? Smartphone : step === 'otp' ? Lock : UserPlus}
          currentStep={currentConfig.number}
          title={currentConfig.title}
          subtitle={currentConfig.subtitle}
          showSecurityNote={false}
        >
          {step === "phone" && (
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
              
              {/* Note de sécurité */}
              <p className="text-xs text-muted-foreground text-center">
                🔒 Connexion chiffrée · Vos données sont protégées
              </p>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-primary font-medium">
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
                className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Modifier le numéro
              </button>
              
              {/* Note de sécurité */}
              <p className="text-xs text-muted-foreground text-center">
                🔒 Ne partagez jamais ce code avec quiconque
              </p>
            </div>
          )}

          {step === "register" && (
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
              
              <button
                onClick={() => setStep("otp")}
                className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
              
              {/* Note de sécurité */}
              <p className="text-xs text-muted-foreground text-center">
                🔒 Vos informations sont sécurisées
              </p>
            </div>
          )}
        </LoginCard>

        {/* Zone features secondaire */}
        <div className="mt-6">
          <SecondaryFeatures
            variant="compact"
            features={[
              { icon: Shield, title: 'Sécurisé', description: 'Paiements protégés', colorClass: 'bg-primary/10 text-primary' },
              { icon: Smartphone, title: 'Officiel', description: 'Plateforme DGE', colorClass: 'bg-primary/10 text-primary' },
              { icon: Headphones, title: 'Support', description: 'Assistance 24/7', colorClass: 'bg-primary/10 text-primary' },
            ]}
            showInstitutionalNote={true}
            maxWidth="md"
          />
        </div>
      </main>

      {/* Footer institutionnel */}
      <InstitutionalFooter variant="compact" showSupportButton={true} maxWidth="md" />
    </div>
  );
}
