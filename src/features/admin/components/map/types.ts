/**
 * Types pour la cartographie admin
 */

export interface MapEntity {
  id: string;
  type: 'merchant' | 'cooperative' | 'market';
  name: string;
  lat: number;
  lng: number;
  details?: string;
}

export interface MapFilters {
  merchants: boolean;
  cooperatives: boolean;
  markets: boolean;
}

export const TYPE_LABELS: Record<MapEntity['type'], string> = {
  merchant: 'Marchand',
  cooperative: 'Coopérative',
  market: 'Marché',
};
