/**
 * AgentProfile - Profil Agent
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
  type JulabaNavItem,
} from '@/shared/ui/julaba';
import { useAgentProfile, AgentProfileHeader, AgentProfileEditForm } from '@/features/agent';

// Nav items Agent
const AGENT_NAV_ITEMS: JulabaNavItem[] = [
  { emoji: '🏠', label: 'Accueil', path: '/agent' },
  { emoji: '✍️', label: 'Inscrire', path: '/agent/enrolement' },
  { emoji: '👥', label: 'Marchands', path: '/agent/marchands' },
  { emoji: '👤', label: 'Profil', path: '/agent/profil' },
];

const AgentProfile: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const {
    profile,
    isLoading,
    isEditing,
    isSaving,
    toggleEditing,
    saveProfile,
  } = useAgentProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/agent/login');
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

  return (
    <JulabaPageLayout background="gradient">
      <JulabaHeader
        title="Mon Profil"
        subtitle="Agent terrain"
        showBack
        backPath="/agent"
      />

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Profil Header / Edit Form */}
        <JulabaCard className="p-4">
          {isEditing ? (
            <AgentProfileEditForm
              profile={profile}
              onSave={saveProfile}
              onCancel={toggleEditing}
              isSaving={isSaving}
            />
          ) : (
            <AgentProfileHeader
              profile={profile}
              onEditClick={toggleEditing}
            />
          )}
        </JulabaCard>

        {/* Notifications */}
        <JulabaCard accent="blue" className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔔</span>
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <NotificationToggle className="w-full" />
        </JulabaCard>

        {/* Actions */}
        <div className="space-y-3">
          <JulabaButton
            variant="secondary"
            emoji="📊"
            onClick={() => navigate('/agent')}
            className="w-full"
          >
            Retour au tableau de bord
          </JulabaButton>

          <JulabaButton
            variant="danger"
            emoji="🚪"
            onClick={handleSignOut}
            className="w-full"
          >
            Déconnexion
          </JulabaButton>
        </div>
      </div>

      <JulabaBottomNav items={AGENT_NAV_ITEMS} />
    </JulabaPageLayout>
  );
};

export default AgentProfile;
