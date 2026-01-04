/**
 * Sync Engine - Synchronisation des données offline
 * 
 * Gère la synchronisation des queues avec le serveur
 * quand la connexion revient
 */

import { getQueue, dequeue, updateQueueItem, type QueueItem, type QueueType } from './queues';

// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Types pour les handlers
export type SyncHandler<T = unknown> = (item: QueueItem<T>) => Promise<void>;

// Registry des handlers par type de queue
const handlers: Map<QueueType, SyncHandler> = new Map();

/**
 * Enregistre un handler pour un type de queue
 */
export function registerSyncHandler<T>(type: QueueType, handler: SyncHandler<T>): void {
  handlers.set(type, handler as SyncHandler);
}

/**
 * Synchronise un élément de queue
 */
async function syncItem(item: QueueItem): Promise<boolean> {
  const handler = handlers.get(item.type);
  
  if (!handler) {
    console.warn(`[SyncEngine] No handler for queue type: ${item.type}`);
    return false;
  }

  try {
    await handler(item);
    if (item.id) {
      await dequeue(item.id);
    }
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (item.id) {
      await updateQueueItem(item.id, {
        retries: item.retries + 1,
        lastError: errorMessage,
      });
    }
    
    console.error(`[SyncEngine] Failed to sync item ${item.id}:`, errorMessage);
    return false;
  }
}

/**
 * Synchronise tous les éléments en attente
 */
export async function syncAll(): Promise<{ success: number; failed: number }> {
  const items = await getQueue();
  let success = 0;
  let failed = 0;

  // Trier par timestamp (FIFO)
  const sortedItems = items.sort((a, b) => a.timestamp - b.timestamp);

  for (const item of sortedItems) {
    // Skip items with too many retries
    if (item.retries >= MAX_RETRIES) {
      failed++;
      continue;
    }

    const result = await syncItem(item);
    if (result) {
      success++;
    } else {
      failed++;
      // Attendre avant le prochain retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  return { success, failed };
}

/**
 * Synchronise une queue spécifique
 */
export async function syncQueue(type: QueueType): Promise<{ success: number; failed: number }> {
  const items = await getQueue(type);
  let success = 0;
  let failed = 0;

  for (const item of items) {
    if (item.retries >= MAX_RETRIES) {
      failed++;
      continue;
    }

    const result = await syncItem(item);
    result ? success++ : failed++;
  }

  return { success, failed };
}

/**
 * Hook pour écouter les changements de connexion
 */
export function setupAutoSync(): () => void {
  const handleOnline = async () => {
    console.log('[SyncEngine] Connection restored, syncing...');
    const result = await syncAll();
    console.log(`[SyncEngine] Sync complete: ${result.success} success, ${result.failed} failed`);
  };

  window.addEventListener('online', handleOnline);

  // Sync initial si déjà online
  if (navigator.onLine) {
    syncAll();
  }

  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
