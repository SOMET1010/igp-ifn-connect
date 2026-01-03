import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VoiceInterviewWizard } from "@/features/voice-auth/components/VoiceInterviewWizard";
import { AudioButton } from "@/components/shared/AudioButton";
import { VoiceAuthLang } from "@/features/voice-auth/config/audioScripts";
import { cn } from "@/lib/utils";
import marcheIvoirien from "@/assets/marche-ivoirien.jpg";
import logoDge from "@/assets/logo-dge.png";
import logoAnsut from "@/assets/logo-ansut.png";

/**
 * Page d'inscription conversationnelle vocale
 * L'IA Tantie Sagesse pose les questions et la marchande répond vocalement
 */
export default function MerchantVoiceRegister() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [voiceLang, setVoiceLang] = useState<VoiceAuthLang>("suta");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInterviewComplete = async (data: Record<string, string>) => {
    setIsProcessing(true);
    
    try {
      const { full_name, activity_type, market_name, phone, mother_name, neighborhood } = data;
      
      if (!full_name || !phone) {
        toast.error("Informations incomplètes");
        setIsProcessing(false);
        return;
      }

      const cleanPhone = phone.replace(/\s/g, "");
      const email = `${cleanPhone}@marchand.igp.ci`;

      // Créer le compte utilisateur
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email,
        password: "marchand123",
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name }
        }
      });

      if (signUpError && !signUpError.message?.includes('already')) {
        throw signUpError;
      }

      // Si l'utilisateur existe déjà, se connecter
      let userId: string;
      if (signUpError?.message?.includes('already')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: "marchand123"
        });
        
        if (signInError) {
          throw new Error("Ce compte existe déjà avec un mot de passe différent");
        }
        userId = signInData.user!.id;
      } else {
        userId = signUpData!.user!.id;
      }

      // Vérifier si le marchand existe déjà
      const { data: existingMerchant } = await supabase
        .from("merchants")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      let merchantId: string;

      if (!existingMerchant) {
        // Trouver le marché correspondant
        let marketId = null;
        if (market_name) {
          const { data: markets } = await supabase
            .from("markets")
            .select("id, name")
            .ilike("name", `%${market_name.replace("Marché ", "")}%`)
            .limit(1);
          
          if (markets && markets.length > 0) {
            marketId = markets[0].id;
          }
        }

        // Créer le marchand
        const { data: newMerchant, error: merchantError } = await supabase.from("merchants").insert({
          user_id: userId,
          full_name,
          phone: cleanPhone,
          cmu_number: `CMU-${Date.now()}`,
          activity_type: activity_type || "Détaillant",
          activity_description: activity_type,
          market_id: marketId,
          status: "validated"
        }).select("id").single();

        if (merchantError) {
          throw merchantError;
        }
        
        merchantId = newMerchant.id;
      } else {
        merchantId = existingMerchant.id;
      }

      // Sauvegarder les questions de sécurité si fournies
      if (merchantId && (mother_name || neighborhood)) {
        const securityQuestions = [];
        
        if (mother_name) {
          securityQuestions.push({
            question_type: 'mother_name',
            answer: mother_name,
            question_text: "Prénom de ta maman",
            question_text_dioula: "I ba tɔgɔ"
          });
        }
        
        if (neighborhood) {
          securityQuestions.push({
            question_type: 'neighborhood',
            answer: neighborhood,
            question_text: "Ton surnom au quartier",
            question_text_dioula: "I tɔgɔ caman"
          });
        }
        
        if (securityQuestions.length > 0) {
          const { error: securityError } = await supabase.functions.invoke('save-security-questions', {
            body: {
              merchant_id: merchantId,
              questions: securityQuestions
            }
          });
          
          if (securityError) {
            console.error("Error saving security questions:", securityError);
            // Ne pas bloquer l'inscription si les questions échouent
          } else {
            console.log(`Saved ${securityQuestions.length} security questions for merchant ${merchantId}`);
          }
        }
      }

      // Assigner le rôle marchand
      await supabase.rpc('assign_merchant_role', { p_user_id: userId });

      toast.success("Bienvenue ! Ton compte est créé.");
      navigate("/marchand");
      
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'inscription");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    navigate("/marchand/login");
  };

  const getAudioText = () => {
    if (voiceLang === "suta") {
      return "Bienvenue dans l'inscription vocale. Tantie Sagesse va te poser quelques questions. Réponds tranquillement en parlant dans le micro.";
    }
    if (voiceLang === "nouchi") {
      return "Salut ! On va créer ton compte là. Réponds aux questions en parlant dans le micro.";
    }
    return "Bienvenue. Répondez aux questions vocalement pour créer votre compte.";
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${marcheIvoirien})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Header Institutionnel */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3">
          <img src={logoDge} alt="DGE" className="h-10 md:h-12 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-bold text-foreground">PNAVIM-CI</span>
            <span className="text-[10px] md:text-xs text-muted-foreground">Inscription Vocale</span>
          </div>
        </div>
        <img src={logoAnsut} alt="ANSUT" className="h-9 md:h-11 object-contain" />
      </header>

      {/* Audio Button */}
      <AudioButton
        textToRead={getAudioText()}
        className="fixed bottom-24 right-4 z-50"
        size="lg"
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Carte principale */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Bandeau avec icône Tantie */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">
                {voiceLang === "suta" ? "Inscription avec Tantie Sagesse" : "Inscription Vocale"}
              </h1>
              <p className="text-white/80 text-sm">
                {voiceLang === "suta" ? "Je t'écoute, ma fille !" : "Parle, on t'écoute !"}
              </p>
            </div>
          </div>

          {/* Sélecteur de langue */}
          <div className="flex justify-center gap-2 px-4 py-3 border-b border-border/30">
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

          {/* Wizard de l'interview */}
          <div className="p-4">
            {isProcessing ? (
              <div className="flex flex-col items-center py-8 space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-center text-muted-foreground">
                  Création de ton compte en cours...
                </p>
              </div>
            ) : (
              <VoiceInterviewWizard
                lang={voiceLang}
                onComplete={handleInterviewComplete}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>

        {/* Bouton retour */}
        <button
          onClick={handleCancel}
          className="mt-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion classique
        </button>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center">
        <p className="text-[10px] text-white/60">
          Plateforme opérée par l'ANSUT pour le compte de la DGE
        </p>
      </footer>
    </div>
  );
}
