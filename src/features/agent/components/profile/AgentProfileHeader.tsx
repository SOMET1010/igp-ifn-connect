import React from 'react';
import { User, Phone, Briefcase, MapPin, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfileInfoCard } from '@/components/shared/ProfileInfoCard';
import { StatCard } from '@/components/shared/StatCard';
import type { AgentProfileData } from '../../types/profile.types';

interface AgentProfileHeaderProps {
  profile: AgentProfileData | null;
  onEditClick: () => void;
}

export const AgentProfileHeader: React.FC<AgentProfileHeaderProps> = ({
  profile,
  onEditClick,
}) => {
  if (!profile) return null;

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Avatar & Name */}
      <div className="flex flex-col items-center text-center pt-4">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-3">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">{initials}</span>
          )}
        </div>
        <h2 className="text-xl font-bold text-foreground">{profile.full_name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">Agent</span>
          <Badge variant={profile.is_active ? "default" : "secondary"}>
            {profile.is_active ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </div>

      {/* Edit Button */}
      <Button
        onClick={onEditClick}
        variant="outline"
        className="w-full"
      >
        <Edit2 className="h-4 w-4 mr-2" />
        Modifier mon profil
      </Button>

      {/* Info Cards */}
      <div className="space-y-3">
        <ProfileInfoCard
          icon={Phone}
          label="Téléphone"
          value={profile.phone ?? 'Non renseigné'}
        />
        <ProfileInfoCard
          icon={Briefcase}
          label="Matricule"
          value={profile.employee_id}
        />
        <ProfileInfoCard
          icon={MapPin}
          label="Zone d'affectation"
          value={profile.zone ?? 'Non assignée'}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Enrôlements"
          value={profile.total_enrollments}
        />
        <StatCard
          title="Organisation"
          value={profile.organization}
        />
      </div>
    </div>
  );
};
