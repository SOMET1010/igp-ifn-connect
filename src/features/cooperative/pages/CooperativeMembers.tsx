/**
 * CooperativeMembers - Membres Coopérative
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
import { useCooperativeMembers } from '@/features/cooperative/hooks/useCooperativeMembers';
import { 
  MemberStatsCards, 
  MembersList, 
  AddMemberDialog,
  ExportMembersPDF,
} from '@/features/cooperative/components/members';

// Nav items Coopérative
const COOP_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🏠', label: 'Accueil', path: '/cooperative' },
  { emoji: '📦', label: 'Stock', path: '/cooperative/stock' },
  { emoji: '📋', label: 'Commandes', path: '/cooperative/commandes' },
  { emoji: '👤', label: 'Profil', path: '/cooperative/profil' },
];

const CooperativeMembers: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const { cooperative, isLoading: isLoadingCoop, error: errorCoop } = useCooperativeDashboard();

  const {
    members,
    stats,
    isLoading,
    error,
    refetch,
    addMember,
    isAdding,
    updateMember,
    isUpdating,
    deleteMember,
    isDeleting,
  } = useCooperativeMembers(cooperative?.id, cooperative?.name);

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
          title="Membres" 
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
        title="Membres" 
        subtitle={`${stats.total} membre(s)`}
        showBack
        backPath="/cooperative"
        rightAction={{
          emoji: '👥',
          onClick: () => {},
          label: `${stats.total} membres`
        }}
      />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Statistiques */}
        <JulabaStatCard
          label="Total membres"
          value={stats.total}
          emoji="👥"
          iconBg="blue"
        />

        {/* Actions */}
        <JulabaCard className="p-4">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <ExportMembersPDF 
              members={members} 
              stats={stats} 
              cooperativeName={cooperative?.name || ''} 
            />
            <AddMemberDialog onAdd={addMember} isAdding={isAdding} />
          </div>
        </JulabaCard>

        {/* Liste des membres */}
        <MembersList 
          members={members} 
          onUpdate={updateMember}
          onDelete={deleteMember}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </div>

      <JulabaBottomNav items={COOP_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default CooperativeMembers;
