/**
 * CooperativeProducers - Producteurs Coopérative
 * Refonte Jùlaba Design System
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '@/shared/contexts';
import { Loader2 } from 'lucide-react';
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaStatCard,
  JulabaBottomNav,
  JulabaEmptyState,
  type JulabaNavItem,
} from '@/shared/ui/julaba';
import { useCooperativeDashboard } from '@/features/cooperative';
import { useCooperativeProducers } from '@/features/cooperative/hooks/useCooperativeProducers';
import { 
  ProducerStatsCards, 
  ProducersList, 
  AddProducerDialog 
} from '@/features/cooperative/components/producers';

// Nav items Coopérative
const COOP_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🏠', label: 'Accueil', path: '/cooperative' },
  { emoji: '📦', label: 'Stock', path: '/cooperative/stock' },
  { emoji: '📋', label: 'Commandes', path: '/cooperative/commandes' },
  { emoji: '👤', label: 'Profil', path: '/cooperative/profil' },
];

const CooperativeProducers: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const { cooperative, isLoading: isLoadingCoop, error: errorCoop } = useCooperativeDashboard();

  const {
    producers,
    stats,
    isLoading,
    error,
    refetch,
    addProducer,
    isAdding,
    toggleStatus,
    isToggling,
  } = useCooperativeProducers(cooperative?.id);

  const handleSignOut = async () => {
    await signOut();
    navigate('/cooperative/login');
  };

  if (isLoadingCoop || isLoading) {
    return (
      <JulabaPageLayout background="gradient">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </JulabaPageLayout>
    );
  }

  if (errorCoop || error) {
    return (
      <JulabaPageLayout background="gradient">
        <JulabaHeader 
          title="Producteurs" 
          subtitle={cooperative?.name}
          showBack
          backPath="/cooperative"
        />
        <div className="p-4">
          <JulabaEmptyState
            emoji="😕"
            title="Erreur de chargement"
            description={error?.message || errorCoop?.message || "Erreur inconnue"}
          />
        </div>
        <JulabaBottomNav items={COOP_NAV_ITEMS} />
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="gradient">
      <JulabaHeader 
        title="Producteurs" 
        subtitle={`${stats.total} cultivateur(s)`}
        showBack
        backPath="/cooperative"
        rightAction={{
          emoji: '🌾',
          onClick: () => {},
          label: `${stats.total} producteurs`
        }}
      />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-2">
          <JulabaStatCard
            label="Total"
            value={stats.total}
            emoji="🌾"
            iconBg="green"
          />
          <JulabaStatCard
            label="Actifs"
            value={stats.active}
            emoji="✅"
            iconBg="blue"
          />
          <JulabaStatCard
            label="Certifiés"
            value={stats.certified}
            emoji="🏆"
            iconBg="gold"
          />
        </div>

        {/* Action d'ajout */}
        <JulabaCard className="p-4">
          <div className="flex justify-end">
            <AddProducerDialog onAdd={addProducer} isAdding={isAdding} />
          </div>
        </JulabaCard>

        {/* Liste des producteurs */}
        <ProducersList 
          producers={producers} 
          onToggleStatus={(id, active) => toggleStatus({ producerId: id, isActive: active })}
          isToggling={isToggling}
        />
      </div>

      <JulabaBottomNav items={COOP_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default CooperativeProducers;
