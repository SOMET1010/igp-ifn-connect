export interface AdminDashboardStats {
  merchants: number;
  pendingMerchants: number;
  agents: number;
  cooperatives: number;
  totalTransactions: number;
}

export interface ChartDataPoint {
  date: string;
  enrollments: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  enrollments: { enrolled_at: string }[];
}
