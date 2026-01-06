// IndexedDB wrapper for offline data persistence
import type { OfflineItem } from "@/shared/types/offline.types";

const DB_NAME = 'ifn_offline';
const DB_VERSION = 1;

// Re-export types for backward compatibility
export type { OfflineItem };

let dbInstance: IDBDatabase | null = null;

export async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create offline queue store
      if (!db.objectStoreNames.contains('offline_queue')) {
        const store = db.createObjectStore('offline_queue', { keyPath: 'id' });
        store.createIndex('entity_type', 'entity_type', { unique: false });
        store.createIndex('created_at', 'created_at', { unique: false });
      }

      // Create cached data store
      if (!db.objectStoreNames.contains('cached_data')) {
        const cacheStore = db.createObjectStore('cached_data', { keyPath: 'key' });
        cacheStore.createIndex('expires_at', 'expires_at', { unique: false });
      }
    };
  });
}

export async function addToOfflineQueue(item: Omit<OfflineItem, 'retryCount'>): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_queue', 'readwrite');
    const store = transaction.objectStore('offline_queue');
    
    const itemWithRetry: OfflineItem = {
      ...item,
      retryCount: 0,
    };
    
    const request = store.add(itemWithRetry);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getOfflineQueue(): Promise<OfflineItem[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_queue', 'readonly');
    const store = transaction.objectStore('offline_queue');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_queue', 'readwrite');
    const store = transaction.objectStore('offline_queue');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function updateQueueItem(item: OfflineItem): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_queue', 'readwrite');
    const store = transaction.objectStore('offline_queue');
    const request = store.put(item);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function clearQueue(): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offline_queue', 'readwrite');
    const store = transaction.objectStore('offline_queue');
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Cached data functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function setCachedData(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('cached_data', 'readwrite');
    const store = transaction.objectStore('cached_data');
    
    const item = {
      key,
      data,
      expires_at: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString(),
      cached_at: new Date().toISOString(),
    };
    
    const request = store.put(item);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('cached_data', 'readonly');
    const store = transaction.objectStore('cached_data');
    const request = store.get(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      
      if (!result) {
        resolve(null);
        return;
      }
      
      // Check if expired
      if (new Date(result.expires_at) < new Date()) {
        // Delete expired item
        const deleteTransaction = db.transaction('cached_data', 'readwrite');
        deleteTransaction.objectStore('cached_data').delete(key);
        resolve(null);
        return;
      }
      
      resolve(result.data as T);
    };
  });
}

export async function clearExpiredCache(): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('cached_data', 'readwrite');
    const store = transaction.objectStore('cached_data');
    const index = store.index('expires_at');
    const now = new Date().toISOString();
    
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
  });
}
