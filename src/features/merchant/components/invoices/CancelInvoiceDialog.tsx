import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Invoice, cancelInvoiceSchema } from '../../types/invoices.types';

interface CancelInvoiceDialogProps {
  invoice: Invoice | null;
  onConfirm: (invoiceId: string, reason: string) => Promise<boolean>;
  onClose: () => void;
}

export function CancelInvoiceDialog({ invoice, onConfirm, onClose }: CancelInvoiceDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!invoice) return;

    const result = cancelInvoiceSchema.safeParse({ reason });
    
    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Motif invalide');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const success = await onConfirm(invoice.id, reason);
    
    if (success) {
      setReason('');
      onClose();
    }
    
    setIsSubmitting(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  return (
    <AlertDialog open={!!invoice} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Annuler cette facture ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. La facture{' '}
            <span className="font-mono font-bold">{invoice?.invoice_number}</span>{' '}
            sera marquée comme annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <Label htmlFor="cancelReason">Motif d'annulation *</Label>
          <Textarea
            id="cancelReason"
            placeholder="Décrivez le motif d'annulation (minimum 10 caractères)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={error ? 'border-destructive' : ''}
          />
          <div className="flex justify-between mt-1">
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-muted-foreground">{reason.length}/500</p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Annulation...
              </>
            ) : (
              'Confirmer l\'annulation'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
