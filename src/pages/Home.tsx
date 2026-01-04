import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { ImmersiveBackground } from '@/components/shared/ImmersiveBackground';
import { 
  PnavimRoleCard, 
  PnavimPillButton, 
  PnavimWaxCurve,
  PnavimInstitutionalHeader
} from '@/components/pnavim';
import { OnboardingTutorial } from '@/components/shared/OnboardingTutorial';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';

// Logos institutionnels
import logoDGE from '@/assets/logo-dge.png';
import logoANSUT from '@/assets/logo-ansut.png';
import marcheImage from '@/assets/marche-ivoirien.jpg';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const { language, t } = useLanguage();
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

  const handleLoginClick = () => {
    triggerTap();
    navigate('/marchand/connexion');
  };

  const playWelcomeAudio = () => {
    if (!audioEnabled) return;
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fond immersif avec image du marché */}
      <ImmersiveBackground 
        variant="market-blur" 
        backgroundImageUrl={marcheImage}
        showWaxPattern 
        showBlobs 
      />

      {/* Header institutionnel enrichi */}
      <PnavimInstitutionalHeader
        showNavigation={false}
        showAccessibility={true}
        showAudioToggle={true}
        showLanguageSelector={true}
        showLoginButton={true}
        isAudioEnabled={audioEnabled}
        onAudioToggle={() => setAudioEnabled(!audioEnabled)}
        onLoginClick={handleLoginClick}
        variant="compact"
      />

      {/* Contenu principal */}
      <main className="relative z-10 pt-24 pb-24">
        {/* Titre - Grande accroche */}
        <motion.div
          className="text-center mb-6 px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-nunito font-extrabold text-charbon leading-tight">
            {t('who_are_you')}
          </h1>
          <p className="text-charbon/60 mt-1 text-base">
            {t('choose_access')}
          </p>
        </motion.div>

        {/* Bouton Audio - "Cliquez pour écouter" */}
        <motion.div
          className="flex justify-center mb-6 px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <PnavimPillButton
            variant="secondary"
            size="md"
            leftIcon={<Volume2 className="w-4 h-4" />}
            onClick={playWelcomeAudio}
          >
            {t('click_to_listen') || 'Cliquez pour écouter'}
          </PnavimPillButton>
        </motion.div>

        {/* Carousel horizontal de cartes */}
        <motion.div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Carte Marchand - Hero (variant rich) */}
          <PnavimRoleCard
            persona="TANTIE"
            variant="rich"
            size="xl"
            showWelcomeBadge
            badgeText="Bienvenue"
            link="/marchand/connexion"
            audioMessage="Je suis marchand. Appuyez pour accéder à votre espace."
            className="snap-center min-w-[300px] flex-shrink-0"
          />

          {/* Carte Agent (variant solid) */}
          <PnavimRoleCard
            persona="AGENT"
            variant="solid"
            size="lg"
            avatarStatus="online"
            link="/agent/connexion"
            audioMessage="Agent terrain. Validez et accompagnez les marchands."
            className="snap-center min-w-[240px] flex-shrink-0"
          />

          {/* Carte Coopérative (variant glass) */}
          <PnavimRoleCard
            persona="COOP"
            variant="glass"
            size="lg"
            link="/cooperative/connexion"
            audioMessage="Coopérative agricole. Vendez aux marchands."
            className="snap-center min-w-[240px] flex-shrink-0"
          />
        </motion.div>

        {/* Footer logos institutionnels */}
        <motion.footer
          className="mt-10 text-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-charbon/50 font-medium mb-3">
            Une initiative de
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <img 
              src={logoDGE} 
              alt="Direction Générale des Entreprises" 
              className="h-10 w-auto object-contain bg-white/80 rounded-lg px-3 py-1.5 shadow-sm"
            />
            <img 
              src={logoANSUT} 
              alt="ANSUT" 
              className="h-10 w-auto object-contain bg-white/80 rounded-lg px-3 py-1.5 shadow-sm"
            />
          </div>
          <p className="mt-3 text-xs text-charbon/40">
            République de Côte d'Ivoire
          </p>
        </motion.footer>
      </main>

      {/* Courbe décorative Wax en bas */}
      <PnavimWaxCurve className="fixed bottom-0 left-0 right-0 z-0" />

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
