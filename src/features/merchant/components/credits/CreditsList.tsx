import { Card, CardContent } from '@/components/ui/card';
import { UserCircle } from 'lucide-react';
import { CreditCard } from './CreditCard';
import type { CustomerCredit } from '../../types/credits.types';

interface CreditsListProps {
  credits: CustomerCredit[];
  onPaymentClick: (credit: CustomerCredit) => void;
}

export function CreditsList({ credits, onPaymentClick }: CreditsListProps) {
  if (credits.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-8 text-center">
          <UserCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Aucun crédit client</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {credits.map((credit) => (
        <CreditCard 
          key={credit.id} 
          credit={credit} 
          onPaymentClick={onPaymentClick}
        />
      ))}
    </div>
  );
}
