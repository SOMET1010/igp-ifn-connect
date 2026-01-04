import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTimeOfDay, TimeOfDay } from '@/hooks/useTimeOfDay';

interface TimeAwareGreetingProps {
  className?: string;
  showMarketStatus?: boolean;
}

const iconAnimations: Record<TimeOfDay, { rotate?: number[]; scale?: number[]; y?: number[] }> = {
  dawn: { rotate: [-5, 5, -5], y: [0, -3, 0] },
  morning: { rotate: [0, 10, 0], scale: [1, 1.05, 1] },
  afternoon: { scale: [1, 1.1, 1] },
  evening: { rotate: [0, -10, 0], y: [0, 2, 0] },
  night: { scale: [1, 0.95, 1], rotate: [0, 5, 0] }
};

export const TimeAwareGreeting: React.FC<TimeAwareGreetingProps> = ({
  className = "",
  showMarketStatus = true
}) => {
  const { language } = useLanguage();
  const { timeOfDay, greeting, marketStatus, icon: Icon } = useTimeOfDay();

  // Map language code to greeting key - default to french for unsupported languages
  const greetingKey = language === 'dioula' ? 'dioula' : 'fr';
  const currentGreeting = greeting[greetingKey];

  return (
    <motion.div 
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Icône animée du moment */}
      <motion.div
        animate={iconAnimations[timeOfDay]}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="flex-shrink-0"
      >
        <div className={`
          p-2.5 rounded-xl shadow-lg
          ${timeOfDay === 'night' ? 'bg-indigo-900/80' : 'bg-white/80'}
        `}>
          <Icon 
            className={`w-6 h-6 ${
              timeOfDay === 'dawn' ? 'text-pink-400' :
              timeOfDay === 'morning' ? 'text-orange-sanguine' :
              timeOfDay === 'afternoon' ? 'text-jaune-or' :
              timeOfDay === 'evening' ? 'text-orange-700' :
              'text-indigo-300'
            }`} 
          />
        </div>
      </motion.div>

      {/* Texte de salutation */}
      <div className="flex flex-col">
        <motion.h2 
          className={`text-lg font-bold leading-tight ${
            timeOfDay === 'night' ? 'text-white' : 'text-charbon'
          }`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {currentGreeting}
        </motion.h2>
        
        {showMarketStatus && (
          <motion.p 
            className={`text-sm flex items-center gap-1.5 ${
              timeOfDay === 'night' ? 'text-white/70' : 'text-charbon/60'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <span>{marketStatus.emoji}</span>
            <span>{marketStatus.message}</span>
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default TimeAwareGreeting;
