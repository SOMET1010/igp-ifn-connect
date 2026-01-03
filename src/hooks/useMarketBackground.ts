import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "market_background_url";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

interface CachedBackground {
  url: string;
  timestamp: number;
}

/**
 * Hook pour récupérer l'image de fond du marché depuis le bucket "backgrounds"
 * Avec cache localStorage de 24h
 */
export function useMarketBackground() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBackground = async () => {
      try {
        // Vérifier le cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedBackground = JSON.parse(cached);
          const isValid = Date.now() - parsed.timestamp < CACHE_DURATION;
          if (isValid && parsed.url) {
            setImageUrl(parsed.url);
            setIsLoading(false);
            return;
          }
        }

        // Récupérer la liste des fichiers du bucket "backgrounds"
        const { data: files, error: listError } = await supabase.storage
          .from("backgrounds")
          .list("", {
            limit: 10,
            sortBy: { column: "created_at", order: "desc" },
          });

        if (listError) {
          console.error("Error listing backgrounds:", listError);
          setError(listError.message);
          setIsLoading(false);
          return;
        }

        // Trouver le fichier market-background le plus récent
        const marketFile = files?.find((f) =>
          f.name.startsWith("market-background-")
        );

        if (!marketFile) {
          console.log("No market background found in bucket");
          setIsLoading(false);
          return;
        }

        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from("backgrounds")
          .getPublicUrl(marketFile.name);

        const url = urlData.publicUrl;

        // Mettre en cache
        const cacheData: CachedBackground = {
          url,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        setImageUrl(url);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching market background:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    };

    fetchBackground();
  }, []);

  // Fonction pour forcer le rafraîchissement
  const refresh = () => {
    localStorage.removeItem(CACHE_KEY);
    setIsLoading(true);
    setError(null);
    // Le useEffect se relancera
  };

  return {
    imageUrl,
    isLoading,
    error,
    refresh,
  };
}
