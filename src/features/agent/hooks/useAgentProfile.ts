import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { agentProfileService } from '../services/profileService';
import type { AgentProfileData, AgentProfileEditInput } from '../types/profile.types';
import { useToast } from '@/shared/hooks';
import { agentLogger } from '@/infra/logger';

export function useAgentProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<AgentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await agentProfileService.fetchProfile(user.id);
      setProfile(data);
    } catch (error) {
      agentLogger.error('Error loading profile', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async (data: AgentProfileEditInput): Promise<boolean> => {
    if (!user) return false;

    setIsSaving(true);
    try {
      const result = await agentProfileService.updateProfile(user.id, data);
      
      if (result.success) {
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès",
        });
        await loadProfile();
        setIsEditing(false);
        return true;
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de mettre à jour le profil",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      agentLogger.error('Error saving profile', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditing = () => setIsEditing(!isEditing);

  return {
    profile,
    isLoading,
    isEditing,
    isSaving,
    toggleEditing,
    saveProfile,
    refresh: loadProfile,
  };
}
