import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { VoiceInput, PhotoCapture } from "@/shared/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import type { EnrollmentData } from "@/features/agent";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface Step4ActivityProps {
  data: EnrollmentData;
  updateField: <K extends keyof EnrollmentData>(field: K, value: EnrollmentData[K]) => void;
}

const defaultCategories: Category[] = [
  { id: "legumes", name: "Légumes", icon: "🥬", color: "#22c55e" },
  { id: "fruits", name: "Fruits", icon: "🍊", color: "#f97316" },
  { id: "viandes", name: "Viandes", icon: "🍖", color: "#ef4444" },
  { id: "poissons", name: "Poissons", icon: "🐟", color: "#3b82f6" },
  { id: "cereales", name: "Céréales", icon: "🌾", color: "#eab308" },
  { id: "epices", name: "Épices", icon: "🌶️", color: "#dc2626" },
  { id: "autre", name: "Autre", icon: "📦", color: "#6b7280" },
];

export function Step4Activity({ data, updateField }: Step4ActivityProps) {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: cats } = await supabase
        .from("product_categories")
        .select("id, name, icon, color")
        .order("name");
      
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    };
    fetchCategories();
  }, []);

  const handleLocationPhotoCapture = (file: File) => {
    updateField("location_photo_file", file);
    
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
          🏪 Renseignez l'activité du marchand et sa couverture sociale.
        </p>
      </div>

      {/* Activity Type */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          🛒 Type d'activité *
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateField("activity_type", cat.name)}
              className={`
                p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all
                ${data.activity_type === cat.name 
                  ? "border-primary bg-primary/10 shadow-sm" 
                  : "border-border hover:border-primary/50"
                }
              `}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-medium text-center">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-base font-semibold flex items-center gap-2">
          📝 Description (optionnel)
        </Label>
        <div className="flex gap-2">
          <Textarea
            placeholder="Décrivez l'activité du marchand..."
            value={data.activity_description}
            onChange={(e) => updateField("activity_description", e.target.value)}
            className="min-h-[80px] rounded-xl border-2 resize-none"
          />
          <VoiceInput
            language={language}
            onResult={(text) => 
              updateField("activity_description", 
                data.activity_description ? `${data.activity_description} ${text}` : text
              )
            }
            className="h-14"
          />
        </div>
      </div>

      {/* CNPS Section */}
      <div className="border-t pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              🏛️ Couverture CNPS
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Le marchand est-il inscrit à la CNPS ?
            </p>
          </div>
          <Switch
            checked={data.has_cnps}
            onCheckedChange={(checked) => {
              updateField("has_cnps", checked);
              if (!checked) {
                updateField("cnps_number", "");
              }
            }}
          />
        </div>

        {data.has_cnps && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <Label htmlFor="cnps_number" className="text-sm font-medium">
              Numéro CNPS *
            </Label>
            <Input
              id="cnps_number"
              type="text"
              placeholder="Ex: CNPS-123456"
              value={data.cnps_number}
              onChange={(e) => updateField("cnps_number", e.target.value)}
              className="h-12 rounded-xl border-2 focus:border-primary"
            />
          </div>
        )}
      </div>

      {/* Location Photo */}
      <div className="border-t pt-6">
        <PhotoCapture
          label="🏪 Photo du lieu d'activité (optionnel)"
          onCapture={handleLocationPhotoCapture}
          previewUrl={data.location_photo_base64 || undefined}
        />
      </div>
    </div>
  );
}
