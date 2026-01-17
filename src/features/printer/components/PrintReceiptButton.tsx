/**
 * Bouton d'impression de reçu
 */

import { Printer, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePrintReceipt } from '../hooks/usePrintReceipt';
import { usePrinter } from '../hooks/usePrinter';
import type { PrintReceiptButtonProps } from '../types/printer.types';

export function PrintReceiptButton({
  receiptData,
  variant = 'outline',
  size = 'md',
  disabled = false,
  className,
  onPrinted,
  onError,
}: PrintReceiptButtonProps) {
  const { print, isPrinting, isQueued } = usePrintReceipt();
  const { isSupported, status } = usePrinter();

  const handlePrint = async () => {
    const success = await print(receiptData);
    if (success) {
      onPrinted?.();
    } else if (!success && isQueued) {
      // Pas d'erreur, juste mis en queue
    } else {
      onError?.('Échec de l\'impression');
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const getIcon = () => {
    if (isPrinting) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (isQueued) {
      return <Clock className="h-4 w-4" />;
    }
    return <Printer className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (isPrinting) return 'Impression...';
    if (isQueued) return 'En attente';
    if (status === 'connected') return 'Imprimer';
    return 'Mettre en file';
  };

  // Ne pas afficher si Web Bluetooth non supporté
  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant={variant}
      onClick={handlePrint}
      disabled={disabled || isPrinting}
      className={cn(
        sizeClasses[size],
        isQueued && 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
        className
      )}
    >
      {getIcon()}
      <span className="ml-2">{getLabel()}</span>
    </Button>
  );
}
