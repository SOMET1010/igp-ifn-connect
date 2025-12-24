import { supabase } from '@/integrations/supabase/client';
import { Invoice, MerchantInvoiceData, NewInvoiceInput } from '../types/invoices.types';
import { generateSecurityHash, generateVerificationUrl } from '@/lib/invoiceUtils';
import { merchantLogger } from '@/infra/logger';

export const invoicesService = {
  async getMerchantData(userId: string): Promise<MerchantInvoiceData | null> {
    const { data, error } = await supabase
      .from('merchants')
      .select('id, full_name, phone, ncc, fiscal_regime, invoice_counter')
      .eq('user_id', userId)
      .single();

    if (error) {
      merchantLogger.error('Error fetching merchant data', error);
      throw error;
    }

    return data as MerchantInvoiceData;
  },

  async fetchInvoices(merchantId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) {
      merchantLogger.error('Error fetching invoices', error);
      throw error;
    }

    return (data || []) as Invoice[];
  },

  async generateInvoiceNumber(merchantId: string): Promise<{ invoiceNumber: string; newCounter: number }> {
    const year = new Date().getFullYear();

    // Get current counter
    const { data: merchant, error: fetchError } = await supabase
      .from('merchants')
      .select('invoice_counter')
      .eq('id', merchantId)
      .single();

    if (fetchError) throw fetchError;

    const counter = ((merchant?.invoice_counter as number) || 0) + 1;

    // Update counter atomically
    const { error: updateError } = await supabase
      .from('merchants')
      .update({ invoice_counter: counter })
      .eq('id', merchantId);

    if (updateError) throw updateError;

    const invoiceNumber = `IFN-${year}-${counter.toString().padStart(6, '0')}`;
    return { invoiceNumber, newCounter: counter };
  },

  async createInvoice(
    merchantData: MerchantInvoiceData,
    input: NewInvoiceInput
  ): Promise<Invoice> {
    const { invoiceNumber } = await this.generateInvoiceNumber(merchantData.id);
    
    const now = new Date();
    const tvaRate = 0;
    const tvaAmount = 0;
    const amountHt = input.amount;
    const amountTtc = input.amount;

    // Generate security hash
    const securityHash = await generateSecurityHash({
      invoiceNumber,
      merchantNcc: merchantData.ncc || merchantData.id,
      amountTtc,
      date: now.toISOString().split('T')[0],
    });

    // Generate verification URL
    const verificationUrl = generateVerificationUrl(invoiceNumber, securityHash);

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        merchant_id: merchantData.id,
        customer_name: input.customer_name || null,
        customer_phone: input.customer_phone || null,
        amount_ht: amountHt,
        tva_rate: tvaRate,
        tva_amount: tvaAmount,
        amount_ttc: amountTtc,
        status: 'issued',
        signature_hash: securityHash,
        qr_code_data: verificationUrl,
      })
      .select()
      .single();

    if (error) {
      merchantLogger.error('Error creating invoice', error);
      throw error;
    }

    return data as Invoice;
  },

  async cancelInvoice(invoiceId: string, reason: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'cancelled',
        cancellation_reason: reason.trim(),
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', invoiceId);

    if (error) {
      merchantLogger.error('Error cancelling invoice', error);
      throw error;
    }
  }
};
