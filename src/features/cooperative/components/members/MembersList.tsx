/**
 * Liste des membres avec recherche
 */

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';
import { MemberCard } from './MemberCard';
import type { CooperativeMember, AddMemberFormData } from '../../types/member.types';

interface MembersListProps {
  members: CooperativeMember[];
  onUpdate?: (data: { memberId: string; updates: Partial<AddMemberFormData> }) => void;
  onDelete?: (memberId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export const MembersList: React.FC<MembersListProps> = ({ 
  members, 
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  const [search, setSearch] = useState('');

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const searchLower = search.toLowerCase();
    return members.filter(m => 
      m.full_name.toLowerCase().includes(searchLower) ||
      m.phone?.includes(search)
    );
  }, [members, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? 'Aucun membre trouvé' : 'Aucun membre enregistré'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''}
            {search && ` sur ${members.length}`}
          </p>
          {filteredMembers.map((member) => (
            <MemberCard 
              key={member.id} 
              member={member} 
              onUpdate={onUpdate}
              onDelete={onDelete}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  );
};
