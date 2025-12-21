import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressBase64Image } from "@/lib/imageCompression";

interface OfflineData {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  data: any;
  created_at: string;
}

const STORAGE_KEY = "igp_offline_queue";
const PHOTO_BUCKET = "merchant-photos";

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

// Upload photo to storage and return public URL (with compression)
const uploadPhotoToStorage = async (
  base64: string,
  merchantId: string,
  type: "cmu" | "location"
): Promise<string | null> => {
  try {
    // Compress the image before upload
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

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Charger la file d'attente depuis le localStorage
  const getOfflineQueue = (): OfflineData[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // Sauvegarder la file d'attente
  const saveOfflineQueue = (queue: OfflineData[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    setPendingCount(queue.length);
  };

  // Ajouter une action à la file d'attente
  const addToQueue = useCallback((entityType: string, action: string, data: any) => {
    const queue = getOfflineQueue();
    const newItem: OfflineData = {
      id: crypto.randomUUID(),
      entity_type: entityType,
      entity_id: data.id || crypto.randomUUID(),
      action,
      data,
      created_at: new Date().toISOString(),
    };
    queue.push(newItem);
    saveOfflineQueue(queue);
    
    if (!navigator.onLine) {
      toast.info("Données sauvegardées hors-ligne. Synchronisation automatique à la reconnexion.");
    }
    
    return newItem.entity_id;
  }, []);

  // Vérifier les conflits potentiels
  const checkConflicts = async (item: OfflineData): Promise<{ hasConflict: boolean; serverData?: any }> => {
    if (item.entity_type === "merchants" && item.action === "insert") {
      // Vérifier si un marchand avec le même numéro CMU existe déjà
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

  // Synchroniser les données avec le serveur
  const syncWithServer = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const successfulIds: string[] = [];
    const conflictItems: OfflineData[] = [];
    const failedItems: OfflineData[] = [];

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    for (const item of queue) {
      try {
        // Vérifier les conflits
        const { hasConflict, serverData } = await checkConflicts(item);
        
        if (hasConflict) {
          console.warn(`Conflit détecté pour ${item.entity_type}:`, serverData);
          conflictItems.push(item);
          // On garde l'item serveur (stratégie "server wins")
          successfulIds.push(item.id);
          continue;
        }

        // Handle merchant insertions with photo uploads
        if (item.entity_type === "merchants" && item.action === "insert") {
          const merchantData = { ...item.data };
          const merchantId = merchantData.id || item.entity_id;

          // Upload CMU photo if it's base64
          if (merchantData.cmu_photo_base64?.startsWith("data:")) {
            const url = await uploadPhotoToStorage(
              merchantData.cmu_photo_base64,
              merchantId,
              "cmu"
            );
            merchantData.cmu_photo_url = url;
            delete merchantData.cmu_photo_base64;
          }

          // Upload location photo if it's base64
          if (merchantData.location_photo_base64?.startsWith("data:")) {
            const url = await uploadPhotoToStorage(
              merchantData.location_photo_base64,
              merchantId,
              "location"
            );
            merchantData.location_photo_url = url;
            delete merchantData.location_photo_base64;
          }

          // Insert merchant into database
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

          if (error) {
            console.error("Merchant insert error:", error);
            failedItems.push(item);
            continue;
          }

          successfulIds.push(item.id);
        } else if (item.entity_type === "transactions" && item.action === "insert") {
          // Sync des transactions
          const { error } = await supabase.from("transactions").insert({
            id: item.entity_id,
            merchant_id: item.data.merchant_id,
            amount: item.data.amount,
            transaction_type: item.data.transaction_type,
            reference: item.data.reference,
          });

          if (error) {
            console.error("Transaction insert error:", error);
            failedItems.push(item);
            continue;
          }

          successfulIds.push(item.id);
        } else {
          // Generic sync for other entity types
          if (userId) {
            await supabase.from("offline_sync").insert({
              user_id: userId,
              entity_type: item.entity_type,
              entity_id: item.entity_id,
              action: item.action,
              data: item.data,
              synced: true,
              synced_at: new Date().toISOString(),
            });
          }
          successfulIds.push(item.id);
        }
      } catch (err) {
        console.error("Sync error for item:", item.id, err);
        failedItems.push(item);
      }
    }

    // Retirer les items synchronisés de la file
    const remainingQueue = queue.filter((item) => !successfulIds.includes(item.id));
    saveOfflineQueue(remainingQueue);

    // Notifications de résultat
    if (successfulIds.length > 0) {
      toast.success(`${successfulIds.length} élément(s) synchronisé(s)`);
    }
    
    if (conflictItems.length > 0) {
      toast.warning(`${conflictItems.length} conflit(s) résolu(s) (données serveur conservées)`);
    }
    
    if (failedItems.length > 0) {
      toast.error(`${failedItems.length} élément(s) non synchronisé(s). Nouvelle tentative à la prochaine connexion.`);
    }

    setIsSyncing(false);
  }, [isSyncing]);

  // Écouter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connexion rétablie");
      syncWithServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Vous êtes hors-ligne. Les données seront synchronisées automatiquement.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Charger le compte initial
    setPendingCount(getOfflineQueue().length);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncWithServer]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    addToQueue,
    syncWithServer,
  };
}
