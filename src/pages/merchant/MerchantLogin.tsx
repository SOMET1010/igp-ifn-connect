import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OTPInput from "@/components/auth/OTPInput";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { phoneSchema, fullNameSchema, otpSchema, getValidationError } from "@/lib/validationSchemas";
import { useRetryOperation } from "@/hooks/useRetryOperation";
import { authLogger } from "@/infra/logger";
import { AudioButton } from "@/components/shared/AudioButton";
import { VoiceModeCard } from "@/components/merchant/VoiceModeCard";
import { ClassicModeCard } from "@/components/merchant/ClassicModeCard";
import { VoiceAuthLang } from "@/features/voice-auth/config/audioScripts";
import { cn } from "@/lib/utils";
import marcheIvoirien from "@/assets/marche-ivoirien.jpg";
import logoDge from "@/assets/logo-dge.png";
import logoAnsut from "@/assets/logo-ansut.png";

type Step = "phone" | "otp" | "register";
type ViewMode = "voice" | "classic";

export default function MerchantLogin() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  
  const [step, setStep] = useState<Step>("phone");
  const [viewMode, setViewMode] = useState<ViewMode>("voice"); // VOCAL par défaut !
  const [voiceLang, setVoiceLang] = useState<VoiceAuthLang>("suta"); // SUTA par défaut !
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

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
      .maybeSingle();

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

  const handleVoicePhoneDetected = (detectedPhone: string) => {
    setPhone(detectedPhone);
    handlePhoneSubmit();
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const cleanPhone = phone.replace(/\s/g, "");
        
        await supabase
          .from("merchants")
          .update({ user_id: user.id })
          .eq("phone", cleanPhone)
          .is("user_id", null);
        
        const { error: roleError } = await supabase.rpc('assign_merchant_role', {
          p_user_id: user.id
        });
        
        if (roleError) {
          authLogger.warn("Role assignment error:", { error: roleError.message });
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

      const { error: roleError } = await supabase.rpc('assign_merchant_role', {
        p_user_id: userId
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

  const getAudioText = () => {
    switch (step) {
      case 'phone':
        if (voiceLang === 'nouchi') {
          return "Salut la famille ! Pour rentrer dans ton coin, appuie sur le bouton orange là.";
        }
        if (voiceLang === 'suta') {
          return "Bonjour ! Bienvenue sur l'espace des marchands. Pour te connecter, appuie sur le micro et parle tranquillement.";
        }
        return "Bienvenue espace marchand. Entrez votre numéro de téléphone.";
      case 'otp':
        if (voiceLang === 'nouchi') {
          return "Rentre le code à 6 chiffres qu'on t'a envoyé.";
        }
        if (voiceLang === 'suta') {
          return "Entre le code à 6 chiffres. Parle doucement si tu veux de l'aide.";
        }
        return "Entrez le code de vérification à 6 chiffres.";
      case 'register':
        if (voiceLang === 'nouchi') {
          return "Donne ton nom complet pour créer ton compte.";
        }
        if (voiceLang === 'suta') {
          return "Entre ton nom complet pour créer ton compte. Je suis là pour t'aider.";
        }
        return "Créez votre compte en entrant votre nom complet.";
      default:
        return "Connexion marchand";
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image avec overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${marcheIvoirien})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Header Institutionnel agrandi */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3">
          <img src={logoDge} alt="DGE" className="h-10 md:h-12 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-bold text-foreground">PNAVIM-CI</span>
            <span className="text-[10px] md:text-xs text-muted-foreground">République de Côte d'Ivoire</span>
            <span className="text-[9px] text-muted-foreground/70 italic">Espace des Marchands</span>
          </div>
        </div>
        <img src={logoAnsut} alt="ANSUT" className="h-9 md:h-11 object-contain" />
      </header>

      {/* Bouton audio flottant */}
      <AudioButton
        textToRead={getAudioText()}
        className="fixed bottom-24 right-4 z-50"
        size="lg"
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Carte principale flottante */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Bandeau orange */}
          <div className="bg-primary px-4 py-3">
            <h1 className="text-white font-bold text-center text-lg">
              Espace Marchand Copilote
            </h1>
          </div>

          {/* Contenu carte */}
          <div className="p-5">
            {/* Sélecteur de langue (discret) */}
            {step === 'phone' && (
              <div className="flex justify-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setVoiceLang('suta')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    voiceLang === 'suta' 
                      ? "bg-primary text-white" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  🎙️ SUTA
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('nouchi')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    voiceLang === 'nouchi' 
                      ? "bg-primary text-white" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  🔥 Nouchi
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('fr')}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    voiceLang === 'fr' 
                      ? "bg-primary text-white" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  🇫🇷 FR
                </button>
              </div>
            )}

            {/* Bouton retour pour OTP et Register */}
            {step !== 'phone' && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            )}

            {/* Étape Phone */}
            {step === "phone" && viewMode === "voice" && (
              <VoiceModeCard
                lang={voiceLang}
                onPhoneDetected={handleVoicePhoneDetected}
                onFallbackClick={() => setViewMode("classic")}
                disabled={isLoading}
              />
            )}

            {step === "phone" && viewMode === "classic" && (
              <ClassicModeCard
                lang={voiceLang}
                phone={phone}
                onPhoneChange={setPhone}
                onSubmit={handlePhoneSubmit}
                onVoiceModeClick={() => setViewMode("voice")}
                isLoading={isLoading}
                isRetrying={retryState.isRetrying}
              />
            )}

            {/* Étape OTP */}
            {step === "otp" && (
              <div className="space-y-5">
                <div className="space-y-3">
                  <p className="text-center text-sm text-muted-foreground">
                    {voiceLang === 'nouchi' 
                      ? `Code envoyé au +225 ${phone}` 
                      : `Code envoyé au +225 ${phone}`
                    }
                  </p>
                  <div className="flex justify-center">
                    <OTPInput value={otp} onChange={setOtp} />
                  </div>
                </div>

                <Button
                  onClick={handleOtpSubmit}
                  disabled={isLoading || otp.length !== 6}
                  className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-base font-semibold"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    voiceLang === 'nouchi' ? "Valider" : "Valider"
                  )}
                </Button>

                <button
                  onClick={() => setStep("phone")}
                  className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {voiceLang === 'nouchi' ? "Changer le numéro" : "Modifier le numéro"}
                </button>
              </div>
            )}

            {/* Étape Register */}
            {step === "register" && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="form-label-lg">
                    {voiceLang === 'nouchi' ? "Ton nom complet" : "Nom complet"}
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Ex: Kouamé Adjoua"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-institutional h-14 text-base"
                  />
                </div>

                <Button
                  onClick={handleRegisterSubmit}
                  disabled={isLoading || fullName.length < 3}
                  className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {voiceLang === 'nouchi' ? "Ça crée..." : "Création..."}
                    </>
                  ) : (
                    voiceLang === 'nouchi' ? "Créer mon compte" : "Créer mon compte"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Note institutionnelle */}
        <p className="text-xs text-white/80 text-center mt-6 max-w-sm drop-shadow-lg">
          Sécurisé par l'ANSUT · Service Public
        </p>
      </main>

      {/* Footer discret */}
      <footer className="relative z-10 py-3 text-center">
        <p className="text-[10px] text-white/60">
          Plateforme opérée par l'ANSUT pour le compte de la DGE
        </p>
      </footer>
    </div>
  );
}
