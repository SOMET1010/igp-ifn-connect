import { supabase } from '@/integrations/supabase/client';
import type { CustomerCredit, NewCreditInput } from '../types/credits.types';

export const creditsService = {
  async getMerchantId(userId: string): Promise<string | null> {
    const { data } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    return data?.id ?? null;
  },

  async fetchCredits(merchantId: string): Promise<CustomerCredit[]> {
    const { data, error } = await supabase
      .from('customer_credits')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as CustomerCredit[];
  },

  async addCredit(merchantId: string, input: NewCreditInput): Promise<CustomerCredit> {
    const { data, error } = await supabase
      .from('customer_credits')
      .insert({
        merchant_id: merchantId,
        customer_name: input.customer_name,
        customer_phone: input.customer_phone || '',
        amount_owed: input.amount_owed,
        due_date: input.due_date || null,
        notes: input.notes || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data as CustomerCredit;
  },

  async recordPayment(
    creditId: string, 
    paymentAmount: number, 
    currentPaid: number, 
    amountOwed: number
  ): Promise<CustomerCredit> {
    const newPaid = currentPaid + paymentAmount;
    const remaining = amountOwed - newPaid;
    const newStatus = remaining <= 0 ? 'paid' : newPaid > 0 ? 'partially_paid' : 'pending';

    const { data, error } = await supabase
      .from('customer_credits')
      .update({
        amount_paid: newPaid,
        status: newStatus
      })
      .eq('id', creditId)
      .select()
      .single();

    if (error) throw error;
    return data as CustomerCredit;
  }
};
