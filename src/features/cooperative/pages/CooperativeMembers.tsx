/**
 * Page de gestion des membres de la coopérative
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { EnhancedHeader, UnifiedBottomNav, LoadingState, ErrorState } from '@/shared/ui';
import { 
  Home, 
  Package, 
  ClipboardList, 
  User,
  Users,
} from 'lucide-react';
import { useCooperativeDashboard } from '@/features/cooperative';
import { useCooperativeMembers } from '@/features/cooperative/hooks/useCooperativeMembers';
import { 
  MemberStatsCards, 
  MembersList, 
  AddMemberDialog,
  ExportMembersPDF,
} from '@/features/cooperative/components/members';

const CooperativeMembers: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t("home"), path: '/cooperative' },
    { icon: Package, label: t("stock"), path: '/cooperative/stock' },
    { icon: ClipboardList, label: t("orders"), path: '/cooperative/commandes' },
    { icon: User, label: t("profile"), path: '/cooperative/profil' },
  ];

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
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader title="Membres" subtitle={cooperative?.name} showSignOut onSignOut={handleSignOut} />
        <LoadingState message="Chargement des membres..." />
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  if (errorCoop || error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <EnhancedHeader title="Membres" subtitle="Coopérative" showSignOut onSignOut={handleSignOut} />
        <div className="p-4">
          <ErrorState 
            message={error?.message || errorCoop?.message || "Erreur de chargement"} 
            onRetry={refetch} 
          />
        </div>
        <UnifiedBottomNav items={navItems} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader 
        title="Membres" 
        subtitle={cooperative?.name}
        showSignOut 
        onSignOut={handleSignOut}
        rightContent={
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {stats.total}
          </div>
        }
      />

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Statistiques */}
        <MemberStatsCards stats={stats} />

        {/* Actions */}
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <ExportMembersPDF 
            members={members} 
            stats={stats} 
            cooperativeName={cooperative?.name || ''} 
          />
          <AddMemberDialog onAdd={addMember} isAdding={isAdding} />
        </div>

        {/* Liste des membres */}
        <MembersList 
          members={members} 
          onUpdate={updateMember}
          onDelete={deleteMember}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      </div>

      <UnifiedBottomNav items={navItems} />
    </div>
  );
};

export default CooperativeMembers;
