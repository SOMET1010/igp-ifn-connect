import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Mic, Volume2, Calculator, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTts } from '@/shared/hooks/useTts';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  audioText: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: "Bienvenue sur PNAVIM",
    description: "Cette application vous aide à gérer votre commerce facilement, même sans savoir lire ou écrire.",
    icon: <HelpCircle className="w-12 h-12 text-primary" />,
    audioText: "Bienvenue sur PNAVIM. Cette application vous aide à gérer votre commerce facilement."
  },
  {
    id: 2,
    title: "Parlez, on vous écoute",
    description: "Appuyez sur le bouton orange pour parler. Dites votre numéro de téléphone ou posez une question.",
    icon: <Mic className="w-12 h-12 text-primary" />,
    audioText: "Appuyez sur le bouton orange pour parler. Dites votre numéro de téléphone ou posez une question."
  },
  {
    id: 3,
    title: "Écoutez les instructions",
    description: "L'application vous parle ! Écoutez bien les instructions vocales pour chaque action.",
    icon: <Volume2 className="w-12 h-12 text-secondary" />,
    audioText: "L'application vous parle ! Écoutez bien les instructions vocales pour chaque action."
  },
  {
    id: 4,
    title: "Calculez facilement",
    description: "Utilisez le calculateur de monnaie pour compter vos billets et pièces.",
    icon: <Calculator className="w-12 h-12 text-accent" />,
    audioText: "Utilisez le calculateur de monnaie pour compter vos billets et pièces."
  },
  {
    id: 5,
    title: "Votre compte est sécurisé",
    description: "Personne d'autre ne peut accéder à votre compte. C'est protégé par votre voix.",
    icon: <Shield className="w-12 h-12 text-success" />,
    audioText: "Personne d'autre ne peut accéder à votre compte. C'est protégé par votre voix."
  }
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { speak, isSpeaking, stop } = useTts();

  const step = TUTORIAL_STEPS[currentStep];

  const handlePlayAudio = useCallback(() => {
    if (isSpeaking) {
      stop();
    } else {
      speak(step.audioText);
    }
  }, [step, speak, isSpeaking, stop]);

  const handleNext = useCallback(() => {
    stop();
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete?.();
      onClose();
    }
  }, [currentStep, onComplete, onClose, stop]);

  const handlePrev = useCallback(() => {
    stop();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, stop]);

  const handleSkip = useCallback(() => {
    stop();
    onClose();
  }, [onClose, stop]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-orange-sanguine p-4 flex items-center justify-between">
            <span className="text-white font-semibold">
              Étape {currentStep + 1}/{TUTORIAL_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress */}
          <div className="h-1.5 bg-muted">
            <motion.div
              className="h-full bg-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                  {step.icon}
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-foreground">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Audio Button */}
              <button
                onClick={handlePlayAudio}
                className={`mx-auto flex items-center gap-3 px-6 py-3 rounded-full transition-all ${
                  isSpeaking
                    ? 'bg-secondary text-secondary-foreground animate-pulse'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                <Volume2 className="w-6 h-6" />
                <span className="font-medium">
                  {isSpeaking ? 'En cours...' : 'Écouter'}
                </span>
              </button>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="p-4 bg-muted/30 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 btn-kpata-primary"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? 'Terminer' : 'Suivant'}
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
