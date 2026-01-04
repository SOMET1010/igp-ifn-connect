/**
 * Résolution des conflits de synchronisation offline
 * P.NA.VIM - Architecture industrie
 */

export type ConflictStrategy = 'client-wins' | 'server-wins' | 'merge' | 'manual';

export interface ConflictResolution<T> {
  resolved: boolean;
  data: T;
  strategy: ConflictStrategy;
  mergeDetails?: {
    fieldsFromClient: string[];
    fieldsFromServer: string[];
  };
}

/**
 * Compare deux objets et détecte les champs en conflit
 */
export function detectConflicts<T extends Record<string, unknown>>(
  local: T,
  remote: T,
  ignoredFields: string[] = ['updated_at', 'synced_at']
): string[] {
  const conflicts: string[] = [];
  
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  
  for (const key of allKeys) {
    if (ignoredFields.includes(key)) continue;
    
    const localValue = JSON.stringify(local[key]);
    const remoteValue = JSON.stringify(remote[key]);
    
    if (localValue !== remoteValue) {
      conflicts.push(key);
    }
  }
  
  return conflicts;
}

/**
 * Résout un conflit entre données locales et serveur
 */
export function resolveConflict<T extends Record<string, unknown>>(
  local: T,
  remote: T,
  strategy: ConflictStrategy,
  preferredFields?: { client?: string[]; server?: string[] }
): ConflictResolution<T> {
  switch (strategy) {
    case 'client-wins':
      return {
        resolved: true,
        data: { ...remote, ...local },
        strategy,
      };

    case 'server-wins':
      return {
        resolved: true,
        data: { ...local, ...remote },
        strategy,
      };

    case 'merge':
      return mergeData(local, remote, preferredFields);

    case 'manual':
      // Retourne le serveur par défaut, l'UI doit gérer le conflit
      return {
        resolved: false,
        data: remote,
        strategy,
      };

    default:
      return {
        resolved: true,
        data: remote,
        strategy: 'server-wins',
      };
  }
}

/**
 * Fusionne les données en priorisant certains champs
 */
function mergeData<T extends Record<string, unknown>>(
  local: T,
  remote: T,
  preferredFields?: { client?: string[]; server?: string[] }
): ConflictResolution<T> {
  const clientFields = preferredFields?.client || [];
  const serverFields = preferredFields?.server || [];
  
  const merged: Record<string, unknown> = { ...remote };
  const fieldsFromClient: string[] = [];
  const fieldsFromServer: string[] = [];
  
  for (const key of Object.keys(local)) {
    if (clientFields.includes(key)) {
      merged[key] = local[key];
      fieldsFromClient.push(key);
    } else if (serverFields.includes(key)) {
      merged[key] = remote[key];
      fieldsFromServer.push(key);
    } else {
      // Par défaut, prendre la valeur la plus récente si on a des timestamps
      const localUpdated = (local as Record<string, unknown>)['updated_at'];
      const remoteUpdated = (remote as Record<string, unknown>)['updated_at'];
      
      if (localUpdated && remoteUpdated) {
        if (new Date(localUpdated as string) > new Date(remoteUpdated as string)) {
          merged[key] = local[key];
          fieldsFromClient.push(key);
        } else {
          fieldsFromServer.push(key);
        }
      } else {
        // Sans timestamp, prioriser le client (ce que l'utilisateur a modifié)
        merged[key] = local[key];
        fieldsFromClient.push(key);
      }
    }
  }
  
  return {
    resolved: true,
    data: merged as T,
    strategy: 'merge',
    mergeDetails: {
      fieldsFromClient,
      fieldsFromServer,
    },
  };
}

/**
 * Stratégies par défaut par type d'entité
 */
export const DEFAULT_STRATEGIES: Record<string, ConflictStrategy> = {
  transaction: 'client-wins', // Les ventes offline priment
  merchant: 'merge',
  stock: 'server-wins', // Le serveur a la vision globale du stock
  order: 'server-wins',
  credit: 'merge',
};

/**
 * Obtient la stratégie par défaut pour un type d'entité
 */
export function getDefaultStrategy(entityType: string): ConflictStrategy {
  return DEFAULT_STRATEGIES[entityType] || 'server-wins';
}
