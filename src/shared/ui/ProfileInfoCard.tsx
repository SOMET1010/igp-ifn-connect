import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileInfoCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <Card className="card-institutional">
      <CardContent className="p-4 flex items-center gap-4">
        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className="font-medium text-foreground truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};
