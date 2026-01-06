import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GPSCapture } from "@/shared/ui";
import { MiniMap } from "@/features/agent/components/MiniMap";
import { supabase } from "@/integrations/supabase/client";
import type { EnrollmentData } from "@/features/agent";

interface Market {
  id: string;
  name: string;
  commune: string;
  region: string;
}

interface Step3LocationProps {
  data: EnrollmentData;
  updateField: <K extends keyof EnrollmentData>(field: K, value: EnrollmentData[K]) => void;
}

export function Step3Location({ data, updateField }: Step3LocationProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      const { data: marketsData } = await supabase
        .from("markets")
        .select("id, name, commune, region")
        .order("name");
      
      if (marketsData) {
        setMarkets(marketsData);
      }
      setIsLoading(false);
    };
    fetchMarkets();
  }, []);

  const handleGPSCapture = (coords: { latitude: number; longitude: number }) => {
    updateField("latitude", coords.latitude);
    updateField("longitude", coords.longitude);
  };

  const selectedMarket = markets.find((m) => m.id === data.market_id);

  return (
    <div className="space-y-6 px-4">
      <div className="space-y-2">
        <Label className="text-base font-semibold flex items-center gap-2">
          🏪 Marché
        </Label>
        <Select
          value={data.market_id}
          onValueChange={(value) => updateField("market_id", value)}
        >
          <SelectTrigger className="h-14 text-lg rounded-xl border-2">
            <SelectValue placeholder="Sélectionnez un marché" />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Chargement...
              </SelectItem>
            ) : (
              markets.map((market) => (
                <SelectItem key={market.id} value={market.id}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{market.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {market.commune}, {market.region}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {selectedMarket && (
          <p className="text-sm text-muted-foreground">
            📍 {selectedMarket.commune}, {selectedMarket.region}
          </p>
        )}
      </div>

      <GPSCapture
        onCapture={handleGPSCapture}
        coords={
          data.latitude && data.longitude
            ? { latitude: data.latitude, longitude: data.longitude }
            : null
        }
      />

      {data.latitude && data.longitude && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            🗺️ Aperçu de la position
          </Label>
          <MiniMap latitude={data.latitude} longitude={data.longitude} />
        </div>
      )}
    </div>
  );
}
