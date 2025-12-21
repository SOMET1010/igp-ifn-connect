import { Button } from '@/components/ui/button';
import { PartyPopper, ArrowLeft, Download } from 'lucide-react';

interface StudioSessionCompleteProps {
  recordedCount: number;
  language: string;
  onExit: () => void;
  onExport?: () => void;
}

export function StudioSessionComplete({
  recordedCount,
  language,
  onExit,
  onExport
}: StudioSessionCompleteProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-lg">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-6">
          <PartyPopper className="h-16 w-16 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">
        Session terminée ! 🎉
      </h2>
      
      <p className="text-muted-foreground mb-6">
        <span className="text-primary font-semibold">{recordedCount}</span> textes enregistrés en{' '}
        <span className="font-medium">{language}</span>
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          variant="outline" 
          onClick={onExit}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au studio
        </Button>

        {onExport && (
          <Button 
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter les audios
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Vous pouvez réécouter et modifier vos enregistrements depuis la liste principale.
      </p>
    </div>
  );
}
