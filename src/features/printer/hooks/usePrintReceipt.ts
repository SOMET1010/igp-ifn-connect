/**
 * Hook pour imprimer un reçu avec fallback queue offline
 */

import { useState, useCallback } from 'react';
import type { ReceiptData } from '../types/printer.types';
import { printerService } from '../services/printerService';
import { printerQueue } from '../services/printerQueue';
import { toast } from 'sonner';

export interface UsePrintReceiptReturn {
  print: (data: ReceiptData) => Promise<boolean>;
  isPrinting: boolean;
  isQueued: boolean;
}

export function usePrintReceipt(): UsePrintReceiptReturn {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isQueued, setIsQueued] = useState(false);

  const print = useCallback(async (data: ReceiptData): Promise<boolean> => {
    setIsPrinting(true);
    setIsQueued(false);

    try {
      // Vérifier si l'imprimante est connectée
      if (printerService.getStatus() === 'connected') {
        const success = await printerService.printReceipt(data);
        
        if (success) {
          toast.success('Reçu imprimé avec succès');
          return true;
        } else {
          // Échec d'impression, mettre en queue
          printerQueue.enqueue(data);
          setIsQueued(true);
          toast.info('Impression en attente', {
            description: 'Le reçu sera imprimé dès que l\'imprimante sera disponible',
          });
          return false;
        }
      } else {
        // Pas d'imprimante connectée, mettre en queue
        printerQueue.enqueue(data);
        setIsQueued(true);
        toast.info('Reçu mis en file d\'attente', {
          description: 'Connectez une imprimante pour imprimer',
        });
        return false;
      }
    } catch (error) {
      console.error('[usePrintReceipt] Erreur:', error);
      // Mettre en queue en cas d'erreur
      printerQueue.enqueue(data);
      setIsQueued(true);
      toast.error('Erreur d\'impression', {
        description: 'Le reçu a été mis en file d\'attente',
      });
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  return {
    print,
    isPrinting,
    isQueued,
  };
}
