import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  UserCircle, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Banknote 
} from 'lucide-react';
import type { CustomerCredit } from '../../types/credits.types';
import { isCreditOverdue } from '../../types/credits.types';

interface CreditCardProps {
  credit: CustomerCredit;
  onPaymentClick: (credit: CustomerCredit) => void;
}

function StatusBadge({ credit }: { credit: CustomerCredit }) {
  const isOverdue = isCreditOverdue(credit);
  
  if (credit.status === 'paid') {
    return (
      <Badge className="bg-secondary text-secondary-foreground">
        <CheckCircle className="w-3 h-3 mr-1" /> Payé
      </Badge>
    );
  }
  if (isOverdue) {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="w-3 h-3 mr-1" /> En retard
      </Badge>
    );
  }
  if (credit.status === 'partially_paid') {
    return (
      <Badge className="bg-accent text-accent-foreground">
        <Clock className="w-3 h-3 mr-1" /> Partiel
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <Clock className="w-3 h-3 mr-1" /> En cours
    </Badge>
  );
}

export function CreditCard({ credit, onPaymentClick }: CreditCardProps) {
  const remaining = credit.amount_owed - credit.amount_paid;

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{credit.customer_name}</h3>
              {credit.customer_phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {credit.customer_phone}
                </p>
              )}
            </div>
          </div>
          <StatusBadge credit={credit} />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Montant dû</p>
            <p className="font-bold text-foreground">
              {credit.amount_owed.toLocaleString()} FCFA
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reste à payer</p>
            <p className="font-bold text-primary">
              {remaining.toLocaleString()} FCFA
            </p>
          </div>
        </div>

        {credit.due_date && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
            <Calendar className="w-3 h-3" /> 
            Échéance: {new Date(credit.due_date).toLocaleDateString('fr-FR')}
          </p>
        )}

        {credit.status !== 'paid' && (
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => onPaymentClick(credit)}
          >
            <Banknote className="w-4 h-4 mr-2" /> Encaisser un paiement
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
