import { Card, CardContent } from '@/components/ui/card';

interface CreditsSummaryProps {
  totalOwed: number;
  overdueCount: number;
}

export function CreditsSummary({ totalOwed, overdueCount }: CreditsSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total créances</p>
          <p className="text-xl font-bold text-primary">{totalOwed.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">FCFA</p>
        </CardContent>
      </Card>
      <Card className={`${overdueCount > 0 ? 'bg-destructive/10 border-destructive/20' : 'bg-secondary/10 border-secondary/20'}`}>
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">En retard</p>
          <p className={`text-xl font-bold ${overdueCount > 0 ? 'text-destructive' : 'text-secondary'}`}>
            {overdueCount}
          </p>
          <p className="text-xs text-muted-foreground">
            crédit{overdueCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
