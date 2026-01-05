import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { newPromotionSchema, type NewPromotionInput } from "../../types/promotions.types";

interface AddPromotionDialogProps {
  onSubmit: (input: NewPromotionInput) => Promise<boolean>;
}

const initialFormState = {
  name: "",
  description: "",
  discount_type: "percentage" as const,
  discount_value: "",
  min_purchase: "",
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
};

export function AddPromotionDialog({ onSubmit }: AddPromotionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setErrors({});

    const parsed = newPromotionSchema.safeParse({
      name: form.name,
      description: form.description || undefined,
      discount_type: form.discount_type,
      discount_value: form.discount_value ? parseFloat(form.discount_value) : 0,
      min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : null,
      start_date: form.start_date,
      end_date: form.end_date,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit(parsed.data);
    setIsSubmitting(false);

    if (success) {
      setForm(initialFormState);
      setIsOpen(false);
    }
  };

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-14 text-lg font-semibold rounded-xl shadow-pnavim-primary">
          <Plus className="w-5 h-5 mr-2" /> Nouvelle promotion
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une promotion</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-medium">Nom de la promotion *</Label>
            <Input
              placeholder="Ex: Soldes de fin d'année"
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              className={`mt-1 ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              placeholder="Décrivez votre offre..."
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              className={`mt-1 ${errors.description ? "border-destructive" : ""}`}
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium">Type de réduction</Label>
            <Select value={form.discount_type} onValueChange={(v) => updateForm("discount_type", v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Valeur de la réduction *{form.discount_type === "percentage" ? " (%)" : " (FCFA)"}
            </Label>
            <Input
              type="number"
              placeholder={form.discount_type === "percentage" ? "10" : "500"}
              value={form.discount_value}
              onChange={(e) => updateForm("discount_value", e.target.value)}
              className={`mt-1 ${errors.discount_value ? "border-destructive" : ""}`}
            />
            {errors.discount_value && <p className="text-xs text-destructive mt-1">{errors.discount_value}</p>}
          </div>

          <div>
            <Label className="text-sm font-medium">Achat minimum (FCFA)</Label>
            <Input
              type="number"
              placeholder="5000"
              value={form.min_purchase}
              onChange={(e) => updateForm("min_purchase", e.target.value)}
              className={`mt-1 ${errors.min_purchase ? "border-destructive" : ""}`}
            />
            {errors.min_purchase && <p className="text-xs text-destructive mt-1">{errors.min_purchase}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Date début *</Label>
              <Input
                type="date"
                value={form.start_date}
                onChange={(e) => updateForm("start_date", e.target.value)}
                className={`mt-1 ${errors.start_date ? "border-destructive" : ""}`}
              />
              {errors.start_date && <p className="text-xs text-destructive mt-1">{errors.start_date}</p>}
            </div>
            <div>
              <Label className="text-sm font-medium">Date fin *</Label>
              <Input
                type="date"
                value={form.end_date}
                onChange={(e) => updateForm("end_date", e.target.value)}
                className={`mt-1 ${errors.end_date ? "border-destructive" : ""}`}
              />
              {errors.end_date && <p className="text-xs text-destructive mt-1">{errors.end_date}</p>}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 text-lg">
            {isSubmitting ? "Création..." : "Créer la promotion"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
