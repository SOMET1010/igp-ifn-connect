/**
 * JulabaCard - Carte inclusive style Jùlaba
 * 
 * Design: Coins arrondis doux, ombres chaudes
 */
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface JulabaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante de bordure colorée */
  accent?: 'none' | 'orange' | 'green' | 'gold';
  /** Padding interne */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Effet hover interactif */
  interactive?: boolean;
  /** Avec effet glass/blur */
  glass?: boolean;
}

const JulabaCard = forwardRef<HTMLDivElement, JulabaCardProps>(
  ({ 
    className, 
    accent = 'none',
    padding = 'md',
    interactive = false,
    glass = false,
    children,
    ...props 
  }, ref) => {
    
    const baseStyles = `
      rounded-[20px] 
      border border-[hsl(30_20%_90%)]
      transition-all duration-200
    `;
    
    const accentStyles = {
      none: '',
      orange: 'border-l-4 border-l-[hsl(30_100%_60%)]',
      green: 'border-l-4 border-l-[hsl(145_74%_42%)]',
      gold: 'border-l-4 border-l-[hsl(45_100%_50%)]',
    };
    
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    };
    
    const interactiveStyles = interactive 
      ? 'cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'
      : '';
    
    const glassStyles = glass
      ? 'bg-white/80 backdrop-blur-md'
      : 'bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]';
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          accentStyles[accent],
          paddingStyles[padding],
          interactiveStyles,
          glassStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

JulabaCard.displayName = 'JulabaCard';

export { JulabaCard };
