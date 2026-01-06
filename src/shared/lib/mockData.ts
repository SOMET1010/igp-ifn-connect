/**
 * Données mock pour mode dégradé
 * Utilisées quand les APIs sont indisponibles
 */

export const mockMerchant = {
  id: "mock-merchant-001",
  full_name: "Marchande Démo",
  phone: "+225 00 00 00 00",
  activity_type: "Commerce vivrier",
  activity_description: "Vente de légumes",
  cmu_number: "CMU-DEMO-001",
  status: "validated" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  enrolled_at: new Date().toISOString(),
};

export const mockWalletBalance = {
  id: "mock-wallet-001",
  merchant_id: "mock-merchant-001",
  balance: 0,
  currency: "XOF",
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockTransactions: Array<{
  id: string;
  amount: number;
  transaction_type: "cash" | "mobile_money" | "transfer";
  created_at: string;
  reference: string | null;
}> = [];

export const mockProducts = [
  { id: "prod-001", name: "Tomate", unit: "kg", is_igp: false },
  { id: "prod-002", name: "Igname", unit: "kg", is_igp: true },
  { id: "prod-003", name: "Banane plantain", unit: "kg", is_igp: false },
  { id: "prod-004", name: "Attiéké", unit: "kg", is_igp: true },
  { id: "prod-005", name: "Manioc", unit: "kg", is_igp: false },
];

export const mockDashboardStats = {
  todayTotal: 0,
  weekTotal: 0,
  transactionCount: 0,
  pendingSync: 0,
};

export const mockNotifications: Array<{
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}> = [];

/**
 * Helper pour obtenir des données mock par type
 */
export function getMockData<T>(type: string): T | null {
  const mockMap: Record<string, unknown> = {
    merchant: mockMerchant,
    wallet: mockWalletBalance,
    transactions: mockTransactions,
    products: mockProducts,
    dashboard: mockDashboardStats,
    notifications: mockNotifications,
  };

  return (mockMap[type] as T) ?? null;
}
