import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Fingerprint, HelpCircle, ArrowLeft, Shield, Heart } from "lucide-react";
import { ImmersiveBackground } from "@/components/shared/ImmersiveBackground";
import { PnavimCard, PnavimPillButton } from "@/components/pnavim";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Écran de sécurité renforcée PNAVIM
 * Affiché quand le trust score est trop bas
 * Design rassurant, pas alarmiste
 */
const MerchantSecurityFallback: React.FC = () => {
  const navigate = useNavigate();
  const { triggerTap } = useSensoryFeedback();
  const { t } = useLanguage();

  const handleCallAgent = () => {
    triggerTap();
    // Ouvrir l'app téléphone ou afficher le numéro
    window.location.href = "tel:+22500000000";
  };

  const handleBack = () => {
    triggerTap();
    navigate("/");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ImmersiveBackground variant="warm-gradient" showWaxPattern showBlobs={false} />

      {/* Header simple */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-lg border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-charbon" />
          </button>
          <span className="text-sm font-nunito font-bold text-orange-sanguine">
            PNAVIM
          </span>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative z-10 container max-w-lg mx-auto px-6 pt-28 pb-32">
        {/* Message rassurant */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Icône rassurante */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
            <Heart className="w-12 h-12 text-accent" />
          </div>
          
          <h1 className="text-2xl font-nunito font-extrabold text-charbon leading-tight">
            On va t'aider
          </h1>
          <p className="text-charbon/60 mt-3 text-lg">
            Ne t'inquiète pas, tout va bien se passer
          </p>
        </motion.div>

        {/* Carte Agent terrain */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PnavimCard accent="green" padding="lg" className="mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar Agent */}
              <div className="w-16 h-16 rounded-full bg-vert-manioc/20 flex items-center justify-center shrink-0">
                <span className="text-3xl">👨🏾‍💼</span>
              </div>
              <div>
                <h2 className="font-nunito font-bold text-lg text-charbon">
                  Agent terrain
                </h2>
                <p className="text-sm text-charbon/60">
                  Un agent peut t'aider à vérifier ton compte
                </p>
              </div>
            </div>
          </PnavimCard>
        </motion.div>

        {/* Bouton Appeler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <PnavimPillButton
            variant="primary"
            size="xl"
            fullWidth
            leftIcon={<Phone className="w-6 h-6" />}
            onClick={handleCallAgent}
          >
            Appeler un agent
          </PnavimPillButton>

          {/* Option biométrie (si disponible) */}
          <PnavimPillButton
            variant="secondary"
            size="lg"
            fullWidth
            leftIcon={<Fingerprint className="w-5 h-5" />}
            onClick={() => {
              triggerTap();
              // Trigger biometric auth if available
            }}
          >
            Utiliser mon empreinte
          </PnavimPillButton>
        </motion.div>

        {/* Explications */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <PnavimCard accent="none" padding="md" className="bg-white/60">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-vert-manioc shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-charbon">
                  Pourquoi cette étape ?
                </h3>
                <p className="text-xs text-charbon/60 mt-1">
                  Pour protéger ton argent, on vérifie que c'est bien toi.
                  Un agent terrain peut t'aider gratuitement.
                </p>
              </div>
            </div>
          </PnavimCard>
        </motion.div>

        {/* Bouton aide vocale */}
        <motion.div
          className="flex justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => {
              if ("speechSynthesis" in window) {
                const message =
                  "Ne t'inquiète pas. Appuie sur le bouton vert pour appeler un agent qui va t'aider.";
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.lang = "fr-FR";
                utterance.rate = 0.85;
                speechSynthesis.speak(utterance);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 text-charbon/70 border border-white/40"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Besoin d'aide ?</span>
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default MerchantSecurityFallback;
