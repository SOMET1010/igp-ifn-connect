import { useState, useRef } from "react";
import { Camera, X, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PhotoCaptureProps {
  onCapture: (file: File) => void;
  label: string;
  previewUrl?: string;
  className?: string;
}

export function PhotoCapture({ onCapture, label, previewUrl, className }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo ne doit pas dépasser 5 MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onCapture(file);
    }
  };

  const clearPhoto = () => {
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <label className="form-label-lg">{label}</label>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-secondary shadow-forest">
          <img 
            src={preview} 
            alt="Aperçu" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              className="h-10 w-10 rounded-full"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={clearPhoto}
              className="h-10 w-10 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute top-3 right-3">
            <div className="bg-secondary text-secondary-foreground rounded-full p-2">
              <Check className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 flex flex-col items-center justify-center gap-3 hover:bg-muted/50 hover:border-primary transition-all duration-200"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <span className="text-muted-foreground font-medium">Appuyez pour prendre une photo</span>
        </button>
      )}
    </div>
  );
}
