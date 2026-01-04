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
      className={`fixed bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-full px-5 py-3 shadow-xl flex items-center gap-3 z-50 hover:bg-white hover:shadow-2xl transition-all border border-black/5 ${className}`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={t('need_help') || 'Besoin d\'aide ?'}
    >
      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
        <HelpCircle className="w-5 h-5 text-orange-sanguine" />
      </div>
      <div className="text-left">
        <p className="text-sm font-bold text-charbon">
          {t('need_help') || 'Besoin d\'aide ?'}
        </p>
        <p className="text-xs text-charbon/60">
          {t('ask_your_agent') || 'Demande à ton agent'}
        </p>
      </div>
    </motion.button>
  );
};

export default PnavimHelpButton;
