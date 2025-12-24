import { describe, it, expect } from "vitest";
import {
  calculateProductsTotal,
  calculateCmuDeduction,
  calculateRstiDeduction,
  generateTransactionReference,
  formatCurrency,
  calculateEffectiveAmount,
  parseManualAmount,
} from "./cashierCalculations";
import type { SelectedProduct } from "../types/transaction.types";

// ============================================
// Tests : calculateProductsTotal
// ============================================
describe("calculateProductsTotal", () => {
  it("retourne 0 pour une liste vide", () => {
    expect(calculateProductsTotal([])).toBe(0);
  });

  it("calcule correctement pour un seul produit", () => {
    const products: SelectedProduct[] = [
      {
        stockId: "stock-1",
        productId: "prod-1",
        productName: "Tomates",
        quantity: 3,
        unitPrice: 500,
      },
    ];
    expect(calculateProductsTotal(products)).toBe(1500);
  });

  it("calcule correctement pour plusieurs produits", () => {
    const products: SelectedProduct[] = [
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
        quantity: 5,
        unitPrice: 200,
      },
      {
        stockId: "stock-3",
        productId: "prod-3",
        productName: "Piment",
        quantity: 1,
        unitPrice: 1000,
      },
    ];
    // 2*500 + 5*200 + 1*1000 = 1000 + 1000 + 1000 = 3000
    expect(calculateProductsTotal(products)).toBe(3000);
  });

  it("gère les prix à zéro", () => {
    const products: SelectedProduct[] = [
      {
        stockId: "stock-1",
        productId: "prod-1",
        productName: "Échantillon gratuit",
        quantity: 10,
        unitPrice: 0,
      },
    ];
    expect(calculateProductsTotal(products)).toBe(0);
  });
});

// ============================================
// Tests : calculateCmuDeduction
// ============================================
describe("calculateCmuDeduction", () => {
  it("retourne 0 pour un montant de 0", () => {
    expect(calculateCmuDeduction(0)).toBe(0);
  });

  it("calcule 1% correctement pour 10000 FCFA", () => {
    expect(calculateCmuDeduction(10000)).toBe(100);
  });

  it("calcule 1% correctement pour 5000 FCFA", () => {
    expect(calculateCmuDeduction(5000)).toBe(50);
  });

  it("arrondit au plus proche pour 1550 FCFA → 16", () => {
    // 1550 * 0.01 = 15.5 → arrondi à 16
    expect(calculateCmuDeduction(1550)).toBe(16);
  });

  it("arrondit au plus proche pour 1549 FCFA → 15", () => {
    // 1549 * 0.01 = 15.49 → arrondi à 15
    expect(calculateCmuDeduction(1549)).toBe(15);
  });

  it("gère les grands montants", () => {
    expect(calculateCmuDeduction(1000000)).toBe(10000);
  });
});

// ============================================
// Tests : calculateRstiDeduction
// ============================================
describe("calculateRstiDeduction", () => {
  it("retourne 0 pour un montant de 0", () => {
    expect(calculateRstiDeduction(0)).toBe(0);
  });

  it("calcule 0.5% correctement pour 10000 FCFA", () => {
    expect(calculateRstiDeduction(10000)).toBe(50);
  });

  it("calcule 0.5% correctement pour 20000 FCFA", () => {
    expect(calculateRstiDeduction(20000)).toBe(100);
  });

  it("arrondit au plus proche pour 1550 FCFA → 8", () => {
    // 1550 * 0.005 = 7.75 → arrondi à 8
    expect(calculateRstiDeduction(1550)).toBe(8);
  });

  it("arrondit au plus proche pour 1500 FCFA → 8", () => {
    // 1500 * 0.005 = 7.5 → arrondi à 8
    expect(calculateRstiDeduction(1500)).toBe(8);
  });

  it("gère les grands montants", () => {
    expect(calculateRstiDeduction(1000000)).toBe(5000);
  });
});

// ============================================
// Tests : generateTransactionReference
// ============================================
describe("generateTransactionReference", () => {
  it("retourne une référence au format TXN-XXX", () => {
    const ref = generateTransactionReference();
    expect(ref).toMatch(/^TXN-[A-Z0-9]+$/);
  });

  it("génère des références uniques", () => {
    const ref1 = generateTransactionReference();
    // Petit délai pour garantir un timestamp différent
    const ref2 = generateTransactionReference();
    expect(ref1).not.toBe(ref2);
  });

  it("génère une référence non vide", () => {
    const ref = generateTransactionReference();
    expect(ref.length).toBeGreaterThan(4); // "TXN-" + au moins 1 caractère
  });
});

// ============================================
// Tests : formatCurrency
// ============================================
describe("formatCurrency", () => {
  it("formate 0 correctement", () => {
    expect(formatCurrency(0)).toBe("0");
  });

  it("formate 1500 avec séparateur de milliers", () => {
    const result = formatCurrency(1500);
    // En français, le séparateur peut être espace ou espace insécable
    expect(result.replace(/\s/g, " ")).toBe("1 500");
  });

  it("formate 10000000 correctement", () => {
    const result = formatCurrency(10000000);
    expect(result.replace(/\s/g, " ")).toBe("10 000 000");
  });

  it("formate les petits nombres sans séparateur", () => {
    expect(formatCurrency(500)).toBe("500");
  });

  it("formate les nombres à 4 chiffres", () => {
    const result = formatCurrency(5000);
    expect(result.replace(/\s/g, " ")).toBe("5 000");
  });
});

// ============================================
// Tests : calculateEffectiveAmount
// ============================================
describe("calculateEffectiveAmount", () => {
  it("retourne productsTotal si > 0", () => {
    expect(calculateEffectiveAmount(5000, 1000)).toBe(5000);
  });

  it("retourne manualAmount si productsTotal = 0", () => {
    expect(calculateEffectiveAmount(0, 3000)).toBe(3000);
  });

  it("retourne 0 si les deux sont 0", () => {
    expect(calculateEffectiveAmount(0, 0)).toBe(0);
  });

  it("priorise productsTotal même si manualAmount est plus grand", () => {
    expect(calculateEffectiveAmount(1000, 5000)).toBe(1000);
  });
});

// ============================================
// Tests : parseManualAmount
// ============================================
describe("parseManualAmount", () => {
  it("retourne 0 pour une chaîne vide", () => {
    expect(parseManualAmount("")).toBe(0);
  });

  it("parse un nombre simple", () => {
    expect(parseManualAmount("1500")).toBe(1500);
  });

  it("ignore les espaces", () => {
    expect(parseManualAmount("1 500")).toBe(1500);
  });

  it("ignore les caractères non numériques", () => {
    expect(parseManualAmount("1 500 FCFA")).toBe(1500);
  });

  it("gère les montants avec points", () => {
    expect(parseManualAmount("10.000")).toBe(10000);
  });

  it("retourne 0 pour du texte sans chiffres", () => {
    expect(parseManualAmount("abc")).toBe(0);
  });

  it("gère les montants avec virgules", () => {
    expect(parseManualAmount("1,500")).toBe(1500);
  });
});
