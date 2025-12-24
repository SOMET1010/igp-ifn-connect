import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Edit2 } from 'lucide-react';
import type { CooperativeProfileData } from '../../types/profile.types';

interface CooperativeProfileHeaderProps {
  cooperative: CooperativeProfileData;
  onEditClick: () => void;
}

export const CooperativeProfileHeader: React.FC<CooperativeProfileHeaderProps> = ({
  cooperative,
  onEditClick,
}) => {
  return (
    <Card>
      <CardContent className="p-6 text-center relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEditClick}
          className="absolute top-4 right-4"
        >
          <Edit2 className="h-5 w-5" />
        </Button>

        <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
          <span className="text-4xl">🌾</span>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">
          {cooperative.name}
        </h2>

        {cooperative.igp_certified && (
          <Badge className="bg-primary/20 text-primary mb-2">
            <Award className="w-4 h-4 mr-1" />
            Certifié IGP
          </Badge>
        )}

        <p className="text-muted-foreground">
          {cooperative.commune}, {cooperative.region}
        </p>
      </CardContent>
    </Card>
  );
};
