import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { dailySessionService } from "../services/dailySessionService";
import { transactionService } from "../services/transactionService";
import type { 
  DailySession, 
  OpenSessionInput, 
  CloseSessionInput,
  SessionStatus,
  SessionSummary
} from "../types/dailySession.types";
import { sensoryToast } from "@/lib/sensoryToast";

export function useDailySession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [merchantId, setMerchantId] = useState<string | null>(null);

  // Récupérer le merchant_id
  useEffect(() => {
    if (!user?.id) return;
    
    transactionService.getMerchantByUserId(user.id)
      .then(merchant => setMerchantId(merchant.id))
      .catch(() => setMerchantId(null));
  }, [user?.id]);

  // Query pour la session du jour
  const {
    data: todaySession,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["daily-session", merchantId],
    queryFn: () => dailySessionService.getTodaySession(merchantId!),
    enabled: !!merchantId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Déterminer le statut
  const sessionStatus: SessionStatus = !todaySession 
    ? "none" 
    : todaySession.status === "open" 
      ? "open" 
      : "closed";

  const isSessionOpen = sessionStatus === "open";
  const isSessionClosed = sessionStatus === "closed";
  const hasNoSession = sessionStatus === "none";

  // Mutation pour ouvrir une session
  const openSessionMutation = useMutation({
    mutationFn: (input: OpenSessionInput) => {
      if (!merchantId) throw new Error("Marchand non trouvé");
      return dailySessionService.openSession(merchantId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-session", merchantId] });
      sensoryToast.success("Journée ouverte – Bonne journée de ventes !");
    },
    onError: (error: Error) => {
      sensoryToast.error(error.message);
    },
  });

  // Mutation pour fermer une session
  const closeSessionMutation = useMutation({
    mutationFn: (input: CloseSessionInput) => {
      if (!merchantId || !todaySession?.id) throw new Error("Session non trouvée");
      return dailySessionService.closeSession(todaySession.id, merchantId, input);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["daily-session", merchantId] });
      const difference = data.cash_difference || 0;
      if (Math.abs(difference) < 100) {
        sensoryToast.success("Journée fermée – Caisse équilibrée !");
      } else if (difference > 0) {
        sensoryToast.success(`Journée fermée – Excédent de ${difference.toLocaleString()} FCFA`);
      } else {
        sensoryToast.warning(`Journée fermée – Déficit de ${Math.abs(difference).toLocaleString()} FCFA`);
      }
    },
    onError: (error: Error) => {
      sensoryToast.error(error.message);
    },
  });

  // Récupérer le résumé de la journée
  const getSummary = useCallback(async (): Promise<SessionSummary | null> => {
    if (!merchantId || !todaySession) return null;

    const summary = await dailySessionService.getDaySummary(
      merchantId, 
      Number(todaySession.opening_cash) || 0
    );

    return {
      ...summary,
      openingCash: Number(todaySession.opening_cash) || 0,
    };
  }, [merchantId, todaySession]);

  return {
    // État
    todaySession,
    sessionStatus,
    isSessionOpen,
    isSessionClosed,
    hasNoSession,
    isLoading,
    error,
    merchantId,

    // Actions
    openSession: openSessionMutation.mutate,
    closeSession: closeSessionMutation.mutate,
    isOpening: openSessionMutation.isPending,
    isClosing: closeSessionMutation.isPending,
    
    // Helpers
    getSummary,
    refetch,
  };
}

export type { DailySession, OpenSessionInput, CloseSessionInput, SessionSummary };
