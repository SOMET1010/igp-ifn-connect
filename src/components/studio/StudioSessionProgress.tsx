import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface StudioSessionProgressProps {
  current: number;
  total: number;
  onExit: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

export function StudioSessionProgress({ 
  current, 
  total, 
  onExit,
  onPrevious,
  onNext,
  canGoPrevious = false,
  canGoNext = false
}: StudioSessionProgressProps) {
  const progress = total > 0 ? ((current) / total) * 100 : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onExit}
          className="text-muted-foreground hover:text-foreground gap-2"
        >
          <X className="h-4 w-4" />
          Quitter la session
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[100px] text-center">
            Texte {current + 1} sur {total}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!canGoNext}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Progress value={progress} className="h-2" />
      
      <p className="text-xs text-muted-foreground text-center mt-2">
        {Math.round(progress)}% terminé
      </p>
    </div>
  );
}
