import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseMascotImageReturn {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer l'image de la mascotte Tantie Sagesse depuis le storage
 * Avec cache localStorage et fallback gracieux
 */
export function useMascotImage(): UseMascotImageReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const CACHE_KEY = "tantie-sagesse-image-url";
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

  const fetchMascotImage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Vérifier le cache d'abord
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { url, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setImageUrl(url);
          setIsLoading(false);
          return;
        }
      }

      // Lister les fichiers dans le bucket mascots
      const { data: files, error: listError } = await supabase.storage
        .from("mascots")
        .list("", {
          limit: 10,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (listError) {
        console.error("Error listing mascot files:", listError);
        throw listError;
      }

      // Trouver le fichier tantie-sagesse le plus récent
      const mascotFile = files?.find((f) =>
        f.name.toLowerCase().includes("tantie-sagesse")
      );

      if (!mascotFile) {
        console.log("No mascot image found in storage");
        setImageUrl(null);
        setIsLoading(false);
        return;
      }

      // Obtenir l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from("mascots")
        .getPublicUrl(mascotFile.name);

      const url = publicUrlData.publicUrl;

      // Mettre en cache
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ url, timestamp: Date.now() })
      );

      setImageUrl(url);
    } catch (err) {
      console.error("Error fetching mascot image:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setImageUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMascotImage();
  }, []);

  return {
    imageUrl,
    isLoading,
    error,
    refetch: fetchMascotImage,
  };
}
