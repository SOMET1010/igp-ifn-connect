/**
 * Liste des producteurs avec recherche
 */

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { ProducerCard } from './ProducerCard';
import type { Producer } from '@/features/producer/types/producer.types';

interface ProducersListProps {
  producers: Producer[];
  onToggleStatus?: (producerId: string, isActive: boolean) => void;
  isToggling?: boolean;
}

export const ProducersList: React.FC<ProducersListProps> = ({ 
  producers, 
  onToggleStatus,
  isToggling 
}) => {
  const [search, setSearch] = useState('');

  const filteredProducers = useMemo(() => {
    if (!search.trim()) return producers;
    const searchLower = search.toLowerCase();
    return producers.filter(p => 
      p.full_name.toLowerCase().includes(searchLower) ||
      p.phone.includes(search) ||
      p.commune.toLowerCase().includes(searchLower)
    );
  }, [producers, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un producteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredProducers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? 'Aucun producteur trouvé' : 'Aucun producteur enregistré'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredProducers.length} producteur{filteredProducers.length > 1 ? 's' : ''}
            {search && ` sur ${producers.length}`}
          </p>
          {filteredProducers.map((producer) => (
            <ProducerCard 
              key={producer.id} 
              producer={producer} 
              onToggleStatus={onToggleStatus}
              isToggling={isToggling}
            />
          ))}
        </div>
      )}
    </div>
  );
};
