import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VoiceHeroButton, VoiceHeroState } from '@/components/shared/VoiceHeroButton';
import { useSpeechTts } from '@/features/voice-auth/hooks/useSpeechTts';
import { useLanguage } from '@/contexts/LanguageContext';
import { User } from 'lucide-react';

export const HeroMerchantCard: React.FC = () => {
  const [voiceState, setVoiceState] = useState<VoiceHeroState>('idle');
  const { language } = useLanguage();
  // Map language to voice auth lang (fr/nouchi/suta)
  const voiceLang = language === 'dioula' ? 'nouchi' : 'fr';
  const { speak, stop, isSpeaking } = useSpeechTts({ lang: voiceLang });

  const handleVoiceClick = useCallback(async () => {
    if (voiceState === 'playing') {
      stop();
      setVoiceState('idle');
      return;
    }

    setVoiceState('playing');
    
    try {
      await speak('welcome');
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setVoiceState('idle');
    }
  }, [voiceState, speak, stop]);

  // Update state when TTS finishes
  React.useEffect(() => {
    if (!isSpeaking && voiceState === 'playing') {
      setVoiceState('idle');
    }
  }, [isSpeaking, voiceState]);

  return (
    <div className="relative">
      {/* Glass Card */}
      <div className="relative bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/50">
        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-sanguine/10 text-orange-sanguine text-sm font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-sanguine animate-pulse" />
            Bienvenue
          </span>

          {/* Main Title */}
          <h1 className="font-nunito font-extrabold text-3xl sm:text-4xl text-charbon mb-2">
            Je suis{' '}
            <span className="bg-gradient-to-r from-orange-sanguine to-terre-battue bg-clip-text text-transparent">
              Marchand
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-charbon/70 text-lg mb-6 max-w-xs">
            Encaisser, vendre et épargner — simplement avec votre voix
          </p>

          {/* Mascot placeholder */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sable to-orange-sanguine/20 flex items-center justify-center mb-6 shadow-lg border-4 border-white">
            <span className="text-5xl">👩🏾‍🌾</span>
          </div>

          {/* Voice Hero Button */}
          <VoiceHeroButton
            state={voiceState}
            onClick={handleVoiceClick}
            size="xl"
            label={
              voiceState === 'playing'
                ? 'Tantie Sagesse parle...'
                : 'Appuyez pour écouter'
            }
          />

          {/* Secondary CTA */}
          <Link to="/marchand/login" className="mt-6 w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-14 px-8 rounded-2xl border-2 border-terre-battue text-terre-battue font-semibold hover:bg-terre-battue hover:text-white transition-all"
            >
              <User className="w-5 h-5 mr-2" />
              Se connecter
            </Button>
          </Link>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-sanguine/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-vert-manioc/15 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default HeroMerchantCard;
