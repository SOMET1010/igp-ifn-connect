import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { EnrollmentData } from "@/features/agent";
import { VoiceInput } from "@/components/shared/VoiceInput";
import { useLanguage } from "@/contexts/LanguageContext";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
}

interface Step2ActivityProps {
  data: EnrollmentData;
  updateField: <K extends keyof EnrollmentData>(field: K, value: EnrollmentData[K]) => void;
}

const defaultCategories: Category[] = [
  { id: "1", name: "Légumes", icon: "🥬", color: "#22c55e" },
  { id: "2", name: "Fruits", icon: "🍌", color: "#eab308" },
  { id: "3", name: "Céréales", icon: "🌾", color: "#f59e0b" },
  { id: "4", name: "Poisson", icon: "🐟", color: "#3b82f6" },
  { id: "5", name: "Viande", icon: "🥩", color: "#ef4444" },
  { id: "6", name: "Épices", icon: "🌶️", color: "#dc2626" },
  { id: "7", name: "Tubercules", icon: "🥔", color: "#a3a3a3" },
  { id: "8", name: "Huiles", icon: "🫒", color: "#84cc16" },
];

export function Step2Activity({ data, updateField }: Step2ActivityProps) {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const { language } = useLanguage();

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

  return (
    <div className="space-y-6 px-4">
      <div className="space-y-3">
        <Label className="text-base font-semibold">
          🏪 Type d'activité
        </Label>
        <p className="text-sm text-muted-foreground">
          Sélectionnez le type principal de produits vendus
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const isSelected = data.activity_type === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateField("activity_type", cat.name)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                )}
              >
                <span className="text-4xl mb-2">{cat.icon || "📦"}</span>
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="activity_description" className="text-base font-semibold flex items-center gap-2">
          📝 Description (optionnel)
        </Label>
        <div className="flex gap-2">
          <Textarea
            id="activity_description"
            placeholder="Décrivez l'activité du marchand en quelques mots..."
            value={data.activity_description}
            onChange={(e) => updateField("activity_description", e.target.value)}
            className="min-h-24 text-base rounded-xl border-2 focus:border-primary resize-none flex-1"
          />
          <VoiceInput
            language={language}
            onResult={(text) => updateField("activity_description", 
              data.activity_description ? `${data.activity_description} ${text}` : text
            )}
          />
        </div>
      </div>
    </div>
  );
}
