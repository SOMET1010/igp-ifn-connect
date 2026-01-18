/**
 * Page Sécurité Renforcée - Fallback Trust Score bas
 * Refactorisée avec Design System Jùlaba
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ImmersiveBackground } from "@/shared/ui";
import { 
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
  JulabaTantie,
} from "@/shared/ui/julaba";
import { useSensoryFeedback } from "@/shared/hooks";

const MerchantSecurityFallback: React.FC = () => {
  const navigate = useNavigate();
  const { triggerTap } = useSensoryFeedback();

  const handleCallAgent = () => {
    triggerTap();
    window.location.href = "tel:+22500000000";
  };

  const handleBack = () => {
    triggerTap();
    navigate("/");
  };

  const handleVoiceHelp = () => {
    if ("speechSynthesis" in window) {
      const message =
        "Ne t'inquiète pas. Appuie sur le bouton vert pour appeler un agent qui va t'aider.";
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "fr-FR";
      utterance.rate = 0.85;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <JulabaPageLayout background="warm" padding="none" withBottomNav={false}>
      <ImmersiveBackground variant="warm-gradient" showWaxPattern showBlobs={false} />

      {/* Header simple */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-lg border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <JulabaButton
            variant="ghost"
            size="md"
            emoji="←"
            onClick={handleBack}
          />
          <span className="text-lg font-bold text-primary">
            🧡 PNAVIM
          </span>
          <div className="w-10" />
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
          <div className="text-7xl mb-4">❤️</div>
          
          <h1 className="text-2xl font-extrabold text-foreground leading-tight">
            On va t'aider
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Ne t'inquiète pas, tout va bien se passer
          </p>
        </motion.div>

        {/* Tantie rassurante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <JulabaTantie
            message="Je suis là pour t'aider. Un agent terrain peut vérifier ton compte gratuitement."
            variant="medium"
            showAudio={false}
          />
        </motion.div>

        {/* Carte Agent terrain */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <JulabaCard accent="green" className="mb-6">
            <div className="flex items-center gap-4">
              <div className="text-5xl">👨🏾‍💼</div>
              <div>
                <h2 className="font-bold text-lg text-foreground">
                  Agent terrain
                </h2>
                <p className="text-sm text-muted-foreground">
                  Il peut t'aider à vérifier ton compte
                </p>
              </div>
            </div>
          </JulabaCard>
        </motion.div>

        {/* Boutons d'action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <JulabaButton
            variant="hero"
            emoji="📞"
            onClick={handleCallAgent}
            className="w-full"
          >
            Appeler un agent
          </JulabaButton>

          <JulabaButton
            variant="secondary"
            emoji="👆"
            onClick={() => triggerTap()}
            className="w-full"
          >
            Utiliser mon empreinte
          </JulabaButton>
        </motion.div>

        {/* Explications */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <JulabaCard>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <h3 className="font-bold text-foreground">
                  Pourquoi cette étape ?
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Pour protéger ton argent, on vérifie que c'est bien toi.
                  Un agent terrain peut t'aider gratuitement.
                </p>
              </div>
            </div>
          </JulabaCard>
        </motion.div>

        {/* Bouton aide vocale */}
        <motion.div
          className="flex justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <JulabaButton
            variant="ghost"
            emoji="❓"
            onClick={handleVoiceHelp}
          >
            Besoin d'aide ?
          </JulabaButton>
        </motion.div>
      </main>
    </JulabaPageLayout>
  );
};

export default MerchantSecurityFallback;
