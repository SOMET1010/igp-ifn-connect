/**
 * JulabaInput - Champ de saisie inclusif XXL
 * 
 * Design: Grand, lisible, feedback visuel clair
 */
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface JulabaInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Taille du champ */
  size?: 'md' | 'lg' | 'xl';
  /** Emoji préfixe */
  emoji?: string;
  /** Label au-dessus */
  label?: string;
  /** Message d'erreur */
  error?: string;
  /** Message d'aide */
  hint?: string;
}

const JulabaInput = forwardRef<HTMLInputElement, JulabaInputProps>(
  ({ 
    className, 
    size = 'lg',
    emoji,
    label,
    error,
    hint,
    ...props 
  }, ref) => {
    
    const sizeStyles = {
      md: 'h-12 text-base px-4',
      lg: 'h-14 text-lg px-5',
      xl: 'h-16 text-xl px-6',
    };
    
    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-semibold text-foreground mb-2">
            {label}
          </label>
        )}
        
        {/* Input container */}
        <div className="relative">
          {/* Emoji prefix */}
          {emoji && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl pointer-events-none">
              {emoji}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              "w-full rounded-2xl",
              "bg-white border-2",
              "font-medium",
              "transition-all duration-150",
              "placeholder:text-muted-foreground/60",
              sizeStyles[size],
              emoji && "pl-14",
              error 
                ? "border-[hsl(0_80%_60%)] focus:border-[hsl(0_80%_50%)] focus:ring-2 focus:ring-[hsl(0_80%_60%)/20]"
                : "border-[hsl(30_20%_85%)] focus:border-[hsl(30_100%_60%)] focus:ring-2 focus:ring-[hsl(30_100%_60%)/20]",
              "outline-none",
              className
            )}
            {...props}
          />
        </div>
        
        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm font-medium text-[hsl(0_80%_50%)] flex items-center gap-1">
            <span>⚠️</span> {error}
          </p>
        )}
        
        {/* Hint */}
        {hint && !error && (
          <p className="mt-2 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

JulabaInput.displayName = 'JulabaInput';

export { JulabaInput };
