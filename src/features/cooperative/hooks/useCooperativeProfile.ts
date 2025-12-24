import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { fetchCooperativeProfile, updateCooperativeProfile } from '../services/profileService';
import { cooperativeProfileSchema } from '../types/profile.types';
import type { CooperativeProfileData, CooperativeProfileFormData } from '../types/profile.types';

export function useCooperativeProfile() {
  const { user } = useAuth();
  
  const [cooperative, setCooperative] = useState<CooperativeProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CooperativeProfileFormData>({
    address: '',
    region: '',
    commune: '',
    phone: '',
    email: '',
    latitude: null,
    longitude: null,
  });

  // Fetch profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setIsLoading(true);
      const { data, error } = await fetchCooperativeProfile(user.id);
      
      if (error) {
        toast.error(error);
      } else if (data) {
        setCooperative(data);
        setFormData({
          address: data.address || '',
          region: data.region || '',
          commune: data.commune || '',
          phone: data.phone || '',
          email: data.email || '',
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
      
      setIsLoading(false);
    };

    loadProfile();
  }, [user]);

  // Toggle edit mode
  const toggleEditing = useCallback(() => {
    if (isEditing && cooperative) {
      // Reset form on cancel
      setFormData({
        address: cooperative.address || '',
        region: cooperative.region || '',
        commune: cooperative.commune || '',
        phone: cooperative.phone || '',
        email: cooperative.email || '',
        latitude: cooperative.latitude,
        longitude: cooperative.longitude,
      });
    }
    setIsEditing((prev) => !prev);
  }, [isEditing, cooperative]);

  // Update form field
  const updateField = useCallback(<K extends keyof CooperativeProfileFormData>(
    field: K,
    value: CooperativeProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle GPS capture
  const handleGPSCapture = useCallback((coords: { latitude: number; longitude: number }) => {
    setFormData((prev) => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
  }, []);

  // Save profile
  const saveProfile = useCallback(async (): Promise<boolean> => {
    if (!cooperative) return false;

    // Validate with Zod
    const validation = cooperativeProfileSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return false;
    }

    setIsSaving(true);
    const { success, error } = await updateCooperativeProfile(cooperative.id, formData);
    setIsSaving(false);

    if (!success) {
      toast.error(error || 'Erreur lors de la sauvegarde');
      return false;
    }

    // Update local state
    setCooperative({
      ...cooperative,
      address: formData.address || null,
      region: formData.region,
      commune: formData.commune,
      phone: formData.phone || null,
      email: formData.email || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
    });

    toast.success('Informations mises à jour');
    setIsEditing(false);
    return true;
  }, [cooperative, formData]);

  return {
    cooperative,
    isLoading,
    isEditing,
    isSaving,
    formData,
    toggleEditing,
    updateField,
    handleGPSCapture,
    saveProfile,
  };
}
