import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const PublicMapLegend: React.FC = () => {
  return (
    <Card className="absolute bottom-4 left-4 z-[1000]">
      <CardContent className="p-3 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Légende</p>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Marchés</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span>Coopératives</span>
        </div>
      </CardContent>
    </Card>
  );
};
