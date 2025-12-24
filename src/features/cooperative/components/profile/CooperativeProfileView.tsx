import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Users, Hash, Award } from 'lucide-react';
import { MiniMap } from '@/components/agent/MiniMap';
import type { CooperativeProfileData } from '../../types/profile.types';

interface CooperativeProfileViewProps {
  cooperative: CooperativeProfileData;
}

export const CooperativeProfileView: React.FC<CooperativeProfileViewProps> = ({
  cooperative,
}) => {
  return (
    <>
      {/* Details Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <span>📋</span> Informations
          </h3>
          
          <div className="space-y-3">
            <InfoRow
              icon={<Hash className="h-5 w-5 text-muted-foreground" />}
              label="Code coopérative"
              value={cooperative.code}
            />

            <InfoRow
              icon={<MapPin className="h-5 w-5 text-muted-foreground" />}
              label="Localisation"
              value={cooperative.address || `${cooperative.commune}, ${cooperative.region}`}
            />

            <InfoRow
              icon={<Users className="h-5 w-5 text-muted-foreground" />}
              label="Nombre de membres"
              value={`${cooperative.total_members} membres`}
            />

            {cooperative.phone && (
              <InfoRow
                icon={<Phone className="h-5 w-5 text-muted-foreground" />}
                label="Téléphone"
                value={`+225 ${cooperative.phone}`}
              />
            )}

            {cooperative.email && (
              <InfoRow
                icon={<Mail className="h-5 w-5 text-muted-foreground" />}
                label="Email"
                value={cooperative.email}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* GPS Map */}
      {cooperative.latitude && cooperative.longitude && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Position GPS
            </h3>
            <div className="h-40 rounded-xl overflow-hidden">
              <MiniMap
                latitude={cooperative.latitude}
                longitude={cooperative.longitude}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {cooperative.latitude.toFixed(6)}, {cooperative.longitude.toFixed(6)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* IGP Status */}
      <Card className={cooperative.igp_certified ? 'border-2 border-primary/50' : ''}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              cooperative.igp_certified ? 'bg-primary/10' : 'bg-muted'
            }`}>
              <Award className={`h-6 w-6 ${
                cooperative.igp_certified ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Certification IGP
              </h3>
              <p className="text-sm text-muted-foreground">
                {cooperative.igp_certified 
                  ? 'Votre coopérative est certifiée IGP' 
                  : 'Non certifié - Contactez la DGE pour la certification'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Helper component for info rows
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
    {icon}
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  </div>
);
