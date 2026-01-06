import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Order } from './types';
import { toast } from 'sonner';

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onConfirm: (orderId: string, reason: string) => Promise<boolean>;
}

export const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
  open,
  onOpenChange,
  order,
  onConfirm,
}) => {
  const [cancellationReason, setCancellationReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!order) return;
    
    const trimmedReason = cancellationReason.trim();
    if (trimmedReason.length < 10) {
      toast.error("Le motif doit contenir au moins 10 caractères");
      return;
    }

    setIsCancelling(true);
    const success = await onConfirm(order.id, trimmedReason);
    setIsCancelling(false);

    if (success) {
      onOpenChange(false);
      setCancellationReason('');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setCancellationReason('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Annuler la commande
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {order && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="font-semibold text-foreground">
                {order.product_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.quantity} {order.product_unit} • {order.total_amount.toLocaleString()} FCFA
              </p>
              <p className="text-sm text-muted-foreground">
                Client: {order.merchant_name}
              </p>
            </div>
          )}

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Cette action est irréversible
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Le marchand sera notifié de l'annulation.
            </p>
          </div>

          <div>
            <Label htmlFor="cancellationReason" className="text-destructive">
              Motif d'annulation (obligatoire) *
            </Label>
            <Textarea
              id="cancellationReason"
              placeholder="Ex: Stock insuffisant, produit indisponible, erreur de commande..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 10 caractères ({cancellationReason.trim().length}/10)
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={isCancelling}
            >
              Retour
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleCancel}
              disabled={isCancelling || cancellationReason.trim().length < 10}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Annulation...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Confirmer l'annulation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
