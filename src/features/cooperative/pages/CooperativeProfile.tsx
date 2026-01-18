/**
 * CooperativeProfile - Profil Coopérative
 * Refonte Jùlaba Design System
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts';
import { NotificationToggle } from '@/shared/ui';
import { Loader2 } from 'lucide-react';
import {
  JulabaPageLayout,
  JulabaHeader,
  JulabaCard,
  JulabaButton,
  JulabaBottomNav,
  JulabaEmptyState,
  type JulabaNavItem,
} from '@/shared/ui/julaba';
import {
  useCooperativeProfile,
  CooperativeProfileHeader,
  CooperativeProfileView,
  CooperativeProfileEditForm,
} from '@/features/cooperative';

// Nav items Coopérative
const COOP_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🏠', label: 'Accueil', path: '/cooperative' },
  { emoji: '📦', label: 'Stock', path: '/cooperative/stock' },
  { emoji: '📋', label: 'Commandes', path: '/cooperative/commandes' },
  { emoji: '👤', label: 'Profil', path: '/cooperative/profil' },
];

const CooperativeProfile: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const {
    cooperative,
    isLoading,
    isEditing,
    isSaving,
    formData,
    toggleEditing,
    updateField,
    handleGPSCapture,
    saveProfile,
  } = useCooperativeProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/cooperative/login');
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

  if (!cooperative) {
    return (
      <JulabaPageLayout background="gradient">
        <JulabaHeader
          title="Profil"
          subtitle="Coopérative"
          showBack
          backPath="/cooperative"
        />
        <div className="p-4">
          <JulabaEmptyState
            emoji="🤷"
            title="Profil introuvable"
            description="Aucun profil coopérative trouvé"
          />
        </div>
        <JulabaBottomNav items={COOP_NAV_ITEMS} />
      </JulabaPageLayout>
    );
  }

  return (
    <JulabaPageLayout background="gradient">
      <JulabaHeader
        title="Profil Coopérative"
        subtitle={cooperative.name}
        showBack
        backPath="/cooperative"
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Profile header with edit button */}
        {!isEditing && (
          <JulabaCard className="p-4">
            <CooperativeProfileHeader
              cooperative={cooperative}
              onEditClick={toggleEditing}
            />
          </JulabaCard>
        )}

        {/* Edit form or view mode */}
        {isEditing ? (
          <JulabaCard className="p-4">
            <CooperativeProfileEditForm
              formData={formData}
              isSaving={isSaving}
              onUpdateField={updateField}
              onGPSCapture={handleGPSCapture}
              onSave={saveProfile}
              onCancel={toggleEditing}
            />
          </JulabaCard>
        ) : (
          <JulabaCard className="p-4">
            <CooperativeProfileView cooperative={cooperative} />
          </JulabaCard>
        )}

        {/* Notifications */}
        <JulabaCard accent="blue" className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔔</span>
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <NotificationToggle className="w-full" />
        </JulabaCard>

        {/* Logout button */}
        <JulabaButton
          variant="danger"
          emoji="🚪"
          onClick={handleSignOut}
          className="w-full"
        >
          Se déconnecter
        </JulabaButton>

        <p className="text-center text-xs text-muted-foreground pt-4">
          Plateforme IFN - © 2024
        </p>
      </div>

      <JulabaBottomNav items={COOP_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default CooperativeProfile;
