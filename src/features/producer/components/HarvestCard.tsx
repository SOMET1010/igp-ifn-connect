/**
 * Carte affichant une récolte du producteur
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Package, Calendar, Edit2, Trash2 } from 'lucide-react';
import type { ProducerHarvest, HarvestStatus, QualityGrade } from '../types/producer.types';

interface HarvestCardProps {
  harvest: ProducerHarvest;
  onEdit?: (harvest: ProducerHarvest) => void;
  onDelete?: (harvestId: string) => void;
}

const STATUS_CONFIG: Record<HarvestStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  available: { label: 'Disponible', variant: 'default' },
  reserved: { label: 'Réservé', variant: 'secondary' },
  sold: { label: 'Vendu', variant: 'outline' },
  expired: { label: 'Expiré', variant: 'destructive' },
};

const GRADE_CONFIG: Record<QualityGrade, { label: string; color: string }> = {
  A: { label: 'Grade A', color: 'bg-emerald-100 text-emerald-700' },
  B: { label: 'Grade B', color: 'bg-amber-100 text-amber-700' },
  C: { label: 'Grade C', color: 'bg-gray-100 text-gray-700' },
};

export const HarvestCard: React.FC<HarvestCardProps> = ({ 
  harvest, 
  onEdit, 
  onDelete 
}) => {
  const statusConfig = STATUS_CONFIG[harvest.status];
  const gradeConfig = harvest.quality_grade ? GRADE_CONFIG[harvest.quality_grade] : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {harvest.product?.image_url ? (
              <img 
                src={harvest.product.image_url} 
                alt={harvest.product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{harvest.product?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(harvest.unit_price)} FCFA/{harvest.product?.unit}
              </p>
            </div>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Disponible</p>
            <p className="font-semibold">
              {harvest.available_quantity} / {harvest.quantity} {harvest.product?.unit}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Valeur totale</p>
            <p className="font-semibold">
              {formatCurrency(harvest.available_quantity * harvest.unit_price)} FCFA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4" />
          <span>Récolté le {format(new Date(harvest.harvest_date), 'dd MMM yyyy', { locale: fr })}</span>
        </div>

        {gradeConfig && (
          <span className={`inline-block text-xs px-2 py-1 rounded-full ${gradeConfig.color}`}>
            {gradeConfig.label}
          </span>
        )}

        {harvest.notes && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {harvest.notes}
          </p>
        )}

        {harvest.status === 'available' && (onEdit || onDelete) && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onEdit(harvest)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(harvest.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
