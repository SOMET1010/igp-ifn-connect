import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { playPrerecordedAudio, stopAudio as stopPrerecordedAudio } from '@/lib/audioService';

interface AudioButtonProps {
  textToRead: string;
  audioKey?: string; // Clé pour trouver l'audio pré-enregistré
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'floating' | 'inline';
}

// Langues supportées par LAFRICAMOBILE
const LAFRICAMOBILE_LANGUAGES = ['dioula'];

// Mapping des langues vers les codes de synthèse vocale Web Speech API
const VOICE_LANG_MAP: Record<string, string> = {
  'fr': 'fr-FR',
  'baoule': 'fr-FR',
  'bete': 'fr-FR',
  'senoufo': 'fr-FR',
  'malinke': 'fr-FR',
};

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
    speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  // TTS via LAFRICAMOBILE pour Dioula
  const speakWithLafricamobile = useCallback(async () => {
    setIsLoading(true);

    try {
      console.log('Calling LAFRICAMOBILE TTS for:', textToRead.substring(0, 50));

      const { data, error } = await supabase.functions.invoke('lafricamobile-tts', {
        body: {
          text: textToRead,
          language: 'dioula',
          translateFromFrench: true,
        },
      });

      if (error) {
        console.error('LAFRICAMOBILE error:', error);
        throw error;
      }

      if (!data?.success || !data?.audioUrl) {
        console.error('LAFRICAMOBILE response:', data);
        throw new Error(data?.error || 'No audio URL returned');
      }

      console.log('Playing audio from:', data.audioUrl);

      // Créer et jouer l'audio
      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
        if (navigator.vibrate) navigator.vibrate(30);
      };

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsLoading(false);
        setIsPlaying(false);
        audioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      console.error('LAFRICAMOBILE TTS error:', error);
      setIsLoading(false);
      setIsPlaying(false);
      // Fallback vers Web Speech API en français
      speakWithWebSpeech('fr');
    }
  }, [textToRead]);

  // TTS via Web Speech API (français et fallback)
  const speakWithWebSpeech = useCallback((langOverride?: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not supported');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const utterance = new SpeechSynthesisUtterance(textToRead);
    const targetLang = langOverride || VOICE_LANG_MAP[language] || 'fr-FR';
    utterance.lang = targetLang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Trouver une voix adaptée
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith(targetLang.split('-')[0])
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
      if (navigator.vibrate) navigator.vibrate(30);
    };

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsLoading(false);
      setIsPlaying(false);
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, [textToRead, language]);

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

    // Priorité 2: LAFRICAMOBILE pour Dioula (fallback TTS)
    if (LAFRICAMOBILE_LANGUAGES.includes(language)) {
      speakWithLafricamobile();
    } else {
      // Priorité 3: Web Speech API pour français et autres
      speakWithWebSpeech();
    }
  }, [isPlaying, language, audioKey, stopAudio, speakWithLafricamobile, speakWithWebSpeech]);

  // Charger les voix
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
      audioKey={pageKey} // Utiliser la clé de traduction comme clé audio
      variant="floating"
      size="lg"
      className={cn("bottom-24 right-4", className)}
    />
  );
}
