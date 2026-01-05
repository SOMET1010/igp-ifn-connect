/**
 * Carte d'un producteur
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, Phone, MapPin, Award, Leaf } from 'lucide-react';
import type { Producer } from '@/features/producer/types/producer.types';

interface ProducerCardProps {
  producer: Producer;
  onToggleStatus?: (producerId: string, isActive: boolean) => void;
  isToggling?: boolean;
}

export const ProducerCard: React.FC<ProducerCardProps> = ({ 
  producer, 
  onToggleStatus,
  isToggling 
}) => {
  return (
    <Card className={`border shadow-sm transition-all ${!producer.is_active ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-full ${producer.is_active ? 'bg-green-100' : 'bg-muted'}`}>
              <User className={`h-5 w-5 ${producer.is_active ? 'text-green-600' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">{producer.full_name}</h3>
                {producer.igp_certified && (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                    <Award className="h-3 w-3 mr-1" />
                    IGP
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Phone className="h-3 w-3" />
                {producer.phone}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {producer.commune}, {producer.region}
              </p>
              {producer.specialties && producer.specialties.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {producer.specialties.slice(0, 3).map((s, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      <Leaf className="h-3 w-3 mr-1" />
                      {s}
                    </Badge>
                  ))}
                  {producer.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{producer.specialties.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          {onToggleStatus && (
            <div className="flex flex-col items-end gap-1">
              <Switch
                checked={producer.is_active}
                onCheckedChange={(checked) => onToggleStatus(producer.id, checked)}
                disabled={isToggling}
              />
              <span className="text-xs text-muted-foreground">
                {producer.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
