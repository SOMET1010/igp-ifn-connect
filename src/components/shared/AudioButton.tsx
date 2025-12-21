import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface AudioButtonProps {
  textToRead: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'floating' | 'inline';
}

// Mapping des langues vers les codes de synthèse vocale supportés
const VOICE_LANG_MAP: Record<string, string> = {
  'fr': 'fr-FR',
  'dioula': 'fr-FR', // Fallback sur français pour les langues non supportées
  'baoule': 'fr-FR',
  'bete': 'fr-FR',
  'senoufo': 'fr-FR',
  'malinke': 'fr-FR',
};

export function AudioButton({ 
  textToRead, 
  className, 
  size = 'md',
  variant = 'floating' 
}: AudioButtonProps) {
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sizeStyles = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-xl',
    lg: 'w-16 h-16 text-2xl',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-Speech not supported');
      return;
    }

    // Arrêter si déjà en lecture
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);

    // Créer l'énoncé
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = VOICE_LANG_MAP[language] || 'fr-FR';
    utterance.rate = 0.9; // Légèrement plus lent pour meilleure compréhension
    utterance.pitch = 1;
    utterance.volume = 1;

    // Essayer de trouver une voix adaptée
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith(VOICE_LANG_MAP[language]?.split('-')[0] || 'fr')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
      // Feedback tactile
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    speechSynthesis.cancel(); // Annuler toute lecture en cours
    speechSynthesis.speak(utterance);
  }, [textToRead, language, isPlaying]);

  // S'assurer que les voix sont chargées
  if ('speechSynthesis' in window && speechSynthesis.getVoices().length === 0) {
    speechSynthesis.onvoiceschanged = () => {};
  }

  return (
    <button
      onClick={speak}
      disabled={isLoading}
      aria-label={isPlaying ? 'Arrêter la lecture' : t('audio_play')}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        variant === 'floating' 
          ? "fixed z-50 shadow-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 active:scale-95"
          : "bg-primary/10 text-primary hover:bg-primary/20",
        isPlaying && "animate-pulse ring-4 ring-primary/30",
        sizeStyles[size],
        className
      )}
    >
      {isLoading ? (
        <Loader2 className={cn("animate-spin", iconSizes[size])} />
      ) : isPlaying ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </button>
  );
}

// Version pour les pages avec texte automatique basé sur le contexte
interface PageAudioButtonProps {
  pageKey: string;
  className?: string;
}

export function PageAudioButton({ pageKey, className }: PageAudioButtonProps) {
  const { t } = useLanguage();
  
  // Construire le texte à lire basé sur la clé de page
  const textToRead = t(pageKey);
  
  return (
    <AudioButton 
      textToRead={textToRead}
      variant="floating"
      size="lg"
      className={cn("bottom-24 right-4", className)}
    />
  );
}
