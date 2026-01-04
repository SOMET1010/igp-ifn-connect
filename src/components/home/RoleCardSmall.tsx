import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Pause, Users, Warehouse } from 'lucide-react';
import { useTts } from '@/shared/hooks/useTts';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RoleCardSmallProps {
  role: 'agent' | 'cooperative';
}

const roleConfig = {
  agent: {
    title: 'Agent terrain',
    subtitle: 'Enrôler les marchands',
    icon: Users,
    emoji: '👨🏾‍💼',
    gradient: 'from-green to-vert-manioc',
    bgGradient: 'from-vert-manioc/10 to-green/5',
    link: '/agent/login',
    voiceKey: 'welcome_agent' as const,
  },
  cooperative: {
    title: 'Coopérative',
    subtitle: 'Gérer stocks et commandes',
    icon: Warehouse,
    emoji: '🌾',
    gradient: 'from-gold to-orange-sanguine',
    bgGradient: 'from-gold/10 to-orange-sanguine/5',
    link: '/cooperative/login',
    voiceKey: 'welcome_cooperative' as const,
  },
};

export const RoleCardSmall: React.FC<RoleCardSmallProps> = ({ role }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { language } = useLanguage();
  // Map language to voice auth lang (fr/nouchi/suta)
  const voiceLang = language === 'dioula' ? 'nouchi' : 'fr';
  const { speak, stop, isSpeaking } = useTts({ lang: voiceLang });
  const config = roleConfig[role];

  const handlePlayClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isPlaying) {
        stop();
        setIsPlaying(false);
        return;
      }

      setIsPlaying(true);
      
      try {
        const text = role === 'agent' 
          ? 'Agent terrain. Vous pouvez enrôler les marchands et suivre vos inscriptions.'
          : 'Coopérative. Gérez vos stocks et recevez des commandes des marchands.';
        speak(text);
      } catch (error) {
        console.error('TTS error:', error);
      } finally {
        setIsPlaying(false);
      }
    },
    [isPlaying, role, speak, stop]
  );

  // Update state when TTS finishes
  React.useEffect(() => {
    if (!isSpeaking && isPlaying) {
      setIsPlaying(false);
    }
  }, [isSpeaking, isPlaying]);

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: role === 'agent' ? 0.2 : 0.3 }}
    >
      <Link to={config.link} className="block">
        <div
          className={cn(
            'relative bg-white/80 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-white/50',
            'hover:shadow-xl hover:scale-[1.02] transition-all duration-200',
            'group cursor-pointer'
          )}
        >
          {/* Background gradient */}
          <div
            className={cn(
              'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity',
              config.bgGradient
            )}
          />

          <div className="relative flex items-center gap-4">
            {/* Icon/Emoji */}
            <div
              className={cn(
                'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md',
                config.gradient
              )}
            >
              <span className="text-2xl">{config.emoji}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-nunito font-bold text-lg text-charbon truncate">
                {config.title}
              </h3>
              <p className="text-sm text-charbon/60 truncate">{config.subtitle}</p>
            </div>

            {/* Play button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-11 w-11 rounded-full shrink-0',
                'bg-white/80 hover:bg-white shadow-md',
                isPlaying && 'bg-vert-manioc text-white hover:bg-vert-manioc/90'
              )}
              onClick={handlePlayClick}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RoleCardSmall;
