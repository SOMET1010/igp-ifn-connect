/**
 * Bouton de connexion à l'imprimante Bluetooth
 */

import { Printer, BluetoothOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePrinter } from '../hooks/usePrinter';
import type { PrinterConnectButtonProps } from '../types/printer.types';
import { toast } from 'sonner';

export function PrinterConnectButton({
  variant = 'outline',
  size = 'md',
  showStatus = true,
  className,
}: PrinterConnectButtonProps) {
  const { 
    status, 
    device, 
    savedDevice, 
    isSupported, 
    pendingJobs,
    connect, 
    disconnect,
    printTest,
  } = usePrinter();

  const handleClick = async () => {
    if (!isSupported) {
      toast.error('Bluetooth non supporté', {
        description: 'Utilisez Chrome ou Edge sur un appareil compatible',
      });
      return;
    }

    if (status === 'connected') {
      // Déconnecter ou imprimer test
      const shouldDisconnect = window.confirm(
        `Imprimante "${device?.name}" connectée.\n\nVoulez-vous la déconnecter ?`
      );
      if (shouldDisconnect) {
        disconnect();
        toast.info('Imprimante déconnectée');
      }
    } else {
      // Connecter
      const success = await connect();
      if (success) {
        toast.success('Imprimante connectée', {
          description: 'Voulez-vous imprimer un test ?',
          action: {
            label: 'Test',
            onClick: () => printTest(),
          },
        });
      }
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const getIcon = () => {
    switch (status) {
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <Check className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return isSupported ? <Printer className="h-4 w-4" /> : <BluetoothOff className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'connecting':
        return 'Connexion...';
      case 'connected':
        return device?.name || 'Connecté';
      case 'error':
        return 'Erreur';
      default:
        return savedDevice ? 'Reconnecter' : 'Imprimante';
    }
  };

  const getVariantColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100';
      case 'error':
        return 'bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20';
      default:
        return '';
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <Button
        variant={variant}
        onClick={handleClick}
        disabled={status === 'connecting'}
        className={cn(
          sizeClasses[size],
          variant === 'outline' && getVariantColor(),
          className
        )}
      >
        {getIcon()}
        {showStatus && <span className="ml-2">{getLabel()}</span>}
      </Button>

      {/* Badge pour jobs en attente */}
      {pendingJobs > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 min-w-5 px-1 text-xs"
        >
          {pendingJobs}
        </Badge>
      )}
    </div>
  );
}
