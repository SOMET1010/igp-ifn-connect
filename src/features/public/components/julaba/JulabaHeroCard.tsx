import React, { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Loader2, Wallet, UserCheck, Users, ShoppingBasket, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/shared/contexts';
import { useDesignMode } from '@/shared/contexts';
import { useSensoryFeedback } from '@/shared/hooks';
import { generateSpeech } from '@/shared/services/tts/elevenlabsTts';
import { VOICE_BY_CONTEXT, JULABA_VOICES } from '@/shared/config/voiceConfig';

type AccentColor = 'orange' | 'green' | 'blue';

interface PnavimHeroCardProps {
  role: 'marchand' | 'agent' | 'cooperative';
  title: string;
  subtitle: string;
  accentColor: AccentColor;
  mascotImage?: string;
  photoUrl?: string;
  showBadge?: boolean;
  badgeText?: string;
  audioMessage?: string;
  link: string;
  className?: string;
}

const ACCENT_STYLES: Record<AccentColor, { gradient: string; iconBg: string; institutionalGradient: string }> = {
  orange: {
    gradient: 'from-orange-500/90 via-orange-400/80 to-orange-600/90',
    institutionalGradient: 'from-primary/90 via-primary/80 to-primary/90',
    iconBg: 'bg-orange-600/50',
  },
  green: {
    gradient: 'from-green-600/90 via-green-500/80 to-green-700/90',
    institutionalGradient: 'from-green-700/85 via-green-600/75 to-green-800/85',
    iconBg: 'bg-green-700/50',
  },
  blue: {
    gradient: 'from-blue-600/90 via-blue-500/80 to-blue-700/90',
    institutionalGradient: 'from-blue-700/85 via-blue-600/75 to-blue-800/85',
    iconBg: 'bg-blue-700/50',
  },
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  marchand: ShoppingBasket,
  agent: BadgeCheck,
  cooperative: Users,
};

const WAX_PATTERN_SVG = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0zm0 10L10 30l20 20 20-20-20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export const PnavimHeroCard: React.FC<PnavimHeroCardProps> = ({
  role, title, subtitle, accentColor, mascotImage, photoUrl,
  showBadge = false, badgeText = 'Accès principal', audioMessage, link, className = '',
}) => {
  const navigate = useNavigate();
  const { triggerTap } = useSensoryFeedback();
  const { t } = useLanguage();
  const { isInstitutional } = useDesignMode();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const styles = ACCENT_STYLES[accentColor];
  const IconComponent = ROLE_ICONS[role] || Wallet;

  const isInIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();

  const MIC_SENSITIVE_PATHS = ['/marchand/connexion', '/marchand'];

  const handleCardClick = useCallback(() => {
    triggerTap();
    if (isInIframe && MIC_SENSITIVE_PATHS.some(p => link.startsWith(p))) {
      window.open(`${window.location.origin}${link}`, '_blank');
      return;
    }
    navigate(link);
  }, [navigate, link, triggerTap, isInIframe]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
    setIsPlaying(false);
  }, []);

  const handleAudioClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerTap();
    if (!audioMessage) return;
    if (isPlaying) { stopAudio(); return; }

    setIsLoading(true);
    try {
      const voiceId = VOICE_BY_CONTEXT[role] || JULABA_VOICES.DEFAULT;
      const audioBlob = await generateSpeech(audioMessage, { voiceId });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => { setIsLoading(false); setIsPlaying(true); if (navigator.vibrate) navigator.vibrate(30); };
      audio.onended = () => { setIsPlaying(false); if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; } audioRef.current = null; };
      audio.onerror = () => { setIsLoading(false); setIsPlaying(false); if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; } audioRef.current = null; };

      await audio.play();
    } catch (error) {
      console.error('Erreur ElevenLabs TTS:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [audioMessage, role, triggerTap, isPlaying, stopAudio]);

  // Adaptive styling based on design mode
  const cardRadius = isInstitutional ? 'rounded-xl' : 'rounded-[2rem]';
  const cardShadow = isInstitutional ? 'shadow-lg' : 'shadow-xl';
  const gradientClass = isInstitutional ? styles.institutionalGradient : styles.gradient;

  return (
    <motion.div
      onClick={handleCardClick}
      className={`relative group cursor-pointer overflow-hidden ${cardRadius} h-[280px] sm:h-[320px] ${cardShadow} transition-all active:scale-[0.98] ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="button"
      aria-label={`${title} - ${subtitle}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {photoUrl && (
        <div className={`absolute inset-0 bg-cover bg-center ${cardRadius}`} style={{ backgroundImage: `url(${photoUrl})` }} />
      )}
      
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} ${photoUrl ? 'opacity-80' : ''} backdrop-blur-sm`} />
      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 ${cardRadius}`} />
      <div className={`absolute inset-0 border border-white/20 ${cardRadius}`} />
      
      {!photoUrl && !isInstitutional && (
        <div className={`absolute inset-0 opacity-[0.06] pointer-events-none ${cardRadius}`}
          style={{ backgroundImage: WAX_PATTERN_SVG, backgroundSize: '40px 40px' }}
        />
      )}

      {showBadge && (
        <motion.div
          className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-10 ${
            isInstitutional ? 'bg-accent text-accent-foreground' : 'bg-jaune-sahel text-charbon'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          ★ {badgeText}
        </motion.div>
      )}

      <div className="relative z-10 h-full flex flex-col justify-between p-5 sm:p-6">
        <div className="space-y-3">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 ${styles.iconBg} rounded-2xl flex items-center justify-center backdrop-blur-sm`}>
            <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {title}
            </h2>
            <p className="text-white/80 text-base sm:text-lg mt-1">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <button
            onClick={handleAudioClick}
            disabled={isLoading}
            className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white px-4 py-3 rounded-full flex items-center gap-2 backdrop-blur-sm transition-colors font-semibold text-sm border border-white/10 min-h-[52px] disabled:opacity-50"
            aria-label={isPlaying ? 'Arrêter' : (t('click_to_listen') || 'Écouter')}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span>{isPlaying ? 'Arrêter' : (t('click_to_listen') || 'Écouter')}</span>
          </button>

          {mascotImage && (
            <motion.img
              src={mascotImage}
              alt=""
              className="absolute -bottom-2 -right-2 w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-xl"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PnavimHeroCard;
