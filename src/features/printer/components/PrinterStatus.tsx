/**
 * Indicateur de statut de l'imprimante
 * Affichage compact pour header/navbar
 */

import { Printer, WifiOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { usePrinter } from '../hooks/usePrinter';

interface PrinterStatusProps {
  className?: string;
  showLabel?: boolean;
}

export function PrinterStatus({ className, showLabel = false }: PrinterStatusProps) {
  const { status, device, pendingJobs, isSupported } = usePrinter();

  if (!isSupported) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Printer className="h-4 w-4" />,
          color: 'bg-green-500',
          label: device?.name || 'Connecté',
          tooltip: `Imprimante ${device?.name} connectée`,
        };
      case 'connecting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          color: 'bg-amber-500',
          label: 'Connexion...',
          tooltip: 'Connexion en cours...',
        };
      case 'error':
        return {
          icon: <WifiOff className="h-4 w-4" />,
          color: 'bg-destructive',
          label: 'Erreur',
          tooltip: 'Erreur de connexion',
        };
      default:
        return {
          icon: <Printer className="h-4 w-4" />,
          color: 'bg-muted-foreground/50',
          label: 'Déconnecté',
          tooltip: pendingJobs > 0 
            ? `${pendingJobs} impression(s) en attente` 
            : 'Aucune imprimante connectée',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('relative inline-flex items-center gap-1.5', className)}>
          <div className="relative">
            <div className={cn(
              'p-1.5 rounded-full',
              status === 'connected' ? 'text-green-600' : 'text-muted-foreground'
            )}>
              {config.icon}
            </div>
            {/* Indicateur LED */}
            <span className={cn(
              'absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background',
              config.color
            )} />
          </div>
          
          {showLabel && (
            <span className="text-xs text-muted-foreground">
              {config.label}
            </span>
          )}

          {/* Badge jobs en attente */}
          {pendingJobs > 0 && (
            <Badge 
              variant="secondary" 
              className="h-5 min-w-5 px-1 text-xs bg-amber-100 text-amber-700"
            >
              {pendingJobs}
            </Badge>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
