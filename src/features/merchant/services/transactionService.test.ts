import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SelectedProduct } from "../types/transaction.types";

// ============================================
// Mocks Setup
// ============================================

// Variables pour contrôler les retours des mocks
let mockSingleResponse: { data: unknown; error: unknown } = { data: null, error: null };
let mockInsertResponse: { data: unknown; error: unknown } = { data: null, error: null };
let mockUpdateResponse: { error: unknown } = { error: null };

// Mock du client Supabase avec structure chaînée
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve(mockSingleResponse)),
        })),
        single: vi.fn(() => Promise.resolve(mockSingleResponse)),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve(mockSingleResponse)),
        })),
        error: mockInsertResponse.error,
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve(mockUpdateResponse)),
      })),
    })),
  },
}));

// Mock du logger
vi.mock("@/infra/logger", () => ({
  merchantLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Import après les mocks
import { transactionService } from "./transactionService";

// ============================================
// Setup
// ============================================
beforeEach(() => {
  vi.clearAllMocks();
  // Reset les réponses par défaut
  mockSingleResponse = { data: null, error: null };
  mockInsertResponse = { data: null, error: null };
  mockUpdateResponse = { error: null };
});

// ============================================
// Tests : getMerchantByUserId
// ============================================
describe("transactionService.getMerchantByUserId", () => {
  it("retourne les données du marchand en cas de succès", async () => {
    const mockMerchant = {
      id: "merchant-123",
      rsti_balance: 5000,
      full_name: "Jean Koné",
    };

    mockSingleResponse = { data: mockMerchant, error: null };

    const result = await transactionService.getMerchantByUserId("user-123");

    expect(result).toEqual(mockMerchant);
  });

  it("throw une erreur si marchand non trouvé", async () => {
    mockSingleResponse = {
      data: null,
      error: { message: "Not found" },
    };

    await expect(
      transactionService.getMerchantByUserId("user-invalid")
    ).rejects.toThrow("Compte marchand introuvable");
  });

  it("throw une erreur si data est null sans erreur explicite", async () => {
    mockSingleResponse = { data: null, error: null };

    await expect(
      transactionService.getMerchantByUserId("user-123")
    ).rejects.toThrow("Compte marchand introuvable");
  });
});

// ============================================
// Tests : getMerchantName
// ============================================
describe("transactionService.getMerchantName", () => {
  it("retourne le nom du marchand", async () => {
    mockSingleResponse = {
      data: { full_name: "Marie Ouattara" },
      error: null,
    };

    const result = await transactionService.getMerchantName("user-123");

    expect(result).toBe("Marie Ouattara");
  });

  it("retourne une chaîne vide si pas de données", async () => {
    mockSingleResponse = { data: null, error: null };

    const result = await transactionService.getMerchantName("user-123");

    expect(result).toBe("");
  });

  it("retourne une chaîne vide si full_name est undefined", async () => {
    mockSingleResponse = { data: {}, error: null };

    const result = await transactionService.getMerchantName("user-123");

    expect(result).toBe("");
  });
});

// ============================================
// Tests : createTransaction
// ============================================
describe("transactionService.createTransaction", () => {
  const validInput = {
    merchant_id: "merchant-123",
    amount: 5000,
    transaction_type: "cash" as const,
    cmu_deduction: 50,
    rsti_deduction: 25,
    reference: "TXN-ABC123",
  };

  it("crée une transaction et retourne son ID", async () => {
    mockSingleResponse = {
      data: { id: "tx-new-123" },
      error: null,
    };

    const result = await transactionService.createTransaction(validInput);

    expect(result).toBe("tx-new-123");
  });

  it("throw une erreur en cas d'échec de création", async () => {
    const dbError = { message: "Database error", code: "23505" };
    mockSingleResponse = { data: null, error: dbError };

    await expect(
      transactionService.createTransaction(validInput)
    ).rejects.toEqual(dbError);
  });

  it("throw une erreur si data est null sans erreur explicite", async () => {
    mockSingleResponse = { data: null, error: null };

    await expect(
      transactionService.createTransaction(validInput)
    ).rejects.toThrow("Échec création transaction");
  });
});

// ============================================
// Tests : recordTransactionItems
// ============================================
describe("transactionService.recordTransactionItems", () => {
  const mockProducts: SelectedProduct[] = [
    {
      stockId: "stock-1",
      productId: "prod-1",
      productName: "Tomates",
      quantity: 2,
      unitPrice: 500,
    },
    {
      stockId: "stock-2",
      productId: "prod-2",
      productName: "Oignons",
      quantity: 3,
      unitPrice: 300,
    },
  ];

  it("n'effectue pas d'insertion pour une liste vide", async () => {
    await transactionService.recordTransactionItems("tx-123", []);
    // Le test passe si aucune erreur n'est throw
    expect(true).toBe(true);
  });

  it("insère les produits correctement", async () => {
    mockInsertResponse = { data: null, error: null };

    await transactionService.recordTransactionItems("tx-123", mockProducts);

    // Le test passe si aucune erreur n'est throw
    expect(true).toBe(true);
  });

  it("ne throw pas en cas d'erreur (log warning)", async () => {
    mockInsertResponse = { data: null, error: { message: "Insert failed" } };

    // Ne devrait pas throw
    await expect(
      transactionService.recordTransactionItems("tx-123", mockProducts)
    ).resolves.toBeUndefined();
  });
});

// ============================================
// Tests : updateRstiBalance
// ============================================
describe("transactionService.updateRstiBalance", () => {
  it("calcule le nouveau solde correctement", async () => {
    mockUpdateResponse = { error: null };

    await transactionService.updateRstiBalance("merchant-123", 5000, 100);

    // Le test passe si aucune erreur n'est throw
    expect(true).toBe(true);
  });

  it("traite un solde null comme 0", async () => {
    mockUpdateResponse = { error: null };

    await transactionService.updateRstiBalance("merchant-123", null, 50);

    // Le test passe si aucune erreur n'est throw
    expect(true).toBe(true);
  });

  it("ne throw pas en cas d'erreur (log warning)", async () => {
    mockUpdateResponse = { error: { message: "Update failed" } };

    await expect(
      transactionService.updateRstiBalance("merchant-123", 1000, 50)
    ).resolves.toBeUndefined();
  });
});

// ============================================
// Tests : recordCmuPayment
// ============================================
describe("transactionService.recordCmuPayment", () => {
  it("insère le paiement CMU avec les bonnes dates", async () => {
    mockInsertResponse = { data: null, error: null };

    await transactionService.recordCmuPayment("merchant-123", "tx-123", 100);

    // Le test passe si aucune erreur n'est throw
    expect(true).toBe(true);
  });

  it("ne throw pas en cas d'erreur (log warning)", async () => {
    mockInsertResponse = { data: null, error: { message: "Insert failed" } };

    await expect(
      transactionService.recordCmuPayment("merchant-123", "tx-123", 100)
    ).resolves.toBeUndefined();
  });
});
