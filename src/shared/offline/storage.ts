/**
 * Offline Storage - Gestion du stockage local
 * 
 * Utilise localStorage/IndexedDB pour la persistance offline
 */

const DB_NAME = 'ifn-offline';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

/**
 * Initialise la base IndexedDB
 */
export async function initOfflineStorage(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Store pour les queues offline
      if (!database.objectStoreNames.contains('queues')) {
        database.createObjectStore('queues', { keyPath: 'id', autoIncrement: true });
      }

      // Store pour le cache de données
      if (!database.objectStoreNames.contains('cache')) {
        database.createObjectStore('cache', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Récupère une valeur du cache
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  const database = await initOfflineStorage();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('cache', 'readonly');
    const store = transaction.objectStore('cache');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.value : null);
    };
  });
}

/**
 * Sauvegarde une valeur dans le cache
 */
export async function setInCache<T>(key: string, value: T): Promise<void> {
  const database = await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('cache', 'readwrite');
    const store = transaction.objectStore('cache');
    const request = store.put({ key, value, updatedAt: Date.now() });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Supprime une valeur du cache
 */
export async function removeFromCache(key: string): Promise<void> {
  const database = await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('cache', 'readwrite');
    const store = transaction.objectStore('cache');
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Vide tout le cache
 */
export async function clearCache(): Promise<void> {
  const database = await initOfflineStorage();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('cache', 'readwrite');
    const store = transaction.objectStore('cache');
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
