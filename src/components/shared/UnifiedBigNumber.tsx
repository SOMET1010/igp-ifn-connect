import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface UnifiedBigNumberProps {
  label: string;
  value: number | string;
  unit?: string;
  variant?: 'default' | 'primary' | 'success';
  className?: string;
}

export const UnifiedBigNumber: React.FC<UnifiedBigNumberProps> = ({
  label,
  value,
  unit,
  variant = 'default',
  className,
}) => {
  const formattedValue = typeof value === 'number' ? value.toLocaleString('fr-FR') : value;

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary/10 border-primary/20';
      case 'success':
        return 'bg-success/10 border-success/20';
      default:
        return 'bg-card';
    }
  };

  return (
    <Card className={cn('card-institutional', getColors(), className)}>
      <CardContent className="p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <p className="text-4xl font-bold text-foreground tracking-tight">
          {formattedValue}
        </p>
        {unit && (
          <p className="text-lg text-muted-foreground mt-1">{unit}</p>
        )}
      </CardContent>
    </Card>
  );
};
