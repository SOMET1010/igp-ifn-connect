import React from "react";
import { User, Pencil, Phone, Store, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { MerchantProfileData } from "../../types/profile.types";

interface ProfileHeaderProps {
  profile: MerchantProfileData | null;
  onEditClick: () => void;
}

export function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
  if (!profile) return null;

  const statusLabel = profile.status === "validated" ? "Validé" : "En attente";
  const statusVariant = profile.status === "validated" ? "default" : "secondary";

  return (
    <div className="space-y-4">
      {/* Avatar et nom */}
      <div className="text-center py-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{profile.full_name}</h2>
        <p className="text-sm text-muted-foreground mt-1">{profile.activity_type}</p>
        <Badge variant={statusVariant} className="mt-2">
          {statusLabel}
        </Badge>
      </div>

      {/* Informations détaillées */}
      <div className="space-y-3 bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground">{profile.phone}</span>
        </div>
        
        {profile.activity_description && (
          <div className="flex items-start gap-3">
            <Store className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">{profile.activity_description}</span>
          </div>
        )}

        {profile.market_name && (
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground">Marché: {profile.market_name}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground">
            Inscrit le {format(new Date(profile.enrolled_at), "d MMMM yyyy", { locale: fr })}
          </span>
        </div>
      </div>

      {/* Identifiants (lecture seule) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">N° CMU</p>
          <p className="font-mono text-sm font-medium text-foreground">{profile.cmu_number}</p>
        </div>
        {profile.ncc && (
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">NCC</p>
            <p className="font-mono text-sm font-medium text-foreground">{profile.ncc}</p>
          </div>
        )}
      </div>

      {/* Bouton modifier */}
      <Button
        onClick={onEditClick}
        variant="outline"
        className="w-full"
      >
        <Pencil className="w-4 h-4 mr-2" />
        Modifier mes informations
      </Button>
    </div>
  );
}
