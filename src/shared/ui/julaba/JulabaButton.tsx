/**
 * JulabaButton - Bouton géant inclusif style Jùlaba
 * 
 * Design: Voice-First, Zero Text, tactile XXL
 * Usage: Actions principales (VENDRE, INSCRIRE, etc.)
 */
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface JulabaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante de style */
  variant?: 'hero' | 'secondary' | 'success' | 'outline' | 'ghost';
  /** Taille du bouton */
  size?: 'sm' | 'md' | 'lg' | 'hero';
  /** Emoji/icône à afficher */
  emoji?: string;
  /** État de chargement */
  isLoading?: boolean;
  /** Sous-titre optionnel */
  subtitle?: string;
}

const JulabaButton = forwardRef<HTMLButtonElement, JulabaButtonProps>(
  ({ 
    className, 
    variant = 'hero', 
    size = 'lg',
    emoji,
    isLoading,
    subtitle,
    children,
    disabled,
    ...props 
  }, ref) => {
    
    const baseStyles = `
      inline-flex items-center justify-center gap-3
      font-bold transition-all duration-150
      active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
      touch-manipulation select-none
    `;
    
    const variantStyles = {
      hero: `
        bg-gradient-to-br from-[hsl(30_100%_60%)] to-[hsl(27_100%_50%)]
        text-white shadow-[0_8px_32px_-8px_hsl(30_100%_50%/0.5)]
        hover:shadow-[0_12px_40px_-8px_hsl(30_100%_50%/0.6)]
        border-0
      `,
      secondary: `
        bg-white border-2 border-[hsl(30_100%_60%)]
        text-[hsl(27_100%_45%)]
        hover:bg-[hsl(30_100%_97%)]
      `,
      success: `
        bg-gradient-to-br from-[hsl(145_74%_42%)] to-[hsl(145_74%_32%)]
        text-white shadow-[0_8px_32px_-8px_hsl(145_74%_40%/0.5)]
        border-0
      `,
      outline: `
        bg-transparent border-2 border-[hsl(30_20%_85%)]
        text-foreground
        hover:border-[hsl(30_100%_60%)] hover:bg-[hsl(30_100%_98%)]
      `,
      ghost: `
        bg-transparent text-foreground
        hover:bg-[hsl(30_20%_95%)]
      `,
    };
    
    const sizeStyles = {
      sm: 'min-h-[44px] px-4 text-base rounded-xl',
      md: 'min-h-[56px] px-5 text-lg rounded-2xl',
      lg: 'min-h-[72px] px-6 text-xl rounded-2xl',
      hero: 'min-h-[96px] w-full px-8 text-2xl rounded-3xl',
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            {emoji && <span className="text-3xl">{emoji}</span>}
            <div className={cn(
              "flex flex-col",
              subtitle ? "items-start" : "items-center"
            )}>
              <span>{children}</span>
              {subtitle && (
                <span className="text-sm font-medium opacity-80">{subtitle}</span>
              )}
            </div>
          </>
        )}
      </button>
    );
  }
);

JulabaButton.displayName = 'JulabaButton';

export { JulabaButton };
