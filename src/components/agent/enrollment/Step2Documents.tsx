import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhotoCapture } from "@/components/shared/PhotoCapture";
import type { EnrollmentData, IdDocType } from "@/features/agent";
import { ID_DOC_TYPES } from "@/features/agent/types/enrollment.types";

interface Step2DocumentsProps {
  data: EnrollmentData;
  updateField: <K extends keyof EnrollmentData>(field: K, value: EnrollmentData[K]) => void;
}

export function Step2Documents({ data, updateField }: Step2DocumentsProps) {
  
  const handleIdDocPhotoCapture = (file: File) => {
    updateField("id_doc_photo_file", file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("id_doc_photo_base64", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCMUPhotoCapture = (file: File) => {
    updateField("cmu_photo_file", file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("cmu_photo_base64", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 px-4">
      <div className="bg-accent/50 rounded-xl p-4 mb-4">
        <p className="text-sm text-muted-foreground">
          📋 Les documents d'identité permettent de vérifier l'identité du marchand. Prenez des photos claires et lisibles.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold flex items-center gap-2">
          🪪 Type de pièce d'identité *
        </Label>
        <Select
          value={data.id_doc_type}
          onValueChange={(value) => updateField("id_doc_type", value as IdDocType)}
        >
          <SelectTrigger className="h-14 text-lg rounded-xl border-2">
            <SelectValue placeholder="Sélectionnez le type de pièce" />
          </SelectTrigger>
          <SelectContent>
            {ID_DOC_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="id_doc_number" className="text-base font-semibold flex items-center gap-2">
          🔢 Numéro de la pièce *
        </Label>
        <Input
          id="id_doc_number"
          type="text"
          placeholder="Ex: CI123456789"
          value={data.id_doc_number}
          onChange={(e) => updateField("id_doc_number", e.target.value)}
          className="h-14 text-lg rounded-xl border-2 focus:border-primary"
        />
      </div>

      <PhotoCapture
        label="📸 Photo de la pièce d'identité *"
        onCapture={handleIdDocPhotoCapture}
        previewUrl={data.id_doc_photo_base64 || undefined}
      />

      <div className="border-t pt-6">
        <PhotoCapture
          label="📋 Photo de la Carte CMU *"
          onCapture={handleCMUPhotoCapture}
          previewUrl={data.cmu_photo_base64 || undefined}
        />
      </div>
    </div>
  );
}
