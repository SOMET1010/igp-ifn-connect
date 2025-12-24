import { Card, CardContent } from "@/components/ui/card";
import { Gift, TrendingUp } from "lucide-react";

interface PromotionsSummaryProps {
  activeCount: number;
  totalUsage: number;
}

export function PromotionsSummary({ activeCount, totalUsage }: PromotionsSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="bg-secondary/10 border-secondary/20">
        <CardContent className="p-4 text-center">
          <Gift className="w-6 h-6 mx-auto text-secondary mb-1" />
          <p className="text-2xl font-bold text-secondary">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Actives</p>
        </CardContent>
      </Card>
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-primary">{totalUsage}</p>
          <p className="text-xs text-muted-foreground">Utilisations</p>
        </CardContent>
      </Card>
    </div>
  );
}
