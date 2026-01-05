import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

// Components
import { ImmersiveBackground } from '@/components/shared/ImmersiveBackground';
import { 
  PnavimHeroCard,
  PnavimPillButton, 
  PnavimWaxCurve,
  PnavimInstitutionalHeader,
  PnavimHelpButton,
  PnavimVoiceFab,
} from '@/components/pnavim';
import { OnboardingTutorial } from '@/components/shared/OnboardingTutorial';

// Contexts & Hooks
import { useLanguage } from '@/contexts/LanguageContext';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';

// TTS (voix PNAVIM uniquement)
import { generateSpeech } from '@/shared/services/tts/elevenlabsTts';
import { PNAVIM_VOICES } from '@/shared/config/voiceConfig';

// Assets
import logoDGE from '@/assets/logo-dge.png';
import logoANSUT from '@/assets/logo-ansut.png';

// Types
interface InstitutionalPartner {
  id: string;
  name: string;
  logo: string;
}

const PARTNERS: InstitutionalPartner[] = [
  { id: 'dge', name: 'Direction Générale des Entreprises', logo: logoDGE },
  { id: 'ansut', name: 'ANSUT', logo: logoANSUT },
];

// Scripts audio SUTA complets (français ivoirien simple)
const AUDIO_SCRIPTS = {
  welcome: {
    fr: "Bonjour ! Bienvenue sur PNAVIM. Ici, on t'aide au marché. Choisis ta case.",
    dioula: "I ni sɔgɔma! Aw ni sɔgɔma PNAVIM. An bɛ i dɛmɛ julayɔrɔ la. I ka ɲɛnama sugandi.",
  },
  marchand: {
    fr: "Marchand. Tu veux encaisser, vendre, épargner. Touche ici.",
    dioula: "Julakɛla. I bɛ wari ta, feere, mara. A digi yan.",
  },
  agent: {
    fr: "Agent terrain. Tu veux accompagner les marchands. Touche ici.",
    dioula: "Ajan. I bɛ julakɛlaw dɛmɛ. A digi yan.",
  },
  micro: {
    fr: "D'accord. Parle. Dis ton numéro doucement.",
    dioula: "Ayi. Kuma. I ka nimɔrɔ fɔ cɛ.",
  },
};

// Animation variants centralisées (hors composant pour performance)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { triggerTap } = useSensoryFeedback();
  const { timeOfDay } = useTimeOfDay();

  // State
  const [showTutorial, setShowTutorial] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [micState, setMicState] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  // Refs
  const carouselRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const stopTtsAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const playTtsAudio = useCallback(
    async (text: string, voiceId: string = PNAVIM_VOICES.DEFAULT) => {
      if (!text || text.trim().length === 0) return;

      stopTtsAudio();

      try {
        const audioBlob = await generateSpeech(text, { voiceId });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        const cleanup = () => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
          }
        };

        audio.onended = cleanup;
        audio.onerror = cleanup;

        await audio.play();
      } catch (err) {
        stopTtsAudio();
        console.error('Erreur ElevenLabs TTS (Home)', err);
      }
    },
    [stopTtsAudio]
  );

  // Cleanup quand on quitte la page
  useEffect(() => {
    return () => stopTtsAudio();
  }, [stopTtsAudio]);

  // Check for tutorial visibility on mount
  useEffect(() => {
    try {
      const hasSeenTutorial = localStorage.getItem('pnavim-tutorial-seen');
      if (!hasSeenTutorial) {
        const timer = setTimeout(() => setShowTutorial(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.warn('LocalStorage access failed:', error);
    }
  }, []);

  // Detect active card on scroll (mobile carousel)
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const card = carousel.querySelector('[data-card]') as HTMLElement;
      if (!card) return;
      
      const scrollLeft = carousel.scrollLeft;
      const cardWidth = card.clientWidth;
      const gap = 16; // gap-4 = 16px
      const index = Math.round(scrollLeft / (cardWidth + gap));
      setActiveCardIndex(Math.max(0, Math.min(index, 1)));
    };

    carousel.addEventListener('scroll', handleScroll, { passive: true });
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  // Handlers
  const handleTutorialComplete = useCallback(() => {
    try {
      localStorage.setItem('pnavim-tutorial-seen', 'true');
    } catch (error) {
      console.warn('LocalStorage write failed:', error);
    }
    setShowTutorial(false);
  }, []);

  const handleLoginClick = useCallback(() => {
    triggerTap();
    navigate('/marchand/connexion');
  }, [navigate, triggerTap]);

  // Scroll to specific card (for dot navigation)
  const scrollToCard = useCallback((index: number) => {
    triggerTap();
    const carousel = carouselRef.current;
    if (!carousel) return;
    
    const card = carousel.querySelector('[data-card]') as HTMLElement;
    if (!card) return;
    
    const cardWidth = card.clientWidth;
    const gap = 16;
    carousel.scrollTo({
      left: index * (cardWidth + gap),
      behavior: 'smooth'
    });
  }, [triggerTap]);

  const toggleAudio = useCallback(() => {
    triggerTap();
    setAudioEnabled((prev) => {
      const next = !prev;
      if (!next) stopTtsAudio();
      return next;
    });
  }, [stopTtsAudio, triggerTap]);

  // Script audio complet SUTA
  const playWelcomeAudio = useCallback(() => {
    if (!audioEnabled) return;
    triggerTap();

    const langKey = language === 'dioula' ? 'dioula' : 'fr';
    const message = AUDIO_SCRIPTS.welcome[langKey];

    void playTtsAudio(message, PNAVIM_VOICES.DEFAULT);
  }, [audioEnabled, language, playTtsAudio, triggerTap]);

  // Handler FAB Micro -> navigation vers social-login
  const handleMicClick = useCallback(() => {
    triggerTap();

    // Jouer le script audio micro (voix PNAVIM)
    if (audioEnabled) {
      const langKey = language === 'dioula' ? 'dioula' : 'fr';
      const message = AUDIO_SCRIPTS.micro[langKey];
      void playTtsAudio(message, PNAVIM_VOICES.DEFAULT);
    }

    // Navigation vers auth vocale
    navigate('/social-login');
  }, [navigate, triggerTap, audioEnabled, language, playTtsAudio]);

  // Dynamic badge based on time
  const getTimeBadge = useCallback(() => {
    switch (timeOfDay) {
      case 'dawn': return 'Debout tôt !';
      case 'morning': return 'Bon matin !';
      case 'afternoon': return 'Bon après-midi';
      case 'evening': return 'Bonsoir !';
      case 'night': return 'Bonne nuit';
      default: return 'Accès principal';
    }
  }, [timeOfDay]);

  // Scripts audio par rôle
  const getMerchantAudio = () => {
    const langKey = language === 'dioula' ? 'dioula' : 'fr';
    return AUDIO_SCRIPTS.marchand[langKey];
  };

  const getAgentAudio = () => {
    const langKey = language === 'dioula' ? 'dioula' : 'fr';
    return AUDIO_SCRIPTS.agent[langKey];
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fond immersif avec photo du marché - blur réduit pour performance */}
      <ImmersiveBackground 
        variant="solar"
        showMarketPhoto
        blurAmount="sm"
        showWaxPattern={false}
        showBlobs={false}
      />

      {/* Header institutionnel simplifié */}
      <PnavimInstitutionalHeader
        showAccessibility={true}
        showAudioToggle={true}
        showLanguageSelector={true}
        showLoginButton={true}
        isAudioEnabled={audioEnabled}
        onAudioToggle={toggleAudio}
        onLoginClick={handleLoginClick}
        variant="compact"
      />

      {/* Contenu principal */}
      <main className="relative z-10 pt-20 pb-40 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Titres géants */}
        <motion.div
          className="text-center mb-6 sm:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-nunito font-extrabold text-white drop-shadow-lg mb-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {t('welcome') || 'Bienvenue'}
          </motion.h1>
          <motion.p 
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-jaune-sahel drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {t('who_are_you') || "C'est toi qui est là ?"}
          </motion.p>
        </motion.div>

        {/* Bouton Audio central */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <PnavimPillButton
            variant="secondary"
            size="md"
            leftIcon={<Volume2 className="w-5 h-5" />}
            onClick={playWelcomeAudio}
            className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl min-h-[52px]"
          >
            {t('click_to_listen') || 'Écouter'}
          </PnavimPillButton>
        </motion.div>

        {/* Mobile: Scroll Horizontal | Desktop: Grille 2 colonnes */}
        <motion.div 
          ref={carouselRef}
          className="md:grid md:grid-cols-2 md:gap-6 
                     flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 
                     -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible scrollbar-hide"
          role="list"
          aria-label="Sélection du rôle utilisateur"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Carte Marchand (Orange) - Plus grande, utilisateur principal */}
          <motion.div 
            data-card
            className="flex-shrink-0 w-[88vw] sm:w-[75vw] md:w-full snap-center"
            variants={itemVariants}
          >
            <PnavimHeroCard
              role="marchand"
              title={t('i_am_merchant') || 'Marchand'}
              subtitle={t('merchant_subtitle') || 'Encaisser, vendre, épargner'}
              accentColor="orange"
              showBadge
              badgeText={getTimeBadge()}
              audioMessage={getMerchantAudio()}
              link="/marchand/connexion"
              className="min-h-[280px] sm:min-h-[300px]"
            />
          </motion.div>

          {/* Carte Agent (Vert) - Plus compacte */}
          <motion.div 
            data-card
            className="flex-shrink-0 w-[75vw] sm:w-[60vw] md:w-full snap-center"
            variants={itemVariants}
          >
            <PnavimHeroCard
              role="agent"
              title={t('field_agent') || 'Agent terrain'}
              subtitle={t('agent_subtitle') || 'Accompagner les marchands'}
              accentColor="green"
              audioMessage={getAgentAudio()}
              link="/agent/connexion"
              className="min-h-[240px] sm:min-h-[260px] opacity-95"
            />
          </motion.div>
        </motion.div>

        {/* Pagination dots - Mobile only */}
        <div className="flex justify-center gap-3 mt-4 md:hidden">
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => scrollToCard(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeCardIndex === index
                  ? 'bg-jaune-sahel scale-125 shadow-lg shadow-jaune-sahel/50'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Aller à la carte ${index + 1}`}
              aria-current={activeCardIndex === index ? 'true' : undefined}
            />
          ))}
        </div>

        {/* Carte Coopérative (optionnelle - plus petite) */}
        <motion.div
          className="mt-5 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <button
            onClick={() => { triggerTap(); navigate('/cooperative/connexion'); }}
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-white/30 active:bg-white/40 transition-colors border border-white/20 flex items-center gap-2 min-h-[52px]"
          >
            <span>🌾</span>
            <span>{t('i_am_cooperative') || 'Je suis Coopérative'}</span>
          </button>
          <button
            onClick={() => { triggerTap(); navigate('/cooperatives'); }}
            className="bg-secondary/80 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-secondary active:bg-secondary/90 transition-colors border border-secondary/40 flex items-center gap-2 min-h-[52px]"
          >
            <span>👥</span>
            <span>{t('view_cooperatives') || 'Voir les Coopératives'}</span>
          </button>
          <button
            onClick={() => { triggerTap(); navigate('/carte'); }}
            className="bg-blue-600/80 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors border border-blue-500/40 flex items-center gap-2 min-h-[52px]"
          >
            <span>🗺️</span>
            <span>{t('view_map') || 'Voir la Carte'}</span>
          </button>
        </motion.div>

        {/* Footer logos institutionnels avec fond dégradé */}
        <motion.footer
          className="mt-10 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {/* Fond dégradé pour lisibilité */}
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-charbon/50 to-transparent -mx-4 px-4 py-6 rounded-t-3xl" />
          
          <div className="relative z-10 text-center py-6">
            <p className="text-xs font-medium mb-3 text-white">
              {t('initiative_by') || 'Une initiative de'}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {PARTNERS.map((partner) => (
                <img 
                  key={partner.id}
                  src={partner.logo} 
                  alt={partner.name} 
                  className="h-10 w-auto object-contain bg-white/90 rounded-lg px-3 py-1.5 shadow-sm"
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-white/70">
              République de Côte d'Ivoire
            </p>
          </div>
        </motion.footer>
      </main>

      {/* Courbe décorative Wax en bas */}
      <PnavimWaxCurve className="fixed bottom-0 left-0 right-0 z-0" />

      {/* FAB Micro "Parler" - positionné en bas à droite */}
      <PnavimVoiceFab
        state={micState}
        onClick={handleMicClick}
        position="bottom-right"
        size="xl"
        showLabel={true}
      />

      {/* Bouton d'aide flottant - repositionné à gauche */}
      <PnavimHelpButton onClick={() => navigate('/aide')} />

      {/* Onboarding Tutorial */}
      {showTutorial && (
        <OnboardingTutorial 
          isOpen={showTutorial} 
          onClose={() => setShowTutorial(false)}
          onComplete={handleTutorialComplete}
        />
      )}
    </div>
  );
};

export default React.memo(Index);
