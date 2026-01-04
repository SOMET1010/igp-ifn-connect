/**
 * Offline Queues - Gestion des actions en attente
 * 
 * Permet d'empiler des actions quand l'utilisateur est offline
 * pour les synchroniser quand la connexion revient
 */

import { initOfflineStorage } from './storage';

// Types de queues supportées
export type QueueType = 'sales' | 'stock' | 'products' | 'transactions' | 'orders';

// Structure d'un élément de queue
export interface QueueItem<T = unknown> {
  id?: number;
  type: QueueType;
  action: 'create' | 'update' | 'delete';
  payload: T;
  timestamp: number;
  retries: number;
  lastError?: string;
}

/**
 * Ajoute un élément à la queue
 */
export async function enqueue<T>(
  type: QueueType, 
  action: QueueItem['action'], 
  payload: T
): Promise<number> {
  const database = await initOfflineStorage();

  const item: QueueItem<T> = {
    type,
    action,
    payload,
    timestamp: Date.now(),
    retries: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('queues', 'readwrite');
    const store = transaction.objectStore('queues');
    const request = store.add(item);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as number);
  });
}

/**
 * Récupère tous les éléments d'une queue
 */
export async function getQueue(type?: QueueType): Promise<QueueItem[]> {
  const database = await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('queues', 'readonly');
    const store = transaction.objectStore('queues');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const items = request.result as QueueItem[];
      resolve(type ? items.filter(item => item.type === type) : items);
    };
  });
}

/**
 * Supprime un élément de la queue
 */
export async function dequeue(id: number): Promise<void> {
  const database = await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('queues', 'readwrite');
    const store = transaction.objectStore('queues');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Met à jour un élément de la queue (après échec)
 */
export async function updateQueueItem(
  id: number, 
  updates: Partial<QueueItem>
): Promise<void> {
  const database = await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('queues', 'readwrite');
    const store = transaction.objectStore('queues');
    const getRequest = store.get(id);

    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const item = getRequest.result;
      if (!item) {
        reject(new Error(`Queue item ${id} not found`));
        return;
      }

      const updateRequest = store.put({ ...item, ...updates });
      updateRequest.onerror = () => reject(updateRequest.error);
      updateRequest.onsuccess = () => resolve();
    };
  });
}

/**
 * Compte le nombre d'éléments en attente
 */
export async function getQueueCount(type?: QueueType): Promise<number> {
  const items = await getQueue(type);
  return items.length;
}

/**
 * Vide une queue spécifique ou toutes les queues
 */
export async function clearQueue(type?: QueueType): Promise<void> {
  if (!type) {
    const database = await initOfflineStorage();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('queues', 'readwrite');
      const store = transaction.objectStore('queues');
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Supprimer uniquement les éléments du type spécifié
  const items = await getQueue(type);
  await Promise.all(items.map(item => item.id && dequeue(item.id)));
}
