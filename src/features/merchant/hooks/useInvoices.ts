import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { invoicesService } from '../services/invoicesService';
import { Invoice, InvoiceFilter, MerchantInvoiceData, NewInvoiceInput } from '../types/invoices.types';
import { InvoiceData } from '@/features/merchant/components/FNEInvoice';

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [merchantData, setMerchantData] = useState<MerchantInvoiceData | null>(null);
  const [filter, setFilter] = useState<InvoiceFilter>('all');
  const [generatedInvoice, setGeneratedInvoice] = useState<InvoiceData | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const merchant = await invoicesService.getMerchantData(user.id);
      if (!merchant) {
        toast.error('Données marchand non trouvées');
        return;
      }
      setMerchantData(merchant);

      const invoicesData = await invoicesService.fetchInvoices(merchant.id);
      setInvoices(invoicesData);
    } catch (error) {
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredInvoices = useMemo(() => {
    if (filter === 'all') return invoices;
    return invoices.filter(inv => inv.status === filter);
  }, [invoices, filter]);

  const issuedCount = useMemo(() => 
    invoices.filter(inv => inv.status === 'issued').length,
  [invoices]);

  const cancelledCount = useMemo(() => 
    invoices.filter(inv => inv.status === 'cancelled').length,
  [invoices]);

  const totalAmount = useMemo(() => 
    invoices
      .filter(inv => inv.status === 'issued')
      .reduce((sum, inv) => sum + Number(inv.amount_ttc), 0),
  [invoices]);

  const createInvoice = useCallback(async (input: NewInvoiceInput, description: string) => {
    if (!merchantData) {
      toast.error('Données marchand non disponibles');
      return false;
    }

    try {
      const invoice = await invoicesService.createInvoice(merchantData, input);
      
      // Create invoice data for preview
      const invoiceData: InvoiceData = {
        invoiceNumber: invoice.invoice_number,
        merchantName: merchantData.full_name,
        merchantPhone: merchantData.phone,
        merchantNcc: merchantData.ncc || undefined,
        fiscalRegime: merchantData.fiscal_regime || 'TSU',
        customerName: input.customer_name || undefined,
        customerPhone: input.customer_phone || undefined,
        amountHt: input.amount,
        tvaRate: 0,
        tvaAmount: 0,
        amountTtc: input.amount,
        description,
        date: new Date(),
        securityHash: invoice.signature_hash || undefined,
        verificationUrl: invoice.qr_code_data || undefined,
      };

      setGeneratedInvoice(invoiceData);
      toast.success('Facture FNE créée avec succès !');
      fetchData();
      return true;
    } catch (error) {
      toast.error('Erreur lors de la création de la facture');
      return false;
    }
  }, [merchantData, fetchData]);

  const cancelInvoice = useCallback(async (invoiceId: string, reason: string) => {
    try {
      await invoicesService.cancelInvoice(invoiceId, reason);
      toast.success('Facture annulée avec succès');
      fetchData();
      return true;
    } catch (error) {
      toast.error('Erreur lors de l\'annulation de la facture');
      return false;
    }
  }, [fetchData]);

  const clearGeneratedInvoice = useCallback(() => {
    setGeneratedInvoice(null);
  }, []);

  return {
    invoices,
    filteredInvoices,
    isLoading,
    merchantData,
    filter,
    setFilter,
    issuedCount,
    cancelledCount,
    totalAmount,
    createInvoice,
    cancelInvoice,
    generatedInvoice,
    clearGeneratedInvoice,
    refresh: fetchData,
  };
}
