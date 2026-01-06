import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/shared/contexts';
import { useToast } from '@/shared/hooks';
import { creditsService } from '../services/creditsService';
import type { CustomerCredit, CreditFilter, NewCreditInput } from '../types/credits.types';
import { isCreditOverdue } from '../types/credits.types';
import { merchantLogger } from '@/infra/logger';

export function useMerchantCredits() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [credits, setCredits] = useState<CustomerCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [filter, setFilter] = useState<CreditFilter>('all');

  const fetchCredits = useCallback(async () => {
    if (!user) return;
    
    try {
      const id = await creditsService.getMerchantId(user.id);
      if (id) {
        setMerchantId(id);
        const data = await creditsService.fetchCredits(id);
        setCredits(data);
      }
    } catch (error) {
      merchantLogger.error('Error fetching credits', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les crédits',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const addCredit = useCallback(async (input: NewCreditInput): Promise<boolean> => {
    if (!merchantId) return false;
    
    try {
      await creditsService.addCredit(merchantId, input);
      toast({
        title: 'Succès',
        description: 'Crédit ajouté avec succès'
      });
      await fetchCredits();
      return true;
    } catch (error) {
      merchantLogger.error('Error adding credit', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter le crédit",
        variant: 'destructive'
      });
      return false;
    }
  }, [merchantId, toast, fetchCredits]);

  const recordPayment = useCallback(async (
    credit: CustomerCredit, 
    amount: number
  ): Promise<boolean> => {
    try {
      await creditsService.recordPayment(
        credit.id,
        amount,
        credit.amount_paid,
        credit.amount_owed
      );
      toast({
        title: 'Succès',
        description: `Paiement de ${amount.toLocaleString()} FCFA enregistré`
      });
      await fetchCredits();
      return true;
    } catch (error) {
      merchantLogger.error('Error recording payment', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'enregistrer le paiement",
        variant: 'destructive'
      });
      return false;
    }
  }, [toast, fetchCredits]);

  // Computed values
  const filteredCredits = useMemo(() => {
    return credits.filter(credit => {
      const isOverdue = isCreditOverdue(credit);
      
      switch (filter) {
        case 'pending': 
          return credit.status === 'pending' || credit.status === 'partially_paid';
        case 'overdue': 
          return isOverdue;
        case 'paid': 
          return credit.status === 'paid';
        default: 
          return true;
      }
    });
  }, [credits, filter]);

  const totalOwed = useMemo(() => {
    return credits.reduce((sum, c) => sum + (c.amount_owed - c.amount_paid), 0);
  }, [credits]);

  const overdueCount = useMemo(() => {
    return credits.filter(isCreditOverdue).length;
  }, [credits]);

  return {
    // State
    credits,
    filteredCredits,
    isLoading,
    merchantId,
    filter,
    
    // Computed
    totalOwed,
    overdueCount,
    
    // Actions
    setFilter,
    addCredit,
    recordPayment,
    refresh: fetchCredits
  };
}
