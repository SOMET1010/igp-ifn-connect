import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogOut } from 'lucide-react';
import { NotificationToggle } from '@/components/shared/NotificationToggle';
import { EnhancedHeader } from '@/components/shared/EnhancedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { cooperativeNavItems } from '@/config/navigation';
import {
  useCooperativeProfile,
  CooperativeProfileHeader,
  CooperativeProfileView,
  CooperativeProfileEditForm,
} from '@/features/cooperative';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!cooperative) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Aucun profil coopérative trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <EnhancedHeader
        title="Profil Coopérative"
        subtitle="Informations et paramètres"
        showBack
        backTo="/cooperative"
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Profile header with edit button */}
        {!isEditing && (
          <CooperativeProfileHeader
            cooperative={cooperative}
            onEditClick={toggleEditing}
          />
        )}

        {/* Edit form or view mode */}
        {isEditing ? (
          <CooperativeProfileEditForm
            formData={formData}
            isSaving={isSaving}
            onUpdateField={updateField}
            onGPSCapture={handleGPSCapture}
            onSave={saveProfile}
            onCancel={toggleEditing}
          />
        ) : (
          <CooperativeProfileView cooperative={cooperative} />
        )}

        {/* Notifications */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Notifications</h3>
            <NotificationToggle className="w-full" />
          </CardContent>
        </Card>

        {/* Logout button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Se déconnecter
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-4">
          Plateforme IFN - © 2024
        </p>
      </div>

      <UnifiedBottomNav items={cooperativeNavItems} />
    </div>
  );
};

export default CooperativeProfile;