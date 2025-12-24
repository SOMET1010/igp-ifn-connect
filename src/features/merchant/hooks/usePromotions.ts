import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { promotionsService } from "../services/promotionsService";
import type { Promotion, PromotionFilter, NewPromotionInput } from "../types/promotions.types";
import { isPromotionExpired } from "../types/promotions.types";

interface UsePromotionsResult {
  promotions: Promotion[];
  filteredPromotions: Promotion[];
  isLoading: boolean;
  merchantId: string | null;
  filter: PromotionFilter;
  activeCount: number;
  totalUsage: number;
  setFilter: (filter: PromotionFilter) => void;
  createPromotion: (input: NewPromotionInput) => Promise<boolean>;
  togglePromotion: (id: string, currentState: boolean) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePromotions(): UsePromotionsResult {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [filter, setFilter] = useState<PromotionFilter>("all");

  const fetchPromotions = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const mId = await promotionsService.getMerchantId(user.id);
      if (mId) {
        setMerchantId(mId);
        const data = await promotionsService.fetchPromotions(mId);
        setPromotions(data);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les promotions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promo) => {
      switch (filter) {
        case "active":
          return promo.is_active && !isPromotionExpired(promo.end_date);
        case "expired":
          return isPromotionExpired(promo.end_date);
        default:
          return true;
      }
    });
  }, [promotions, filter]);

  const activeCount = useMemo(
    () => promotions.filter((p) => p.is_active && !isPromotionExpired(p.end_date)).length,
    [promotions]
  );

  const totalUsage = useMemo(
    () => promotions.reduce((sum, p) => sum + p.usage_count, 0),
    [promotions]
  );

  const createPromotion = useCallback(
    async (input: NewPromotionInput): Promise<boolean> => {
      if (!merchantId) {
        toast({
          title: "Erreur",
          description: "Marchand non identifié",
          variant: "destructive",
        });
        return false;
      }

      try {
        await promotionsService.createPromotion(merchantId, input);
        toast({
          title: "Succès",
          description: "Promotion créée avec succès",
        });
        await fetchPromotions();
        return true;
      } catch (error) {
        console.error("Error creating promotion:", error);
        toast({
          title: "Erreur",
          description: "Impossible de créer la promotion",
          variant: "destructive",
        });
        return false;
      }
    },
    [merchantId, toast, fetchPromotions]
  );

  const togglePromotion = useCallback(
    async (id: string, currentState: boolean): Promise<void> => {
      try {
        await promotionsService.togglePromotion(id, currentState);
        toast({
          title: currentState ? "Promotion désactivée" : "Promotion activée",
        });
        await fetchPromotions();
      } catch (error) {
        console.error("Error toggling promotion:", error);
        toast({
          title: "Erreur",
          description: "Impossible de modifier la promotion",
          variant: "destructive",
        });
      }
    },
    [toast, fetchPromotions]
  );

  const deletePromotion = useCallback(
    async (id: string): Promise<void> => {
      try {
        await promotionsService.deletePromotion(id);
        toast({
          title: "Promotion supprimée",
        });
        await fetchPromotions();
      } catch (error) {
        console.error("Error deleting promotion:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la promotion",
          variant: "destructive",
        });
      }
    },
    [toast, fetchPromotions]
  );

  return {
    promotions,
    filteredPromotions,
    isLoading,
    merchantId,
    filter,
    activeCount,
    totalUsage,
    setFilter,
    createPromotion,
    togglePromotion,
    deletePromotion,
    refresh: fetchPromotions,
  };
}
