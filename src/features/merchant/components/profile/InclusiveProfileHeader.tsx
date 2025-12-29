import React from "react";
import { User, Pencil, Phone, Calendar, CreditCard, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { MerchantProfileData } from "../../types/profile.types";

interface InclusiveProfileHeaderProps {
  profile: MerchantProfileData | null;
  onEditClick: () => void;
  onAudioPlay?: (key: string) => void;
}

/**
 * Header de profil inclusif "Pictogramme-First"
 * Les pictogrammes portent le sens, le texte est secondaire
 */
export function InclusiveProfileHeader({ 
  profile, 
  onEditClick,
  onAudioPlay 
}: InclusiveProfileHeaderProps) {
  if (!profile) return null;

  const isValidated = profile.status === "validated";
  const isPending = profile.status === "pending";

  // Obtenir les initiales pour l'avatar
  const initials = profile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleInfoTap = (audioKey: string) => {
    onAudioPlay?.(audioKey);
  };

  return (
    <div className="space-y-5">
      {/* Avatar XXL + Badge Statut */}
      <div className="text-center py-4">
        {/* Avatar 100px avec initiales */}
        <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-primary/20">
          {initials ? (
            <span className="text-3xl font-bold text-primary">{initials}</span>
          ) : (
            <User className="w-12 h-12 text-primary" />
          )}
        </div>

        {/* Badge Statut TRÈS VISIBLE */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div 
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              isValidated && "status-badge-validated",
              isPending && "status-badge-pending",
              !isValidated && !isPending && "bg-destructive"
            )}
            onClick={() => handleInfoTap(isValidated ? 'profile_validated' : 'profile_pending')}
          >
            {isValidated && <span className="text-white text-xs">✓</span>}
            {isPending && <span className="text-white text-xs">⏳</span>}
            {!isValidated && !isPending && <span className="text-white text-xs">!</span>}
          </div>
          <span className={cn(
            "text-sm font-semibold",
            isValidated && "text-green-600",
            isPending && "text-amber-600",
            !isValidated && !isPending && "text-destructive"
          )}>
            {isValidated ? "Validé" : isPending ? "En attente" : "À vérifier"}
          </span>
        </div>

        {/* Nom et activité */}
        <h2 className="text-2xl font-bold text-foreground">{profile.full_name}</h2>
        <p className="text-sm text-muted-foreground mt-1">{profile.activity_type}</p>
      </div>

      {/* Grille d'infos Pictogramme-First */}
      <div className="space-y-0 rounded-xl overflow-hidden border border-border/50">
        {/* Téléphone */}
        <button
          type="button"
          onClick={() => handleInfoTap('profile_phone')}
          className="info-row-inclusive w-full text-left"
        >
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-base font-medium text-foreground">{profile.phone}</span>
        </button>

        {/* Date d'inscription */}
        <button
          type="button"
          onClick={() => handleInfoTap('profile_date')}
          className="info-row-inclusive w-full text-left"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-base text-foreground">
            Inscrit le {format(new Date(profile.enrolled_at), "d MMMM yyyy", { locale: fr })}
          </span>
        </button>

        {/* CMU */}
        <button
          type="button"
          onClick={() => handleInfoTap('profile_cmu')}
          className="info-row-inclusive w-full text-left"
        >
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">CMU</span>
            <span className="font-mono text-base font-medium text-foreground">{profile.cmu_number}</span>
          </div>
        </button>

        {/* NCC si présent */}
        {profile.ncc && (
          <button
            type="button"
            onClick={() => handleInfoTap('profile_ncc')}
            className="info-row-inclusive w-full text-left"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-lg">🆔</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">NCC</span>
              <span className="font-mono text-base font-medium text-foreground">{profile.ncc}</span>
            </div>
          </button>
        )}
      </div>

      {/* Bouton MODIFIER - Large, Orange, Icône + texte court */}
      <Button
        onClick={onEditClick}
        className="btn-modify-inclusive w-full bg-primary hover:bg-primary/90"
      >
        <Pencil className="w-5 h-5 mr-2" />
        Modifier
        <Mic className="w-4 h-4 ml-auto opacity-60" />
      </Button>
    </div>
  );
}
