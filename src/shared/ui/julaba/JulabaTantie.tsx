/**
 * JulabaTantie - Mascotte Tantie Sagesse style Jùlaba
 * 
 * Design: Avatar chaleureux, bulle de dialogue, ton maternel
 */
import { cn } from '@/lib/utils';
import { Volume2 } from 'lucide-react';

export interface JulabaTantieProps {
  /** Message à afficher */
  message: string;
  /** Nom du marchand pour personnalisation */
  merchantName?: string;
  /** URL de l'image avatar */
  imageUrl?: string;
  /** Variante de taille */
  size?: 'sm' | 'md' | 'lg';
  /** Afficher bouton audio */
  showAudio?: boolean;
  /** Handler audio */
  onAudioPlay?: () => void;
  className?: string;
}

export function JulabaTantie({
  message,
  merchantName,
  imageUrl,
  size = 'md',
  showAudio = true,
  onAudioPlay,
  className,
}: JulabaTantieProps) {
  
  // Remplacer {nom} par le nom du marchand
  const displayMessage = message.replace('{nom}', merchantName || 'ma sœur');
  
  const sizeStyles = {
    sm: {
      container: 'gap-3',
      avatar: 'w-12 h-12',
      bubble: 'p-3 text-sm',
    },
    md: {
      container: 'gap-4',
      avatar: 'w-16 h-16',
      bubble: 'p-4 text-base',
    },
    lg: {
      container: 'gap-4',
      avatar: 'w-20 h-20',
      bubble: 'p-5 text-lg',
    },
  };
  
  const styles = sizeStyles[size];
  
  return (
    <div className={cn("flex items-start", styles.container, className)}>
      {/* Avatar Tantie */}
      <div className={cn(
        "rounded-full overflow-hidden flex-shrink-0",
        "border-3 border-[hsl(30_100%_60%)]",
        "shadow-[0_4px_16px_-4px_hsl(30_100%_50%/0.3)]",
        styles.avatar
      )}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Tantie Sagesse"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[hsl(30_100%_75%)] to-[hsl(30_100%_60%)] flex items-center justify-center">
            <span className="text-2xl">👩🏾‍🦱</span>
          </div>
        )}
      </div>
      
      {/* Bulle de dialogue */}
      <div className="flex-1 relative">
        {/* Triangle de la bulle */}
        <div className="absolute left-0 top-4 -translate-x-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-white" />
        
        {/* Contenu */}
        <div className={cn(
          "bg-white rounded-2xl shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]",
          "border border-[hsl(30_20%_92%)]",
          styles.bubble
        )}>
          <p className="text-foreground font-medium leading-relaxed">
            {displayMessage}
          </p>
          
          {showAudio && (
            <button
              onClick={onAudioPlay}
              className={cn(
                "mt-2 flex items-center gap-2",
                "text-sm text-[hsl(27_100%_45%)] font-semibold",
                "hover:underline",
                "active:opacity-70 transition-opacity"
              )}
            >
              <Volume2 className="w-4 h-4" />
              Écouter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
