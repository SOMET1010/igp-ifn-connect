/**
 * Types pour le système offline / sync
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Item dans la queue offline
 * Note: data utilise any car les données sont hétérogènes (merchants, transactions, etc.)
 */
export interface OfflineItem {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  data: any;
  created_at: string;
  retryCount: number;
  lastRetry?: string;
}

/**
 * Résultat de la vérification de conflit
 */
export interface ConflictCheckResult {
  hasConflict: boolean;
  serverData?: any;
}
