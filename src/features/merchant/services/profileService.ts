import { supabase } from "@/integrations/supabase/client";
import type { MerchantProfileData, ProfileEditInput } from "../types/profile.types";

export const profileService = {
  async fetchMerchantProfile(userId: string): Promise<MerchantProfileData | null> {
    const { data, error } = await supabase
      .from("merchants")
      .select(`
        id,
        full_name,
        phone,
        activity_type,
        activity_description,
        cmu_number,
        ncc,
        enrolled_at,
        status,
        markets(name)
      `)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error("Erreur chargement profil:", error?.message);
      return null;
    }

    return {
      id: data.id,
      full_name: data.full_name,
      phone: data.phone,
      activity_type: data.activity_type,
      activity_description: data.activity_description,
      cmu_number: data.cmu_number,
      ncc: data.ncc,
      enrolled_at: data.enrolled_at,
      status: data.status,
      market_name: (data.markets as { name: string } | null)?.name,
    };
  },

  async updateMerchantProfile(
    userId: string,
    data: ProfileEditInput
  ): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
      .from("merchants")
      .update({
        full_name: data.full_name as string,
        phone: data.phone as string,
        activity_type: data.activity_type as string,
        activity_description: data.activity_description as string | null,
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Erreur mise à jour profil:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  },
};
