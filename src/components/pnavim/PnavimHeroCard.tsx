import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Wallet, UserCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';

type AccentColor = 'orange' | 'green' | 'blue';

interface PnavimHeroCardProps {
  role: 'marchand' | 'agent' | 'cooperative';
  title: string;
  subtitle: string;
  accentColor: AccentColor;
  mascotImage?: string;
  showBadge?: boolean;
  badgeText?: string;
  audioMessage?: string;
  link: string;
  className?: string;
}

const ACCENT_STYLES: Record<AccentColor, { gradient: string; iconBg: string }> = {
  orange: {
    gradient: 'from-orange-500/90 via-orange-400/80 to-orange-600/90',
    iconBg: 'bg-orange-600/50',
  },
  green: {
    gradient: 'from-green-600/90 via-green-500/80 to-green-700/90',
    iconBg: 'bg-green-700/50',
  },
  blue: {
    gradient: 'from-blue-600/90 via-blue-500/80 to-blue-700/90',
    iconBg: 'bg-blue-700/50',
  },
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  marchand: Wallet,
  agent: UserCheck,
  cooperative: Users,
};

export const PnavimHeroCard: React.FC<PnavimHeroCardProps> = ({
  role,
  title,
  subtitle,
  accentColor,
  mascotImage,
  showBadge = false,
  badgeText = 'Accès principal',
  audioMessage,
  link,
  className = '',
}) => {
  const navigate = useNavigate();
  const { triggerTap } = useSensoryFeedback();
  const { t } = useLanguage();

  const styles = ACCENT_STYLES[accentColor];
  const IconComponent = ROLE_ICONS[role] || Wallet;

  const handleCardClick = useCallback(() => {
    triggerTap();
    navigate(link);
  }, [navigate, link, triggerTap]);

  const handleAudioClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    triggerTap();
    
    if ('speechSynthesis' in window && audioMessage) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(audioMessage);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [audioMessage, triggerTap]);

  return (
    <motion.div
      onClick={handleCardClick}
      className={`relative group cursor-pointer overflow-hidden rounded-[2rem] h-[280px] sm:h-[320px] shadow-2xl transition-all hover:scale-[1.02] hover:shadow-3xl ${className}`}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="button"
      aria-label={`${title} - ${subtitle}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {/* Fond Dégradé Glassmorphism */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} backdrop-blur-xl`} />
      <div className="absolute inset-0 bg-white/5" />
      <div className="absolute inset-0 border border-white/20 rounded-[2rem]" />

      {/* Badge */}
      {showBadge && (
        <motion.div
          className="absolute top-4 right-4 bg-jaune-sahel text-charbon px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          ★ {badgeText}
        </motion.div>
      )}

      {/* Contenu */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        {/* Haut : Icône + Titres */}
        <div className="space-y-3">
          <div className={`w-12 h-12 ${styles.iconBg} rounded-2xl flex items-center justify-center backdrop-blur-sm`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-nunito font-extrabold text-white leading-tight">
              {title}
            </h2>
            <p className="text-white/80 text-sm sm:text-base mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Bas : Bouton Audio + Image */}
        <div className="flex items-end justify-between">
          <button
            onClick={handleAudioClick}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-full flex items-center gap-2 backdrop-blur-md transition-colors font-medium text-sm border border-white/10"
            aria-label={t('click_to_listen') || 'Écouter'}
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('click_to_listen') || 'Écouter'}</span>
          </button>

          {/* Mascotte/Image (positionnée pour dépasser) */}
          {mascotImage && (
            <motion.img
              src={mascotImage}
              alt=""
              className="absolute -bottom-2 -right-2 w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-2xl"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PnavimHeroCard;
