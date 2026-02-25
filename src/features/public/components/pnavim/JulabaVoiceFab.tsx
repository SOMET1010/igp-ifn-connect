import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib';
import { useSensoryFeedback } from '@/shared/hooks';
import { useLanguage } from '@/shared/contexts';

export type FabState = 'idle' | 'listening' | 'processing' | 'disabled';

interface PnavimVoiceFabProps {
  state?: FabState;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  size?: 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

const positionStyles: Record<string, string> = {
  'bottom-right': 'fixed bottom-6 right-4 sm:right-6',
  'bottom-center': 'fixed bottom-6 left-1/2 -translate-x-1/2',
  'bottom-left': 'fixed bottom-6 left-4 sm:left-6',
};

const sizeStyles: Record<string, string> = {
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
  xl: 'w-[72px] h-[72px]',
};

const iconSizes: Record<string, string> = {
  md: 'w-6 h-6',
  lg: 'w-7 h-7',
  xl: 'w-8 h-8',
};

/**
 * Bouton flottant micro JÙLABA (FAB) - Version inclusive
 * Animation pulse légère (performance Android), label "Parler" visible
 */
export const PnavimVoiceFab: React.FC<PnavimVoiceFabProps> = ({
  state = 'idle',
  onClick,
  position = 'bottom-right',
  size = 'xl',
  showLabel = true,
  className = '',
}) => {
  const { triggerTap } = useSensoryFeedback();
  const { t } = useLanguage();
  
  const handleClick = () => {
    if (state === 'disabled' || state === 'processing') return;
    triggerTap();
    onClick?.();
  };

  const isDisabled = state === 'disabled';
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';

  // Couleurs selon l'état
  const bgColor = isDisabled
    ? 'bg-gray-300'
    : isListening
    ? 'bg-vert-manioc'
    : 'bg-orange-sanguine';

  const IconComponent = isDisabled ? MicOff : isProcessing ? Loader2 : Mic;

  return (
    <div className={cn(positionStyles[position], 'z-50 flex flex-col items-center gap-2', className)}>
      <motion.button
        onClick={handleClick}
        disabled={isDisabled || isProcessing}
        className={cn(
          sizeStyles[size],
          bgColor,
          'rounded-full flex items-center justify-center shadow-xl text-white transition-colors',
          'disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-orange-300',
          'min-h-[52px] border-4 border-white relative overflow-hidden'
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
        whileTap={{ scale: 0.9 }}
        aria-label={t('speak') || 'Parler'}
      >
        <IconComponent
          className={cn(iconSizes[size], 'relative z-10', isProcessing && 'animate-spin')}
        />
        
        {/* Animation pulse légère (performance Android bas de gamme) */}
        {state === 'idle' && (
          <motion.span
            className="absolute inset-0 rounded-full bg-orange-sanguine"
            animate={{ scale: [1, 1.1], opacity: [0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        
        {/* Animation glow écoute */}
        {isListening && (
          <motion.span
            className="absolute inset-0 rounded-full bg-vert-manioc"
            animate={{ scale: [1, 1.2], opacity: [0.4, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.button>
      
      {/* Label "Parler" visible */}
      {showLabel && (
        <motion.span
          className="text-sm font-bold text-charbon bg-white/95 px-3 py-1.5 rounded-full shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {isListening 
            ? (t('listening') || "J'écoute...") 
            : (t('speak') || 'Parler')}
        </motion.span>
      )}
    </div>
  );
};

export default PnavimVoiceFab;
