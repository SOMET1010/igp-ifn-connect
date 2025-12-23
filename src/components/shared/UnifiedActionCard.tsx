import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'primary';
  className?: string;
}

export const UnifiedActionCard: React.FC<UnifiedActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  variant = 'default',
  className,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <Card
      className={cn(
        'card-institutional cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98]',
        isPrimary && 'bg-primary/5 border-primary/20',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            isPrimary ? 'bg-primary text-primary-foreground' : 'bg-muted'
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
};
