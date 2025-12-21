import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';

interface StudioProgressBarProps {
  recorded: number;
  total: number;
  language: string;
}

export function StudioProgressBar({ recorded, total, language }: StudioProgressBarProps) {
  const percentage = total > 0 ? Math.round((recorded / total) * 100) : 0;

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {percentage === 100 ? (
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="font-medium text-foreground">
            Progression {language}
          </span>
        </div>
        <span className="text-sm font-semibold text-primary">
          {recorded}/{total} ({percentage}%)
        </span>
      </div>
      
      <Progress value={percentage} className="h-3" />
      
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>🔴 {total - recorded} manquants</span>
        <span>🟢 {recorded} enregistrés</span>
      </div>
    </div>
  );
}
