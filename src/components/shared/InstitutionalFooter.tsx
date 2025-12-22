import React from 'react';
import { Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstitutionalFooterProps {
  variant?: 'default' | 'compact';
  showSupportButton?: boolean;
  onSupportClick?: () => void;
  version?: string;
  maxWidth?: 'md' | 'lg' | '2xl';
}

export const InstitutionalFooter: React.FC<InstitutionalFooterProps> = ({
  variant = 'default',
  showSupportButton = true,
  onSupportClick,
  version = '1.0.0',
  maxWidth = '2xl',
}) => {
  const maxWidthClass = {
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  if (variant === 'compact') {
    return (
      <footer className="py-4 px-4 sm:px-6 border-t border-border/30 bg-muted/30">
        <div className={`${maxWidthClass} mx-auto text-center space-y-2`}>
          <p className="text-xs font-medium text-foreground/80">
            Direction Générale des Entreprises (DGE)
          </p>
          <p className="text-[10px] text-muted-foreground">
            Plateforme IFN opérée par l'ANSUT
          </p>
          <p className="text-[10px] text-muted-foreground">
            © République de Côte d'Ivoire – 2024 · v{version}
          </p>
          {showSupportButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 mt-2"
              onClick={onSupportClick}
            >
              📞 Support technique
            </Button>
          )}
        </div>
      </footer>
    );
  }

  // Variant 'default' - 3 colonnes
  return (
    <footer className="bg-muted/30 border-t border-border/50 py-4 px-4">
      <div className={`${maxWidthClass} mx-auto`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="text-center sm:text-left">
            <p className="font-medium text-foreground">
              Direction Générale des Entreprises (DGE)
            </p>
            <p>Plateforme IFN opérée par l'ANSUT</p>
          </div>
          
          <div className="flex items-center gap-4">
            <span>© République de Côte d'Ivoire – 2024</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-muted-foreground/70">v{version}</span>
          </div>
          
          {showSupportButton && (
            <button 
              className="flex items-center gap-1.5 text-primary hover:underline"
              onClick={onSupportClick}
            >
              <Headphones className="h-3.5 w-3.5" />
              <span>Support technique</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
