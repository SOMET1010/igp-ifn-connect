/**
 * JulabaPageLayout - Layout de page inclusif Jùlaba
 * 
 * Fond chaud, safe-area, max-width mobile-first
 */
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface JulabaPageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Padding horizontal */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Avec espace pour bottom nav */
  withBottomNav?: boolean;
  /** Fond custom (sinon fond chaud par défaut) */
  background?: 'warm' | 'white' | 'gradient';
}

const JulabaPageLayout = forwardRef<HTMLDivElement, JulabaPageLayoutProps>(
  ({ 
    className, 
    padding = 'md',
    withBottomNav = true,
    background = 'warm',
    children,
    ...props 
  }, ref) => {
    
    const paddingStyles = {
      none: 'px-0',
      sm: 'px-3',
      md: 'px-4',
      lg: 'px-6',
    };
    
    const bgStyles = {
      warm: 'bg-[hsl(30_100%_98%)]',
      white: 'bg-white',
      gradient: 'bg-gradient-to-b from-[hsl(30_100%_98%)] to-[hsl(30_50%_96%)]',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen w-full max-w-[428px] mx-auto",
          bgStyles[background],
          paddingStyles[padding],
          withBottomNav && "pb-24",
          "pt-[env(safe-area-inset-top)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

JulabaPageLayout.displayName = 'JulabaPageLayout';

export { JulabaPageLayout };
