import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AudioButton } from './AudioButton';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageWrapperProps {
  children: ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  audioText?: string;
  showAudioButton?: boolean;
  showLanguageSelector?: boolean;
  className?: string;
  headerClassName?: string;
}

export function PageWrapper({
  children,
  pageTitle,
  pageDescription,
  audioText,
  showAudioButton = true,
  showLanguageSelector = true,
  className,
  headerClassName,
}: PageWrapperProps) {
  const { t } = useLanguage();
  
  // Construire le texte audio à partir du titre et description si non fourni
  const textToRead = audioText || [pageTitle, pageDescription].filter(Boolean).join('. ');

  return (
    <div className={cn("relative min-h-screen", className)}>
      {/* Sélecteur de langue en haut à droite */}
      {showLanguageSelector && (
        <div className={cn("fixed top-4 right-4 z-50", headerClassName)}>
          <LanguageSelector variant="icon" />
        </div>
      )}
      
      {/* Contenu de la page */}
      {children}
      
      {/* Bouton audio flottant */}
      {showAudioButton && textToRead && (
        <AudioButton 
          textToRead={textToRead}
          variant="floating"
          size="lg"
          className="bottom-24 right-4"
        />
      )}
    </div>
  );
}

// Hook pour utiliser les fonctionnalités de traduction dans les pages
export function usePageTranslation() {
  const { t, language, currentLanguageInfo } = useLanguage();
  
  return {
    t,
    language,
    languageInfo: currentLanguageInfo,
    // Fonction pour obtenir le texte audio d'une page
    getPageAudioText: (keys: string[]) => {
      return keys.map(key => t(key)).join('. ');
    },
  };
}
