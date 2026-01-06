import { PhotoCapture } from "@/shared/ui";
import type { EnrollmentData } from "@/features/agent";

interface Step4PhotosProps {
  data: EnrollmentData;
  updateField: <K extends keyof EnrollmentData>(field: K, value: EnrollmentData[K]) => void;
}

export function Step4Photos({ data, updateField }: Step4PhotosProps) {
  const handleCMUPhotoCapture = (file: File) => {
    updateField("cmu_photo_file", file);
    
    // Convert to base64 for offline storage
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("cmu_photo_base64", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLocationPhotoCapture = (file: File) => {
    updateField("location_photo_file", file);
    
    // Convert to base64 for offline storage
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("location_photo_base64", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 px-4">
      <div className="bg-accent/50 rounded-xl p-4 mb-4">
        <p className="text-sm text-muted-foreground">
          📸 Prenez des photos claires et lisibles. La photo de la carte CMU est obligatoire.
        </p>
      </div>

      <PhotoCapture
        label="📋 Photo Carte CMU *"
        onCapture={handleCMUPhotoCapture}
        previewUrl={data.cmu_photo_base64 || undefined}
      />

      <PhotoCapture
        label="🏪 Photo Lieu d'Activité (optionnel)"
        onCapture={handleLocationPhotoCapture}
        previewUrl={data.location_photo_base64 || undefined}
      />
    </div>
  );
}
