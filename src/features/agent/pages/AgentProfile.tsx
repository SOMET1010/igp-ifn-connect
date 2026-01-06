import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Loader2 } from 'lucide-react';
import { NotificationToggle, EnhancedHeader, UnifiedBottomNav } from '@/shared/ui';
import { agentNavItems } from '@/config/navigation';
import { useAgentProfile, AgentProfileHeader, AgentProfileEditForm } from '@/features/agent';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader
        title="Mon Profil"
        showBack
        backTo="/agent"
      />

      <div className="p-4 space-y-6 max-w-lg mx-auto">
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

        {/* Notifications */}
        <Card className="card-institutional">
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground mb-3">Notifications</h3>
            <NotificationToggle className="w-full" />
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      <UnifiedBottomNav items={agentNavItems} />
    </div>
  );
};

export default AgentProfile;