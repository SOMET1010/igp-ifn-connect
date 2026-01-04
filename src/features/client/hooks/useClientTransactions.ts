import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ClientTransaction, TransactionType } from '../types/client.types';

export function useClientTransactions(clientId?: string, limit?: number) {
  return useQuery({
    queryKey: ['client-transactions', clientId, limit],
    queryFn: async () => {
      if (!clientId) return [];
      
      let query = supabase
        .from('client_transactions')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ClientTransaction[];
    },
    enabled: !!clientId,
  });
}

export function useCreateTransaction(clientId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: {
      type: TransactionType;
      amount: number;
      description?: string;
      counterparty_phone?: string;
      counterparty_name?: string;
      service_id?: string;
    }) => {
      if (!clientId) throw new Error('Client non trouvé');
      
      // Get current balance
      const { data: client } = await supabase
        .from('clients')
        .select('balance')
        .eq('id', clientId)
        .single();
      
      if (!client) throw new Error('Client non trouvé');
      
      const currentBalance = client.balance || 0;
      let newBalance = currentBalance;
      
      // Calculate new balance based on transaction type
      if (['deposit', 'transfer_in'].includes(transaction.type)) {
        newBalance = currentBalance + transaction.amount;
      } else if (['withdrawal', 'transfer_out', 'payment', 'fee'].includes(transaction.type)) {
        if (currentBalance < transaction.amount) {
          throw new Error('Solde insuffisant');
        }
        newBalance = currentBalance - transaction.amount;
      }
      
      // Generate reference
      const reference = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Create transaction
      const { data, error } = await supabase
        .from('client_transactions')
        .insert({
          client_id: clientId,
          type: transaction.type,
          amount: transaction.amount,
          balance_after: newBalance,
          description: transaction.description,
          counterparty_phone: transaction.counterparty_phone,
          counterparty_name: transaction.counterparty_name,
          service_id: transaction.service_id,
          reference,
          status: 'completed',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update client balance
      await supabase
        .from('clients')
        .update({ balance: newBalance })
        .eq('id', clientId);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
      toast.success('Transaction effectuée');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
