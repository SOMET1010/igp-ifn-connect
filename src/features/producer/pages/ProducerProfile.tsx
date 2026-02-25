/**
 * Page Profil du Producteur - JÙLABA
 * Refonte Jùlaba Design System
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
  JulabaStatCard,
  JulabaListItem,
  JulabaBottomNav,
  JulabaEmptyState,
  type JulabaNavItem,
} from '@/shared/ui/julaba';
import { useProducerData, ProducerStats } from '@/features/producer';

// Nav items Producteur
const PRODUCER_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🌾', label: 'Accueil', path: '/producteur' },
  { emoji: '📦', label: 'Récoltes', path: '/producteur/recoltes' },
  { emoji: '🛒', label: 'Commandes', path: '/producteur/commandes' },
  { emoji: '👤', label: 'Profil', path: '/producteur/profil' },
];

const ProducerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { producer, stats, isLoading, isStatsLoading } = useProducerData();

  const handleSignOut = async () => {
    await signOut();
    navigate('/producteur/login');
  };

  if (isLoading) {
    return (
      <JulabaPageLayout background="gradient">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </JulabaPageLayout>
    );
  }

  if (!producer) {
    return (
      <JulabaPageLayout background="gradient">
        <JulabaHeader
          title="Mon Profil"
          subtitle="Producteur"
          showBack
          backPath="/producteur"
        />
        <div className="p-4">
          <JulabaEmptyState
            emoji="🤷"
            title="Profil introuvable"
            description="Aucun profil producteur trouvé"
          />
        </div>
        <JulabaBottomNav items={PRODUCER_NAV_ITEMS} />
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="gradient">
      {/* Header avec gradient */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-6 text-white rounded-b-3xl mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{producer.full_name}</h1>
            <p className="text-emerald-100 text-sm">{producer.region}, {producer.commune}</p>
            <div className="flex gap-2 mt-2">
              {producer.igp_certified && (
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  🏆 IGP Certifié
                </Badge>
              )}
              {producer.is_active && (
                <Badge className="bg-emerald-500 text-white border-0 text-xs">
                  ✅ Actif
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            📊 Statistiques
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <JulabaStatCard
              label="Récoltes"
              value={stats.totalHarvests}
              emoji="🌿"
              iconBg="green"
            />
            <JulabaStatCard
              label="Commandes"
              value={stats.totalOrders}
              emoji="📋"
              iconBg="orange"
            />
          </div>
        </section>

        {/* Informations */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground px-1">
            📋 Informations
          </h2>
          <JulabaCard className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-xs text-muted-foreground">Téléphone</p>
                <p className="font-medium">{producer.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-xs text-muted-foreground">Localisation</p>
                <p className="font-medium">{producer.commune}, {producer.region}</p>
              </div>
            </div>

            {producer.cooperative && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-xs text-muted-foreground">Coopérative</p>
                  <p className="font-medium">{producer.cooperative.name}</p>
                  <p className="text-xs text-muted-foreground">{producer.cooperative.code}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-xs text-muted-foreground">Membre depuis</p>
                <p className="font-medium">
                  {format(new Date(producer.created_at), 'MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>
          </JulabaCard>
        </section>

        {/* Spécialités */}
        {producer.specialties && producer.specialties.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground px-1">
              🌱 Spécialités
            </h2>
            <JulabaCard className="p-4">
              <div className="flex flex-wrap gap-2">
                {producer.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </JulabaCard>
          </section>
        )}

        {/* Déconnexion */}
        <JulabaButton
          variant="danger"
          emoji="🚪"
          onClick={handleSignOut}
          className="w-full"
        >
          Se déconnecter
        </JulabaButton>
      </div>

      <JulabaBottomNav items={PRODUCER_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default ProducerProfile;
