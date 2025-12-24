import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
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

// ============================================
// Hook useTransactions
// ============================================
export function useTransactions() {
  const { user } = useAuth();

  // États
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [merchantName, setMerchantName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [exportPeriod, setExportPeriod] = useState<ExportPeriod>("week");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch initial des transactions
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const merchantData = await transactionService.getMerchantByUserId(user.id);
        setMerchantName(merchantData.full_name);

        const txList = await transactionService.fetchMerchantTransactions(
          merchantData.id,
          100
        );
        setTransactions(txList);
      } catch {
        // Merchant non trouvé ou erreur - transactions vides
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
