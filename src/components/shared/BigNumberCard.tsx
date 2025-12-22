import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface BigNumberCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon?: LucideIcon;
  className?: string;
}

export const BigNumberCard: React.FC<BigNumberCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  className
}) => {
  const displayValue = typeof value === 'number' 
    ? value.toLocaleString('fr-FR') 
    : value;

  return (
    <Card className={cn("card-institutional", className)}>
      <CardContent className="p-6 text-center">
        {Icon && (
          <div className="flex justify-center mb-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
          {label}
        </p>
        <p className="text-4xl font-bold text-primary">
          {displayValue}
        </p>
        {unit && (
          <p className="text-lg text-muted-foreground">{unit}</p>
        )}
      </CardContent>
    </Card>
  );
};
