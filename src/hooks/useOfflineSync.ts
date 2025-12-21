import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OfflineData {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  data: any;
  created_at: string;
}

const STORAGE_KEY = "igp_offline_queue";

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

  // Synchroniser les données avec le serveur
  const syncWithServer = useCallback(async () => {
    const queue = getOfflineQueue();
    if (queue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const successfulIds: string[] = [];

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    for (const item of queue) {
      try {
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
      } catch (err) {
        console.error("Sync error for item:", item.id, err);
      }
    }

    // Retirer les items synchronisés de la file
    const remainingQueue = queue.filter((item) => !successfulIds.includes(item.id));
    saveOfflineQueue(remainingQueue);

    if (successfulIds.length > 0) {
      toast.success(`${successfulIds.length} élément(s) synchronisé(s)`);
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
