import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PnavimHelpButtonProps {
  onClick?: () => void;
  className?: string;
}

export const PnavimHelpButton: React.FC<PnavimHelpButtonProps> = ({
  onClick,
  className = '',
}) => {
  const { t } = useLanguage();

  return (
    <motion.button
      onClick={onClick}
      className={`fixed bottom-24 left-4 sm:bottom-6 sm:left-6 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2.5 sm:px-5 sm:py-3 shadow-lg flex items-center gap-2 sm:gap-3 z-40 hover:bg-white hover:shadow-xl transition-all border border-black/5 ${className}`}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
      whileTap={{ scale: 0.95 }}
      aria-label={t('need_help') || 'Besoin d\'aide ?'}
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
        <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-sanguine" />
      </div>
      <div className="text-left">
        <p className="text-xs sm:text-sm font-bold text-charbon">
          {t('need_help') || 'Besoin d\'aide ?'}
        </p>
        <p className="text-[10px] sm:text-xs text-charbon/60">
          {t('ask_your_agent') || 'Demande à ton agent'}
        </p>
      </div>
    </motion.button>
  );
};

export default PnavimHelpButton;
