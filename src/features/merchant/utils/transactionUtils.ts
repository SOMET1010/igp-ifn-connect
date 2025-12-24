import { format, isToday, isYesterday, startOfWeek, startOfMonth, subDays, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

// ============================================
// Types locaux
// ============================================
export interface TransactionListItem {
  id: string;
  amount: number;
  transaction_type: "cash" | "mobile_money" | "transfer";
  created_at: string;
  reference: string | null;
  cmu_deduction: number | null;
  rsti_deduction: number | null;
}

export interface GroupedTransactions {
  label: string;
  transactions: TransactionListItem[];
}

export type ExportPeriod = "today" | "week" | "month" | "last30" | "last3months";

export interface TransactionsSummary {
  totalSales: number;
  totalTransactions: number;
  totalCmuDeductions: number;
  totalRstiDeductions: number;
  netAmount: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================
// Fonctions utilitaires pures
// ============================================

/**
 * Génère un label de groupe pour une date (Aujourd'hui, Hier, ou date formatée)
 */
export function getDateLabel(date: Date): string {
  if (isToday(date)) return "Aujourd'hui";
  if (isYesterday(date)) return "Hier";
  return format(date, "EEEE d MMMM", { locale: fr });
}

/**
 * Groupe les transactions par jour
 */
export function groupTransactionsByDate(
  transactions: TransactionListItem[]
): GroupedTransactions[] {
  const grouped: Record<string, TransactionListItem[]> = {};

  transactions.forEach((tx) => {
    const label = getDateLabel(new Date(tx.created_at));
    if (!grouped[label]) {
      grouped[label] = [];
    }
    grouped[label].push(tx);
  });

  return Object.entries(grouped).map(([label, txs]) => ({
    label,
    transactions: txs,
  }));
}

/**
 * Calcule la plage de dates pour une période d'export
 */
export function getDateRangeForPeriod(period: ExportPeriod): DateRange {
  const now = new Date();
  let start: Date;

  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "week":
      start = startOfWeek(now, { weekStartsOn: 1 });
      break;
    case "month":
      start = startOfMonth(now);
      break;
    case "last30":
      start = subDays(now, 30);
      break;
    case "last3months":
      start = subMonths(now, 3);
      break;
    default:
      start = startOfWeek(now, { weekStartsOn: 1 });
  }

  return { start, end: now };
}

/**
 * Filtre les transactions par période
 */
export function filterTransactionsByPeriod(
  transactions: TransactionListItem[],
  range: DateRange
): TransactionListItem[] {
  return transactions.filter((tx) => {
    const txDate = new Date(tx.created_at);
    return txDate >= range.start && txDate <= range.end;
  });
}

/**
 * Calcule le résumé des transactions
 */
export function calculateTransactionsSummary(
  transactions: TransactionListItem[]
): TransactionsSummary {
  const totalSales = transactions.reduce(
    (sum, tx) => sum + Number(tx.amount),
    0
  );
  const totalCmuDeductions = transactions.reduce(
    (sum, tx) => sum + (Number(tx.cmu_deduction) || 0),
    0
  );
  const totalRstiDeductions = transactions.reduce(
    (sum, tx) => sum + (Number(tx.rsti_deduction) || 0),
    0
  );

  return {
    totalSales,
    totalTransactions: transactions.length,
    totalCmuDeductions,
    totalRstiDeductions,
    netAmount: totalSales - totalCmuDeductions - totalRstiDeductions,
  };
}

/**
 * Formate une transaction pour l'export PDF
 */
export function formatTransactionForExport(tx: TransactionListItem) {
  return {
    reference: tx.reference || tx.id,
    date: format(new Date(tx.created_at), "dd/MM/yy HH:mm"),
    amount: Number(tx.amount),
    paymentMethod: tx.transaction_type,
    cmuDeduction: Number(tx.cmu_deduction) || 0,
    rstiDeduction: Number(tx.rsti_deduction) || 0,
  };
}
