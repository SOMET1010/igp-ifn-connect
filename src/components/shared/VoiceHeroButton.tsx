import React from 'react';
import { cn } from '@/lib/utils';
import { Mic, Play, Pause, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export type VoiceHeroState = 'idle' | 'listening' | 'playing';

interface VoiceHeroButtonProps {
  state: VoiceHeroState;
  onClick: () => void;
  size?: 'md' | 'lg' | 'xl';
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const VoiceHeroButton: React.FC<VoiceHeroButtonProps> = ({
  state,
  onClick,
  size = 'lg',
  label,
  className,
  disabled = false,
}) => {
  const sizeClasses = {
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  };

  const iconSizes = {
    md: 28,
    lg: 36,
    xl: 44,
  };

  const getIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic className="text-white" size={iconSizes[size]} />;
      case 'playing':
        return <Pause className="text-white" size={iconSizes[size]} />;
      case 'idle':
      default:
        return <Play className="text-white ml-1" size={iconSizes[size]} />;
    }
  };

  const getGradient = () => {
    switch (state) {
      case 'listening':
        return 'from-vert-manioc to-green';
      case 'playing':
        return 'from-orange-sanguine to-terre-battue';
      case 'idle':
      default:
        return 'from-orange-sanguine to-terre-battue';
    }
  };

  const getLabel = () => {
    if (label) return label;
    switch (state) {
      case 'listening':
        return 'Écoute en cours...';
      case 'playing':
        return 'Lecture...';
      case 'idle':
      default:
        return 'Cliquez pour écouter';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'relative rounded-full flex items-center justify-center',
          'bg-gradient-to-br',
          getGradient(),
          'border-4 border-white/90',
          'shadow-xl hover:shadow-2xl',
          'transition-all duration-200',
          'focus:outline-none focus:ring-4 focus:ring-orange-sanguine/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        animate={state === 'idle' ? { scale: [1, 1.02, 1] } : {}}
        transition={{
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        {/* Pulse rings for listening state */}
        {state === 'listening' && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full bg-vert-manioc/30"
              animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.span
              className="absolute inset-0 rounded-full bg-vert-manioc/20"
              animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}

        {/* Pulse rings for idle state */}
        {state === 'idle' && (
          <motion.span
            className="absolute inset-0 rounded-full bg-orange-sanguine/20"
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}

        {getIcon()}

        {/* Sound wave indicator for playing */}
        {state === 'playing' && (
          <motion.span
            className="absolute -right-1 -top-1"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Volume2 className="text-white" size={16} />
          </motion.span>
        )}
      </motion.button>

      {/* Label */}
      <motion.span
        className={cn(
          'text-sm font-medium text-charbon/80',
          state === 'listening' && 'text-vert-manioc font-semibold'
        )}
        animate={state === 'listening' ? { opacity: [1, 0.6, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {getLabel()}
      </motion.span>

      {/* Audio bars for listening */}
      {state === 'listening' && (
        <div className="flex items-end gap-1 h-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.span
              key={i}
              className="w-1 bg-vert-manioc rounded-full"
              animate={{ height: ['8px', '20px', '8px'] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VoiceHeroButton;
