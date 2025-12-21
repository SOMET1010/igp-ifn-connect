import { useState } from "react";
import { MapPin, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GPSCaptureProps {
  onCapture: (coords: { latitude: number; longitude: number }) => void;
  coords?: { latitude: number; longitude: number } | null;
  className?: string;
}

export function GPSCapture({ onCapture, coords, className }: GPSCaptureProps) {
  const [isLoading, setIsLoading] = useState(false);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par ce navigateur");
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onCapture({ latitude, longitude });
        setIsLoading(false);
        toast.success("Position capturée avec succès");
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Accès à la localisation refusé. Veuillez autoriser l'accès.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Position non disponible");
            break;
          case error.TIMEOUT:
            toast.error("Délai de localisation dépassé");
            break;
          default:
            toast.error("Erreur de géolocalisation");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="form-label-lg">📍 Position GPS</label>
      
      {coords ? (
        <div className="rounded-2xl border-2 border-secondary bg-secondary/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-secondary" />
              <span className="font-medium text-secondary">Position capturée</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={captureLocation}
              disabled={isLoading}
            >
              <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
              Actualiser
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Latitude</span>
              <p className="font-mono font-medium">{coords.latitude.toFixed(6)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Longitude</span>
              <p className="font-mono font-medium">{coords.longitude.toFixed(6)}</p>
            </div>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          onClick={captureLocation}
          disabled={isLoading}
          className="w-full btn-xxl bg-gradient-forest hover:opacity-90"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Localisation en cours...
            </>
          ) : (
            <>
              <MapPin className="w-6 h-6 mr-2" />
              Capturer ma position
            </>
          )}
        </Button>
      )}
    </div>
  );
}
