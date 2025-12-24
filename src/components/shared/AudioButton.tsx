import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { playPrerecordedAudio, stopAudio as stopPrerecordedAudio } from '@/lib/audioService';
import { generateSpeech } from '@/shared/services/tts/openaiTts';
import logger from '@/infra/logger';

interface AudioButtonProps {
  textToRead: string;
  audioKey?: string; // Clé pour trouver l'audio pré-enregistré
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'floating' | 'inline';
}

export function AudioButton({ 
  textToRead, 
  audioKey,
  className, 
  size = 'md',
  variant = 'floating' 
}: AudioButtonProps) {
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

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

  // Arrêter l'audio en cours
  const stopAudio = useCallback(() => {
    stopPrerecordedAudio(audioRef.current);
    audioRef.current = null;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // TTS via OpenAI (Lovable AI Gateway - gratuit)
  const speakWithOpenAI = useCallback(async () => {
    setIsLoading(true);

    try {
      logger.debug('Appel OpenAI TTS', { module: 'AudioButton', text: textToRead.substring(0, 50) });

      const audioBlob = await generateSpeech(textToRead);
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
        if (navigator.vibrate) navigator.vibrate(30);
      };

      audio.onended = () => {
        setIsPlaying(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        logger.error('Erreur lecture audio OpenAI', e, { module: 'AudioButton' });
        setIsLoading(false);
        setIsPlaying(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      logger.error('Erreur OpenAI TTS', error, { module: 'AudioButton' });
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [textToRead]);

  // Fonction principale de lecture avec priorité audio pré-enregistré
  const speak = useCallback(async () => {
    // Si déjà en lecture, arrêter
    if (isPlaying) {
      stopAudio();
      return;
    }

    // Priorité 1: Audio pré-enregistré si audioKey fourni
    if (audioKey) {
      setIsLoading(true);
      const result = await playPrerecordedAudio(audioKey, language);
      
      if (result.success && result.audio) {
        audioRef.current = result.audio;
        setIsLoading(false);
        setIsPlaying(true);
        
        result.audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };
        return;
      }
      setIsLoading(false);
    }

    // Priorité 2: OpenAI TTS (Lovable AI Gateway)
    speakWithOpenAI();
  }, [isPlaying, language, audioKey, stopAudio, speakWithOpenAI]);

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

// Version pour les pages avec texte automatique
interface PageAudioButtonProps {
  pageKey: string;
  className?: string;
}

export function PageAudioButton({ pageKey, className }: PageAudioButtonProps) {
  const { t } = useLanguage();
  const textToRead = t(pageKey);
  
  return (
    <AudioButton 
      textToRead={textToRead}
      audioKey={pageKey}
      variant="floating"
      size="lg"
      className={cn("bottom-24 right-4", className)}
    />
  );
}
