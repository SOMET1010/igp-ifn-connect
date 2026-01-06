import { Volume2, X } from 'lucide-react';
import { useAudioContext } from '@/shared/contexts';

export function AudioPlayingIndicator() {
  const { isPlaying, stop } = useAudioContext();

  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg">
        {/* Icône avec animation pulse */}
        <div className="relative">
          <Volume2 className="w-5 h-5 animate-pulse" />
          {/* Barres audio animées */}
          <div className="absolute -right-1 -top-1 flex gap-0.5">
            <span className="w-0.5 h-2 bg-current rounded animate-audio-bar" />
            <span className="w-0.5 h-3 bg-current rounded animate-audio-bar" style={{ animationDelay: '0.1s' }} />
            <span className="w-0.5 h-2 bg-current rounded animate-audio-bar" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
        
        <span className="font-medium text-sm">Lecture...</span>
        
        {/* Bouton stop */}
        <button
          onClick={stop}
          className="p-1.5 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
          aria-label="Arrêter la lecture"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
