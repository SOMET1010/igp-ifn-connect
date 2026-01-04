import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { ImmersiveBackground } from '@/components/shared/ImmersiveBackground';
import { PnavimRoleCard, PnavimPillButton } from '@/components/pnavim';
import { OnboardingTutorial } from '@/components/shared/OnboardingTutorial';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';
import { LANGUAGES } from '@/lib/translations';

const Home: React.FC = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { triggerTap } = useSensoryFeedback();

  // Show tutorial on first visit
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('pnavim-tutorial-seen');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('pnavim-tutorial-seen', 'true');
    setShowTutorial(false);
  };

  const playWelcomeAudio = () => {
    triggerTap();
    if ('speechSynthesis' in window) {
      const message = language === 'fr' 
        ? "Bienvenue sur PNAVIM. Appuyez sur une carte pour commencer."
        : language === 'dioula'
        ? "I ni sogoma. A ye carte dɔ sugandi."
        : "Bienvenue. Sélectionnez votre rôle.";
      
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  // Prendre les 3 premières langues pour le sélecteur
  const displayLanguages = LANGUAGES.slice(0, 3);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fond immersif */}
      <ImmersiveBackground variant="warm-gradient" showWaxPattern showBlobs />

      {/* Header minimal */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 backdrop-blur-lg border-b border-white/20 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Logo PNAVIM */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-nunito font-extrabold text-orange-sanguine">
              PNAVIM
            </span>
            <span className="text-xs text-charbon/50">Côte d'Ivoire</span>
          </div>

          {/* Sélecteur langue par icônes */}
          <div className="flex items-center gap-1 bg-white/60 rounded-full px-1.5 py-1">
            {displayLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  triggerTap();
                  setLanguage(lang.code);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-200 ${
                  language === lang.code
                    ? "bg-orange-sanguine/25 scale-110 shadow-sm"
                    : "hover:bg-white/80"
                }`}
                aria-label={lang.name}
                title={lang.name}
              >
                {lang.symbol}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative z-10 container max-w-lg mx-auto px-4 pt-24 pb-32">
        {/* Titre - Grande accroche */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-nunito font-extrabold text-charbon leading-tight">
            {t('who_are_you')}
          </h1>
          <p className="text-charbon/60 mt-2 text-lg">
            {t('choose_access')}
          </p>
        </motion.div>

        {/* Bouton Audio - "Cliquez pour écouter" */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <PnavimPillButton
            variant="secondary"
            size="lg"
            leftIcon={<Volume2 className="w-5 h-5" />}
            onClick={playWelcomeAudio}
          >
            {t('click_to_listen') || 'Cliquez pour écouter'}
          </PnavimPillButton>
        </motion.div>

        {/* Carte Marchand - HÉROS (plus grande) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <PnavimRoleCard
            persona="TANTIE"
            size="xl"
            link="/marchand/connexion"
            audioMessage="Je suis marchand. Appuyez pour accéder à votre espace."
          />
        </motion.div>

        {/* Cartes secondaires */}
        <div className="mt-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.3 }}
          >
            <PnavimRoleCard
              persona="AGENT"
              size="md"
              link="/agent/connexion"
              audioMessage="Agent terrain. Validez et accompagnez les marchands."
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55, duration: 0.3 }}
          >
            <PnavimRoleCard
              persona="COOP"
              size="md"
              link="/cooperative/connexion"
              audioMessage="Coopérative agricole. Vendez aux marchands."
            />
          </motion.div>
        </div>

        {/* Footer logos institutionnels */}
        <motion.footer
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-charbon/50 font-medium mb-3">
            Une initiative de
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-xs font-bold text-charbon/60 bg-white/70 px-3 py-1.5 rounded-lg shadow-sm">
              DGE
            </span>
            <span className="text-xs font-bold text-charbon/60 bg-white/70 px-3 py-1.5 rounded-lg shadow-sm">
              ANSUT
            </span>
            <span className="text-xs font-bold text-charbon/60 bg-white/70 px-3 py-1.5 rounded-lg shadow-sm">
              DGI
            </span>
          </div>
          <p className="mt-4 text-xs text-charbon/40">
            République de Côte d'Ivoire
          </p>
        </motion.footer>
      </main>

      {/* Onboarding Tutorial */}
      <OnboardingTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
    </div>
  );
};

export default Home;
