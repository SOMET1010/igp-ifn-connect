import { cn } from '@/shared/lib';

interface AudioLevelMeterProps {
  level: number;
  peakLevel?: number;
  isClipping?: boolean;
  variant?: 'bar' | 'dots' | 'wave';
  size?: 'sm' | 'md' | 'lg';
  showPeak?: boolean;
  className?: string;
}

export function AudioLevelMeter({
  level,
  peakLevel = 0,
  isClipping = false,
  variant = 'bar',
  size = 'md',
  showPeak = false,
  className
}: AudioLevelMeterProps) {
  const sizeConfig = {
    sm: { height: 'h-1.5', width: 'w-24', dotSize: 'w-1.5 h-1.5', gap: 'gap-0.5' },
    md: { height: 'h-2.5', width: 'w-32', dotSize: 'w-2 h-2', gap: 'gap-1' },
    lg: { height: 'h-4', width: 'w-48', dotSize: 'w-3 h-3', gap: 'gap-1.5' }
  };

  const config = sizeConfig[size];

  // Couleur basée sur le niveau
  const getLevelColor = (segmentLevel: number) => {
    if (isClipping || segmentLevel > 95) return 'bg-destructive';
    if (segmentLevel > 75) return 'bg-warning';
    if (segmentLevel > 50) return 'bg-accent';
    return 'bg-secondary';
  };

  if (variant === 'bar') {
    return (
      <div className={cn('relative', config.width, className)}>
        {/* Background track */}
        <div className={cn(
          'w-full rounded-full bg-muted overflow-hidden',
          config.height
        )}>
          {/* Level fill */}
          <div
            className={cn(
              'h-full rounded-full transition-all duration-75',
              getLevelColor(level)
            )}
            style={{ width: `${Math.min(100, level)}%` }}
          />
        </div>
        
        {/* Peak indicator */}
        {showPeak && peakLevel > 0 && (
          <div
            className={cn(
              'absolute top-0 w-0.5 rounded-full transition-all duration-150',
              config.height,
              isClipping ? 'bg-destructive' : 'bg-foreground/50'
            )}
            style={{ left: `${Math.min(100, peakLevel)}%` }}
          />
        )}

        {/* Clipping indicator */}
        {isClipping && (
          <div className="absolute -right-2 top-1/2 -translate-y-1/2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    const dotCount = size === 'sm' ? 8 : size === 'md' ? 10 : 12;
    const dots = Array.from({ length: dotCount }, (_, i) => {
      const threshold = ((i + 1) / dotCount) * 100;
      const isActive = level >= threshold;
      return (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-75',
            config.dotSize,
            isActive ? getLevelColor(threshold) : 'bg-muted'
          )}
        />
      );
    });

    return (
      <div className={cn('flex items-center', config.gap, className)}>
        {dots}
        {isClipping && (
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse ml-1" />
        )}
      </div>
    );
  }

  if (variant === 'wave') {
    const barCount = size === 'sm' ? 5 : size === 'md' ? 7 : 9;
    const bars = Array.from({ length: barCount }, (_, i) => {
      // Distribution du niveau sur les barres avec effet de vague
      const centerIndex = Math.floor(barCount / 2);
      const distanceFromCenter = Math.abs(i - centerIndex);
      const normalizedDistance = distanceFromCenter / centerIndex;
      const barLevel = Math.max(0, level * (1 - normalizedDistance * 0.3) + Math.random() * 10);
      
      const maxHeight = size === 'sm' ? 16 : size === 'md' ? 24 : 32;
      const minHeight = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
      const height = minHeight + ((maxHeight - minHeight) * barLevel / 100);

      return (
        <div
          key={i}
          className={cn(
            'w-1 rounded-full transition-all duration-75',
            getLevelColor(barLevel)
          )}
          style={{ height: `${height}px` }}
        />
      );
    });

    return (
      <div className={cn('flex items-center justify-center', config.gap, className)}>
        {bars}
        {isClipping && (
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse ml-2" />
        )}
      </div>
    );
  }

  return null;
}
