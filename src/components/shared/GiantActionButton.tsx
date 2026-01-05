import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * GiantActionButton - Bouton d'action géant pour UX inclusive
 * 
 * Design pour faible alphabétisation :
 * - Emoji XXL comme pictogramme universel
 * - Texte simple et court
 * - Zone tactile large (minimum 56px hauteur)
 * - Feedback visuel clair
 */

interface GiantActionButtonProps {
  /** Emoji ou icône texte (ex: "🛒", "📜") */
  emoji: string;
  /** Texte principal court (1-2 mots) */
  title: string;
  /** Sous-titre optionnel explicatif */
  subtitle?: string;
  /** Variante de couleur */
  variant?: 'primary' | 'secondary' | 'orange' | 'violet' | 'success';
  /** Désactivé */
  disabled?: boolean;
  /** Callback au clic */
  onClick: () => void;
  /** Classes CSS additionnelles */
  className?: string;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700',
  violet: 'bg-gradient-to-br from-violet-500 to-violet-600 text-white hover:from-violet-600 hover:to-violet-700',
  success: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700',
};

export const GiantActionButton: React.FC<GiantActionButtonProps> = ({
  emoji,
  title,
  subtitle,
  variant = 'primary',
  disabled = false,
  onClick,
  className,
}) => {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-2xl p-6 flex items-center gap-5',
        'transition-all duration-200 shadow-lg',
        'focus:outline-none focus:ring-4 focus:ring-primary/30',
        variantStyles[variant],
        disabled && 'opacity-50 cursor-not-allowed saturate-50',
        className
      )}
    >
      {/* Emoji XXL */}
      <span className="text-5xl" role="img" aria-hidden="true">
        {emoji}
      </span>
      
      {/* Texte */}
      <div className="flex-1 text-left">
        <p className="text-2xl font-bold tracking-wide">{title}</p>
        {subtitle && (
          <p className="text-base opacity-90 mt-0.5">{subtitle}</p>
        )}
      </div>
    </motion.button>
  );
};

export default GiantActionButton;
