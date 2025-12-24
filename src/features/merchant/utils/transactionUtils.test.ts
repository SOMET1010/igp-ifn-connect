import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getDateLabel,
  groupTransactionsByDate,
  getDateRangeForPeriod,
  filterTransactionsByPeriod,
  calculateTransactionsSummary,
  formatTransactionForExport,
  type TransactionListItem,
} from "./transactionUtils";

// ============================================
// Tests unitaires transactionUtils
// ============================================

describe("getDateLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retourne 'Aujourd'hui' pour la date du jour", () => {
    const today = new Date("2024-01-15T10:00:00");
    expect(getDateLabel(today)).toBe("Aujourd'hui");
  });

  it("retourne 'Hier' pour la veille", () => {
    const yesterday = new Date("2024-01-14T10:00:00");
    expect(getDateLabel(yesterday)).toBe("Hier");
  });

  it("retourne une date formatée pour les autres jours", () => {
    const oldDate = new Date("2024-01-10T10:00:00");
    const label = getDateLabel(oldDate);
    expect(label).toContain("janvier");
  });
});

describe("groupTransactionsByDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("groupe les transactions par jour", () => {
    const transactions: TransactionListItem[] = [
      { id: "1", amount: 1000, transaction_type: "cash", created_at: "2024-01-15T10:00:00", reference: null, cmu_deduction: null, rsti_deduction: null },
      { id: "2", amount: 2000, transaction_type: "cash", created_at: "2024-01-15T11:00:00", reference: null, cmu_deduction: null, rsti_deduction: null },
      { id: "3", amount: 3000, transaction_type: "mobile_money", created_at: "2024-01-14T09:00:00", reference: null, cmu_deduction: null, rsti_deduction: null },
    ];

    const grouped = groupTransactionsByDate(transactions);

    expect(grouped).toHaveLength(2);
    expect(grouped[0].label).toBe("Aujourd'hui");
    expect(grouped[0].transactions).toHaveLength(2);
    expect(grouped[1].label).toBe("Hier");
    expect(grouped[1].transactions).toHaveLength(1);
  });

  it("retourne un tableau vide pour une liste vide", () => {
    expect(groupTransactionsByDate([])).toEqual([]);
  });
});

describe("getDateRangeForPeriod", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calcule la plage 'today' correctement", () => {
    const range = getDateRangeForPeriod("today");
    expect(range.start.getDate()).toBe(15);
    expect(range.start.getHours()).toBe(0);
  });

  it("calcule la plage 'last30' correctement", () => {
    const range = getDateRangeForPeriod("last30");
    expect(range.start.getDate()).toBe(16); // 15 jan - 30 jours = 16 déc
  });
});

describe("filterTransactionsByPeriod", () => {
  it("filtre les transactions dans la plage", () => {
    const transactions: TransactionListItem[] = [
      { id: "1", amount: 1000, transaction_type: "cash", created_at: "2024-01-10T10:00:00", reference: null, cmu_deduction: null, rsti_deduction: null },
      { id: "2", amount: 2000, transaction_type: "cash", created_at: "2024-01-15T10:00:00", reference: null, cmu_deduction: null, rsti_deduction: null },
      { id: "3", amount: 3000, transaction_type: "cash", created_at: "2024-01-20T10:00:00", reference: null, cmu_deduction: null, rsti_deduction: null },
    ];

    const range = {
      start: new Date("2024-01-12"),
      end: new Date("2024-01-18"),
    };

    const filtered = filterTransactionsByPeriod(transactions, range);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("2");
  });
});

describe("calculateTransactionsSummary", () => {
  it("calcule les totaux correctement", () => {
    const transactions: TransactionListItem[] = [
      { id: "1", amount: 10000, transaction_type: "cash", created_at: "2024-01-15", reference: null, cmu_deduction: 200, rsti_deduction: 100 },
      { id: "2", amount: 5000, transaction_type: "mobile_money", created_at: "2024-01-15", reference: null, cmu_deduction: 100, rsti_deduction: 50 },
    ];

    const summary = calculateTransactionsSummary(transactions);

    expect(summary.totalSales).toBe(15000);
    expect(summary.totalTransactions).toBe(2);
    expect(summary.totalCmuDeductions).toBe(300);
    expect(summary.totalRstiDeductions).toBe(150);
    expect(summary.netAmount).toBe(14550);
  });

  it("gère les valeurs null", () => {
    const transactions: TransactionListItem[] = [
      { id: "1", amount: 10000, transaction_type: "cash", created_at: "2024-01-15", reference: null, cmu_deduction: null, rsti_deduction: null },
    ];

    const summary = calculateTransactionsSummary(transactions);
    expect(summary.totalCmuDeductions).toBe(0);
    expect(summary.totalRstiDeductions).toBe(0);
    expect(summary.netAmount).toBe(10000);
  });
});

describe("formatTransactionForExport", () => {
  it("formate une transaction pour l'export", () => {
    const tx: TransactionListItem = {
      id: "abc123",
      amount: 5000,
      transaction_type: "cash",
      created_at: "2024-01-15T14:30:00",
      reference: "REF-001",
      cmu_deduction: 100,
      rsti_deduction: 50,
    };

    const formatted = formatTransactionForExport(tx);

    expect(formatted.reference).toBe("REF-001");
    expect(formatted.amount).toBe(5000);
    expect(formatted.paymentMethod).toBe("cash");
    expect(formatted.cmuDeduction).toBe(100);
    expect(formatted.rstiDeduction).toBe(50);
  });

  it("utilise l'ID si pas de référence", () => {
    const tx: TransactionListItem = {
      id: "abc123",
      amount: 5000,
      transaction_type: "cash",
      created_at: "2024-01-15T14:30:00",
      reference: null,
      cmu_deduction: null,
      rsti_deduction: null,
    };

    const formatted = formatTransactionForExport(tx);
    expect(formatted.reference).toBe("abc123");
  });
});
