import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "../services/profileService";
import { toast } from "@/shared/hooks";
import type { MerchantProfileData, ProfileEditInput } from "../types/profile.types";

export function useMerchantProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MerchantProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await profileService.fetchMerchantProfile(user.id);
      setProfile(data);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async (data: ProfileEditInput): Promise<boolean> => {
    if (!user) return false;

    setIsSaving(true);
    try {
      const result = await profileService.updateMerchantProfile(user.id, data);
      
      if (result.success) {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été enregistrées.",
        });
        await loadProfile();
        setIsEditing(false);
        return true;
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de mettre à jour le profil.",
          variant: "destructive",
        });
        return false;
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditing = () => setIsEditing((prev) => !prev);

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
