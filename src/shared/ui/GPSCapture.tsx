import { useState, useRef } from "react";
import { MapPin, Loader2, CheckCircle, RefreshCw, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface GPSCaptureProps {
  onCapture: (coords: { latitude: number; longitude: number }) => void;
  coords?: { latitude: number; longitude: number } | null;
  className?: string;
}

export function GPSCapture({ onCapture, coords, className }: GPSCaptureProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [failCount, setFailCount] = useState(0);
  const attemptRef = useRef(0);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée");
      setShowManualInput(true);
      return;
    }

    setIsLoading(true);
    attemptRef.current += 1;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onCapture({ latitude, longitude });
        setIsLoading(false);
        setFailCount(0);
        toast.success("Position capturée avec succès");
      },
      (error) => {
        setIsLoading(false);
        const newFailCount = failCount + 1;
        setFailCount(newFailCount);

        let message = "Erreur de géolocalisation";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Accès refusé. Autorisez la localisation dans les paramètres.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Position non disponible. Essayez dehors.";
            break;
          case error.TIMEOUT:
            message = "Délai dépassé. Réessayez.";
            break;
        }
        
        toast.error(message);

        // Après 2 échecs, proposer la saisie manuelle
        if (newFailCount >= 2) {
          setShowManualInput(true);
          toast.info("Vous pouvez saisir les coordonnées manuellement");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleManualSubmit = () => {
    const lat = parseFloat(manualLat.replace(',', '.'));
    const lng = parseFloat(manualLng.replace(',', '.'));

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Coordonnées invalides");
      return;
    }

    // Validation basique des plages
    if (lat < -90 || lat > 90) {
      toast.error("Latitude doit être entre -90 et 90");
      return;
    }
    if (lng < -180 || lng > 180) {
      toast.error("Longitude doit être entre -180 et 180");
      return;
    }

    onCapture({ latitude: lat, longitude: lng });
    setShowManualInput(false);
    setManualLat('');
    setManualLng('');
    toast.success("Position enregistrée");
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
      ) : showManualInput ? (
        <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Edit3 className="w-5 h-5" />
            <span className="font-medium">Saisie manuelle des coordonnées</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Entrez les coordonnées GPS (ex: depuis Google Maps)
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="5.345678"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="-3.987654"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleManualSubmit}
              className="flex-1 bg-secondary hover:bg-secondary/90"
              disabled={!manualLat || !manualLng}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Valider
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowManualInput(false);
                captureLocation();
              }}
            >
              <MapPin className="w-4 h-4 mr-1" />
              Réessayer GPS
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
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
          
          {/* Lien pour saisie manuelle */}
          <button
            type="button"
            onClick={() => setShowManualInput(true)}
            className="text-sm text-muted-foreground hover:text-foreground underline w-full text-center"
          >
            Ou saisir manuellement
          </button>
        </div>
      )}
    </div>
  );
}
