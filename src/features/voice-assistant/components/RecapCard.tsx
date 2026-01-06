/**
 * RecapCard - Carte de récapitulatif de commande vocale
 */

import { Check, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/shared/lib';
import type { RecapCardProps } from '../types/voice.types';

export function RecapCard({ 
  mode, 
  command, 
  onConfirm, 
  onCancel, 
  onRepeat 
}: RecapCardProps) {
  if (!command) return null;
  
  const intent = command.intent;
  
  // Formater le contenu selon le type d'intent
  let content = '';
  let details = '';
  
  if (intent.intent === 'SALE_CREATE') {
    const sale = intent as { amountXOF?: number; productName?: string; quantity?: number; unit?: string };
    if (sale.productName && sale.amountXOF) {
      content = `${sale.productName}`;
      details = `${sale.amountXOF.toLocaleString('fr-FR')} FCFA`;
    } else if (sale.amountXOF) {
      content = `${sale.amountXOF.toLocaleString('fr-FR')} FCFA`;
    }
  } else if (intent.intent === 'STOCK_ADD') {
    const stock = intent as { productName?: string; quantity?: number };
    if (stock.productName && stock.quantity) {
      content = `Ajouter ${stock.quantity} ${stock.productName}`;
    }
  }
  
  const modeLabels = {
    cashier: 'Vente',
    article: 'Article',
    stock: 'Stock'
  };
  
  return (
    <Card className={cn(
      "w-full border-2",
      command.status === 'pending' && "border-primary",
      command.status === 'confirmed' && "border-green-500 bg-green-50",
      command.status === 'cancelled' && "border-red-500 bg-red-50"
    )}>
      <CardContent className="p-4">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {modeLabels[mode]}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(command.timestamp).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        {/* Contenu principal */}
        <div className="text-center mb-4">
          <p className="text-2xl font-bold text-foreground">{content}</p>
          {details && (
            <p className="text-lg text-muted-foreground mt-1">{details}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2 italic">
            "{command.rawText}"
          </p>
        </div>
        
        {/* Boutons d'action */}
        {command.status === 'pending' && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRepeat}
              className="flex-1"
            >
              <RotateCcw size={16} className="mr-1" />
              Répéter
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onCancel}
              className="flex-1"
            >
              <X size={16} className="mr-1" />
              Annuler
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={onConfirm}
              className="flex-1"
            >
              <Check size={16} className="mr-1" />
              Confirmer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
