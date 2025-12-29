import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';

interface UnifiedBigNumberProps {
  label: string;
  value: number | string;
  unit?: string;
  variant?: 'default' | 'primary' | 'success';
  className?: string;
  /** Callback pour interaction vocale au tap */
  onTap?: () => void;
  /** Afficher en taille XXL pour dashboard inclusif */
  sizeXXL?: boolean;
}

export const UnifiedBigNumber: React.FC<UnifiedBigNumberProps> = ({
  label,
  value,
  unit,
  variant = 'default',
  className,
  onTap,
  sizeXXL = false,
}) => {
  const { triggerTap } = useSensoryFeedback();
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

  const handleClick = () => {
    if (onTap) {
      triggerTap();
      onTap();
    }
  };

  return (
    <Card 
      className={cn(
        'card-institutional', 
        getColors(), 
        onTap && 'cursor-pointer active:scale-[0.98] transition-transform',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className={cn("p-6 text-center", sizeXXL && "py-8")}>
        <p className="text-sm text-muted-foreground mb-2">{label}</p>
        <p className={cn(
          "font-bold text-foreground tracking-tight",
          sizeXXL ? "amount-xxl" : "text-4xl"
        )}>
          {formattedValue}
        </p>
        {unit && (
          <p className={cn(
            "text-muted-foreground mt-1",
            sizeXXL ? "text-xl" : "text-lg"
          )}>
            {unit}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
