import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressBase64Image } from "@/lib/imageCompression";
import {
  addToOfflineQueue as addToIndexedDB,
  getOfflineQueue as getFromIndexedDB,
  removeFromQueue,
  updateQueueItem,
  openDB,
} from "@/lib/offlineDB";

interface OfflineItem {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  data: any;
  created_at: string;
  retryCount: number;
  lastRetry?: string;
}

const PHOTO_BUCKET = "merchant-photos";
const MAX_RETRY_COUNT = 5;
const BASE_RETRY_DELAY = 1000; // 1 second

// Convert base64 to Blob
const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(",");
  const contentType = parts[0]?.match(/:(.*?);/)?.[1] || "image/jpeg";
  const byteCharacters = atob(parts[1] || parts[0]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

// Upload photo to storage with retry
const uploadPhotoToStorage = async (
  base64: string,
  merchantId: string,
  type: "cmu" | "location"
): Promise<string | null> => {
  try {
    const compressedBlob = await compressBase64Image(base64);
    const fileName = `${merchantId}/${type}_${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(fileName, compressedBlob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg",
      });

    if (error) {
      console.error("Photo upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(PHOTO_BUCKET)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error("Photo upload failed:", err);
    return null;
  }
};

// Calculate exponential backoff delay
const getRetryDelay = (retryCount: number): number => {
  return Math.min(BASE_RETRY_DELAY * Math.pow(2, retryCount), 30000);
};

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Initialize IndexedDB
  useEffect(() => {
    if (!isInitialized.current) {
      openDB().then(() => {
        isInitialized.current = true;
        refreshPendingCount();
      });
    }
  }, []);

  // Refresh pending count from IndexedDB
  const refreshPendingCount = useCallback(async () => {
    try {
      const queue = await getFromIndexedDB();
      setPendingCount(queue.length);
    } catch (error) {
      console.error("Error getting queue:", error);
    }
  }, []);

  // Add an action to the queue
  const addToQueue = useCallback(async (
    entityType: string, 
    action: string, 
    data: any
  ): Promise<string> => {
    const entityId = data.id || crypto.randomUUID();
    
    const newItem = {
      id: crypto.randomUUID(),
      entity_type: entityType,
      entity_id: entityId,
      action,
      data,
      created_at: new Date().toISOString(),
    };

    try {
      await addToIndexedDB(newItem);
      await refreshPendingCount();
      
      if (!navigator.onLine) {
        toast.info("Données sauvegardées hors-ligne. Synchronisation automatique à la reconnexion.");
      } else {
        // Trigger sync after a short delay
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
          syncWithServer();
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding to queue:", error);
      toast.error("Erreur de sauvegarde locale");
    }
    
    return entityId;
  }, []);

  // Check for conflicts
  const checkConflicts = async (item: OfflineItem): Promise<{ hasConflict: boolean; serverData?: any }> => {
    if (item.entity_type === "merchants" && item.action === "insert") {
      const { data: existing } = await supabase
        .from("merchants")
        .select("id, cmu_number, updated_at")
        .eq("cmu_number", item.data.cmu_number)
        .maybeSingle();
      
      if (existing) {
        return { hasConflict: true, serverData: existing };
      }
    }
    return { hasConflict: false };
  };

  // Sync a single item
  const syncItem = async (item: OfflineItem): Promise<boolean> => {
    try {
      // Check for conflicts
      const { hasConflict, serverData } = await checkConflicts(item);
      
      if (hasConflict) {
        console.warn(`Conflit détecté pour ${item.entity_type}:`, serverData);
        // Server wins strategy - consider synced
        return true;
      }

      if (item.entity_type === "merchants" && item.action === "insert") {
        const merchantData = { ...item.data };
        const merchantId = merchantData.id || item.entity_id;

        // Upload CMU photo
        if (merchantData.cmu_photo_base64?.startsWith("data:")) {
          const url = await uploadPhotoToStorage(
            merchantData.cmu_photo_base64,
            merchantId,
            "cmu"
          );
          merchantData.cmu_photo_url = url;
          delete merchantData.cmu_photo_base64;
        }

        // Upload location photo
        if (merchantData.location_photo_base64?.startsWith("data:")) {
          const url = await uploadPhotoToStorage(
            merchantData.location_photo_base64,
            merchantId,
            "location"
          );
          merchantData.location_photo_url = url;
          delete merchantData.location_photo_base64;
        }

        const { error } = await supabase.from("merchants").insert({
          id: merchantId,
          cmu_number: merchantData.cmu_number,
          full_name: merchantData.full_name,
          phone: merchantData.phone,
          activity_type: merchantData.activity_type,
          activity_description: merchantData.activity_description,
          market_id: merchantData.market_id,
          latitude: merchantData.latitude,
          longitude: merchantData.longitude,
          enrolled_by: merchantData.enrolled_by,
          status: merchantData.status,
          cmu_photo_url: merchantData.cmu_photo_url || null,
          location_photo_url: merchantData.location_photo_url || null,
        });

        if (error) throw error;
        return true;

      } else if (item.entity_type === "transactions" && item.action === "insert") {
        const { error } = await supabase.from("transactions").insert({
          id: item.entity_id,
          merchant_id: item.data.merchant_id,
          amount: item.data.amount,
          transaction_type: item.data.transaction_type,
          reference: item.data.reference,
        });

        if (error) throw error;
        return true;

      } else if (item.entity_type === "invoices" && item.action === "insert") {
        const { error } = await supabase.from("invoices").insert(item.data);
        if (error) throw error;
        return true;

      } else if (item.entity_type === "customer_credits") {
        if (item.action === "insert") {
          const { error } = await supabase.from("customer_credits").insert(item.data);
          if (error) throw error;
        } else if (item.action === "update") {
          const { error } = await supabase
            .from("customer_credits")
            .update(item.data)
            .eq("id", item.entity_id);
          if (error) throw error;
        }
        return true;

      } else {
        // Generic sync via offline_sync table
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          await supabase.from("offline_sync").insert({
            user_id: userData.user.id,
            entity_type: item.entity_type,
            entity_id: item.entity_id,
            action: item.action,
            data: item.data,
            synced: true,
            synced_at: new Date().toISOString(),
          });
        }
        return true;
      }
    } catch (error) {
      console.error("Sync error:", error);
      return false;
    }
  };

  // Main sync function with retry logic
  const syncWithServer = useCallback(async () => {
    if (isSyncing || !navigator.onLine) return;

    setIsSyncing(true);
    
    try {
      const queue = await getFromIndexedDB();
      if (queue.length === 0) {
        setIsSyncing(false);
        return;
      }

      let successCount = 0;
      let failCount = 0;
      let conflictCount = 0;

      for (const item of queue) {
        // Skip items that are in backoff period
        if (item.lastRetry) {
          const lastRetryTime = new Date(item.lastRetry).getTime();
          const backoffDelay = getRetryDelay(item.retryCount);
          if (Date.now() - lastRetryTime < backoffDelay) {
            continue;
          }
        }

        const success = await syncItem(item);

        if (success) {
          await removeFromQueue(item.id);
          successCount++;
        } else {
          // Update retry count and schedule next retry
          if (item.retryCount >= MAX_RETRY_COUNT) {
            // Max retries reached, keep in queue but mark as failed
            failCount++;
          } else {
            await updateQueueItem({
              ...item,
              retryCount: item.retryCount + 1,
              lastRetry: new Date().toISOString(),
            });
            failCount++;
          }
        }
      }

      await refreshPendingCount();

      // Show notifications
      if (successCount > 0) {
        toast.success(`${successCount} élément(s) synchronisé(s)`);
      }
      
      if (conflictCount > 0) {
        toast.warning(`${conflictCount} conflit(s) résolu(s)`);
      }
      
      if (failCount > 0) {
        toast.error(`${failCount} élément(s) en attente de nouvelle tentative`);
        
        // Schedule retry with backoff
        const nextQueue = await getFromIndexedDB();
        if (nextQueue.length > 0) {
          const minRetryDelay = Math.min(
            ...nextQueue.map(item => getRetryDelay(item.retryCount))
          );
          
          syncTimeoutRef.current = setTimeout(() => {
            if (navigator.onLine) {
              syncWithServer();
            }
          }, minRetryDelay);
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Erreur de synchronisation");
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshPendingCount]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connexion rétablie");
      
      // Sync after a short delay to let the network stabilize
      setTimeout(() => {
        syncWithServer();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Vous êtes hors-ligne. Les données seront synchronisées automatiquement.");
      
      // Cancel any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };

    // Listen for service worker sync messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_OFFLINE_DATA') {
        syncWithServer();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    // Initial pending count
    refreshPendingCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
      
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [syncWithServer, refreshPendingCount]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    addToQueue,
    syncWithServer,
    refreshPendingCount,
  };
}
