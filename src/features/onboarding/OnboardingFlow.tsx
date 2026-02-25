import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioButton, TantieMascot } from "@/shared/ui";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  emoji: string;
  title: string;
  description: string;
  audioText: string;
  highlight?: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    emoji: "👋",
    title: "Bienvenue !",
    description: "Tu es maintenant inscrit(e) sur JÙLABA. On va t'expliquer comment ça marche.",
    audioText: "Bienvenue sur JÙLABA ! Tu es maintenant inscrit. On va t'expliquer comment tout fonctionne, c'est très simple !",
  },
  {
    id: "sell",
    emoji: "🛒",
    title: "Vendre, c'est facile",
    description: "Appuie sur le gros bouton VENDRE pour encaisser tes clients.",
    audioText: "Pour encaisser un client, appuie sur le gros bouton orange VENDRE. C'est la seule chose à faire !",
    highlight: "vendre",
  },
  {
    id: "protection",
    emoji: "🛡️",
    title: "Ta protection santé",
    description: "Une petite partie de tes ventes va pour ta santé. Tu es protégé(e) !",
    audioText: "Chaque vente te protège ! Une toute petite partie va pour ta santé et ta retraite. C'est automatique.",
  },
  {
    id: "help",
    emoji: "🆘",
    title: "Besoin d'aide ?",
    description: "Si tu as une question, appuie sur 'Moi' puis 'Aide'. On est là pour toi !",
    audioText: "Si tu as besoin d'aide, va dans Moi, puis Aide. Tu peux aussi appeler ton agent, il est là pour t'aider !",
    highlight: "aide",
  },
];

interface OnboardingFlowProps {
  merchantName?: string;
  onComplete: () => void;
}

export function OnboardingFlow({ merchantName = "Ami(e)", onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      // Mark onboarding as complete in localStorage
      localStorage.setItem("julaba_onboarding_complete", "true");
      onComplete();
      navigate("/marchand");
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("julaba_onboarding_complete", "true");
    onComplete();
    navigate("/marchand");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-2 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Skip button */}
      <div className="flex justify-end p-4">
        <Button variant="ghost" size="sm" onClick={handleSkip}>
          Passer
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm text-center space-y-8"
          >
            {/* Mascot with step emoji */}
            <div className="relative">
              <TantieMascot 
                message={currentStep === 0 ? `Bonjour ${merchantName} !` : step.title}
                variant="large"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-6xl">
                {step.emoji}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-4 pt-8">
              <h1 className="text-3xl font-bold text-foreground">
                {step.title}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Audio button */}
            <AudioButton
              textToRead={step.audioText}
              size="lg"
              className="mx-auto"
            />

            {/* Step indicators */}
            <div className="flex justify-center gap-2 py-4">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    index === currentStep
                      ? "bg-primary w-8"
                      : index < currentStep
                      ? "bg-primary/50"
                      : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="p-6 pb-safe">
        <Button
          size="lg"
          className="w-full h-16 text-xl font-bold gap-3"
          onClick={handleNext}
        >
          {isLastStep ? (
            <>
              <Check className="w-6 h-6" />
              C'est parti !
            </>
          ) : (
            <>
              Suivant
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default OnboardingFlow;
