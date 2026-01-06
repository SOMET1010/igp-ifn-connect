import React from 'react';
import { ArrowLeft } from 'lucide-react';
import logoDGE from '@/assets/logo-dge.png';
import logoANSUT from '@/assets/logo-ansut.png';
import { ThemeToggle } from './ThemeToggle';

interface InstitutionalHeaderProps {
  subtitle: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const InstitutionalHeader: React.FC<InstitutionalHeaderProps> = ({
  subtitle,
  showBackButton = false,
  onBack,
}) => {
  return (
    <header className="bg-card border-b border-border py-3 px-4">
      <div className="max-w-md mx-auto">
        {/* Ligne principale avec logos et titre */}
        <div className="flex items-center justify-between gap-3">
          {/* Bouton retour ou Logo DGE */}
          {showBackButton && onBack ? (
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 rounded-md hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
          ) : (
            <img 
              src={logoDGE} 
              alt="DGE" 
              className="h-8 w-auto object-contain"
            />
          )}
          
          {/* Titre central */}
          <div className="text-center flex-1">
            <h1 className="font-semibold text-sm text-foreground">
              PNAVIM-CI – {subtitle}
            </h1>
            <p className="text-xs text-muted-foreground">
              Plateforme Nationale des Acteurs du Vivrier Marchand
            </p>
          </div>
          
          {/* Toggle thème + Logo ANSUT */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <img 
              src={logoANSUT} 
              alt="ANSUT" 
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
