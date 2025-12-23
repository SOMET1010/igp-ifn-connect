export interface Order {
  id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  merchant_name: string;
  product_name: string;
  product_unit: string;
  cancellation_reason: string | null;
  cancelled_at: string | null;
}

export const statusLabels = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmé', color: 'bg-blue-100 text-blue-800' },
  in_transit: { label: 'En transit', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livré', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
};
