import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  variant?: 'default' | 'warning' | 'success' | 'primary';
  className?: string;
}

export const UnifiedStatCard: React.FC<UnifiedStatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = 'default',
  className,
}) => {
  const getIconColors = () => {
    switch (variant) {
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'success':
        return 'text-success bg-success/10';
      case 'primary':
        return 'text-primary bg-primary/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  return (
    <Card className={cn('card-institutional', className)}>
      <CardContent className="p-4 flex flex-col items-center text-center gap-2">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', getIconColors())}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
          {subtitle && (
            <p className={cn(
              'text-[10px] mt-0.5',
              variant === 'warning' ? 'text-warning' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
