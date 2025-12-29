/**
 * Hook pour la gestion des transactions marchand
 * Migré vers TanStack Query pour standardisation et cache automatique
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { transactionService } from "../services/transactionService";
import { exportSalesReportToPDF } from "@/lib/pdfExport";
import {
  type TransactionListItem,
  type GroupedTransactions,
  type ExportPeriod,
  groupTransactionsByDate,
  getDateRangeForPeriod,
  filterTransactionsByPeriod,
  calculateTransactionsSummary,
  formatTransactionForExport,
} from "../utils/transactionUtils";

export function useTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // États locaux UI
  const [visibleCount, setVisibleCount] = useState(10);
  const [exportPeriod, setExportPeriod] = useState<ExportPeriod>("week");
  const [isExporting, setIsExporting] = useState(false);

  // Query pour les données du marchand
  const { data: merchantData } = useQuery({
    queryKey: ['merchant-data', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return transactionService.getMerchantByUserId(user.id);
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  const merchantId = merchantData?.id ?? null;
  const merchantName = merchantData?.full_name ?? "";

  // Query pour les transactions
  const { 
    data: transactions = [], 
    isLoading,
  } = useQuery<TransactionListItem[]>({
    queryKey: ['merchant-transactions', merchantId],
    queryFn: () => {
      if (!merchantId) return [];
      return transactionService.fetchMerchantTransactions(merchantId, 100);
    },
    enabled: !!merchantId,
    staleTime: 30_000,
  });

  // Realtime subscription
  useEffect(() => {
    if (!merchantId) return;

    const channel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `merchant_id=eq.${merchantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['merchant-transactions', merchantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [merchantId, queryClient]);

  // Transactions groupées par date (mémoïsées)
  const groupedTransactions: GroupedTransactions[] = useMemo(
    () => groupTransactionsByDate(transactions.slice(0, visibleCount)),
    [transactions, visibleCount]
  );

  // Charger plus de transactions
  const loadMore = useCallback(() => {
    setVisibleCount((c) => c + 10);
  }, []);

  // Export PDF
  const exportToPDF = useCallback(async () => {
    if (transactions.length === 0) {
      toast.error("Aucune transaction à exporter");
      return;
    }

    setIsExporting(true);
    try {
      const range = getDateRangeForPeriod(exportPeriod);
      const filtered = filterTransactionsByPeriod(transactions, range);

      if (filtered.length === 0) {
        toast.error("Aucune transaction pour cette période");
        return;
      }

      const summary = calculateTransactionsSummary(filtered);
      const formattedTx = filtered.map(formatTransactionForExport);

      await exportSalesReportToPDF(merchantName, range, formattedTx, summary);
      toast.success("Rapport PDF téléchargé !");
    } catch (error) {
      console.error("Erreur export PDF:", error);
      toast.error("Impossible de créer le rapport");
    } finally {
      setIsExporting(false);
    }
  }, [transactions, exportPeriod, merchantName]);

  return {
    // Données
    transactions,
    groupedTransactions,
    merchantName,

    // États
    isLoading,
    isExporting,
    visibleCount,
    exportPeriod,

    // Computed
    hasMore: visibleCount < transactions.length,
    totalCount: transactions.length,

    // Actions
    setExportPeriod,
    loadMore,
    exportToPDF,
  };
}

// Ré-export des types pour faciliter l'import
export type { TransactionListItem, GroupedTransactions, ExportPeriod };
