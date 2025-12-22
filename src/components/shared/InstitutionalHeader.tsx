import React from 'react';
import { ArrowLeft } from 'lucide-react';
import logoDGE from '@/assets/logo-dge.png';
import logoANSUT from '@/assets/logo-ansut.png';

interface InstitutionalHeaderProps {
  subtitle: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showOfficialBadge?: boolean;
}

export const InstitutionalHeader: React.FC<InstitutionalHeaderProps> = ({
  subtitle,
  showBackButton = false,
  onBack,
  showOfficialBadge = true,
}) => {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Ligne supérieure avec logos */}
        <div className="flex items-center justify-between mb-3">
          {/* Logo DGE (gauche) */}
          <div className="bg-white rounded-lg p-1.5 shadow-sm">
            <img 
              src={logoDGE} 
              alt="Direction Générale des Entreprises" 
              className="h-10 w-auto object-contain"
            />
          </div>
          
          {/* Titre central */}
          <div className="text-center flex-1 px-2">
            <h1 className="font-bold text-sm sm:text-base">Plateforme IFN</h1>
            <p className="text-[10px] sm:text-xs text-primary-foreground/70">{subtitle}</p>
          </div>
          
          {/* Logo ANSUT (droite) */}
          <div className="bg-white rounded-lg p-1.5 shadow-sm">
            <img 
              src={logoANSUT} 
              alt="ANSUT - Agence Nationale du Service Universel des Télécommunications" 
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>
        
        {/* Ligne inférieure avec navigation/texte ministériel */}
        <div className="flex items-center gap-3">
          {showBackButton && onBack && (
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🇨🇮</span>
              <span className="font-medium text-sm">République de Côte d'Ivoire</span>
            </div>
            <p className="text-xs text-primary-foreground/70 mt-0.5">
              Direction Générale des Entreprises · Ministère de l'Économie
            </p>
            {showOfficialBadge && (
              <p className="text-[10px] text-primary-foreground/60 mt-1">
                🏛️ Portail officiel sécurisé
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default InstitutionalHeader;
