import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, ArrowLeft, Check, X, Loader2 } from "lucide-react";
import { ImmersiveBackground } from "@/components/shared/ImmersiveBackground";
import { GlassCard } from "@/components/shared/GlassCard";
import { PnavimPillButton } from "@/components/pnavim";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSensoryFeedback } from "@/hooks/useSensoryFeedback";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { LANGUAGES } from "@/lib/translations";
import { cn } from "@/lib/utils";

type MicState = "idle" | "listening" | "processing" | "success" | "error";

const MerchantVoiceEntry: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { triggerTap, triggerSuccess, triggerError } = useSensoryFeedback();
  const prefersReducedMotion = useReducedMotion();

  const [micState, setMicState] = useState<MicState>("idle");
  const [spokenText, setSpokenText] = useState("");
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false);

  // Auto-play welcome audio
  useEffect(() => {
    if (!hasPlayedWelcome && "speechSynthesis" in window) {
      const timer = setTimeout(() => {
        const message =
          language === "fr"
            ? "Appuie sur le micro et dis ton numéro de téléphone"
            : "I ye téléphone numero fɔ";
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = "fr-FR";
        utterance.rate = 0.85;
        speechSynthesis.speak(utterance);
        setHasPlayedWelcome(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasPlayedWelcome, language]);

  const handleMicClick = useCallback(() => {
    if (micState === "listening") {
      // Stop listening
      setMicState("processing");
      triggerTap();
      // Simulate processing
      setTimeout(() => {
        setMicState("success");
        triggerSuccess();
        setSpokenText("+225 07 12 34 56 78");
        // Navigate after success
        setTimeout(() => {
          navigate("/marchand");
        }, 1500);
      }, 1500);
    } else if (micState === "idle") {
      // Start listening
      setMicState("listening");
      triggerTap();
    }
  }, [micState, navigate, triggerTap, triggerSuccess]);

  const handleCancel = () => {
    setMicState("idle");
    setSpokenText("");
    triggerTap();
  };

  const handleBack = () => {
    triggerTap();
    navigate("/");
  };

  const handleYes = () => {
    triggerSuccess();
    navigate("/marchand");
  };

  const handleNo = () => {
    triggerError();
    setMicState("idle");
    setSpokenText("");
  };

  const getMicButtonContent = () => {
    switch (micState) {
      case "listening":
        return (
          <>
            <Mic className="w-16 h-16 text-white" />
            <span className="sr-only">Écoute en cours</span>
          </>
        );
      case "processing":
        return <Loader2 className="w-16 h-16 text-white animate-spin" />;
      case "success":
        return <Check className="w-16 h-16 text-white" />;
      case "error":
        return <X className="w-16 h-16 text-white" />;
      default:
        return <Mic className="w-16 h-16 text-white" />;
    }
  };

  const getMicButtonStyle = () => {
    switch (micState) {
      case "listening":
        return "bg-gradient-to-br from-vert-manioc to-green-dark shadow-glow-green";
      case "processing":
        return "bg-muted";
      case "success":
        return "bg-gradient-to-br from-vert-manioc to-green-dark";
      case "error":
        return "bg-gradient-to-br from-destructive to-red-700";
      default:
        return "bg-gradient-to-br from-orange-sanguine to-terre-battue";
    }
  };

  // Langue selector compact
  const displayLanguages = LANGUAGES.slice(0, 3);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ImmersiveBackground variant="warm-gradient" showWaxPattern showBlobs />

      {/* Header simple */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-lg border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Bouton retour */}
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-charbon" />
          </button>

          {/* Titre */}
          <span className="text-sm font-nunito font-bold text-orange-sanguine">
            PNAVIM
          </span>

          {/* Langue */}
          <div className="flex gap-1">
            {displayLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  triggerTap();
                  setLanguage(lang.code);
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-base transition-all",
                  language === lang.code
                    ? "bg-orange-sanguine/20 scale-110"
                    : "bg-white/50"
                )}
              >
                {lang.symbol}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative z-10 container max-w-lg mx-auto px-6 pt-28 pb-32 flex flex-col items-center">
        {/* Instruction */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-nunito font-extrabold text-charbon leading-tight">
            {micState === "idle" && "Appuie et parle"}
            {micState === "listening" && "Je t'écoute..."}
            {micState === "processing" && "Je réfléchis..."}
            {micState === "success" && "C'est bon !"}
            {micState === "error" && "Réessaie"}
          </h1>
          <p className="text-charbon/60 mt-2">
            {micState === "idle" && "Dis ton numéro de téléphone"}
            {micState === "listening" && "Parle clairement"}
          </p>
        </motion.div>

        {/* Bouton Micro XXL */}
        <motion.button
          onClick={handleMicClick}
          disabled={micState === "processing"}
          className={cn(
            "w-40 h-40 rounded-full flex items-center justify-center",
            "border-4 border-white shadow-2xl",
            getMicButtonStyle(),
            !prefersReducedMotion && micState === "idle" && "animate-pulse-slow",
            micState === "processing" && "cursor-wait"
          )}
          whileHover={!prefersReducedMotion ? { scale: 1.05 } : {}}
          whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
          aria-label={micState === "listening" ? "Arrêter" : "Parler"}
        >
          {/* Ring animé */}
          {micState === "listening" && !prefersReducedMotion && (
            <motion.span
              className="absolute inset-0 rounded-full border-4 border-vert-manioc"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          {getMicButtonContent()}
        </motion.button>

        {/* Barres audio animation */}
        <AnimatePresence>
          {micState === "listening" && (
            <motion.div
              className="flex items-end gap-1 h-8 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-vert-manioc rounded-full"
                  animate={{
                    height: [8, 24, 12, 28, 8],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Texte détecté */}
        <AnimatePresence>
          {spokenText && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <GlassCard borderColor="green" padding="lg" className="text-center">
                <p className="text-2xl font-nunito font-bold text-charbon">
                  {spokenText}
                </p>
                <p className="text-sm text-charbon/60 mt-1">C'est bien toi ?</p>
              </GlassCard>

              {/* Boutons OUI / NON */}
              <div className="flex gap-4 mt-6">
                <PnavimPillButton
                  variant="success"
                  size="lg"
                  fullWidth
                  leftIcon={<Check className="w-6 h-6" />}
                  onClick={handleYes}
                >
                  OUI
                </PnavimPillButton>
                <PnavimPillButton
                  variant="danger"
                  size="lg"
                  fullWidth
                  leftIcon={<X className="w-6 h-6" />}
                  onClick={handleNo}
                >
                  NON
                </PnavimPillButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bouton audio aide */}
        <motion.button
          onClick={() => {
            triggerTap();
            if ("speechSynthesis" in window) {
              const message = "Appuie sur le gros bouton et dis ton numéro";
              const utterance = new SpeechSynthesisUtterance(message);
              utterance.lang = "fr-FR";
              speechSynthesis.speak(utterance);
            }
          }}
          className="mt-12 flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 text-charbon/70 border border-white/40"
        >
          <Volume2 className="w-5 h-5" />
          <span className="text-sm font-medium">Aide vocale</span>
        </motion.button>
      </main>
    </div>
  );
};

export default MerchantVoiceEntry;
