import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface InstitutionalActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
}

export const InstitutionalActionCard: React.FC<InstitutionalActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick
}) => {
  return (
    <Card 
      className="card-institutional cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-medium text-foreground">{title}</h3>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};
