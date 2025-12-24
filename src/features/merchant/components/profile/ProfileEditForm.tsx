import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { profileEditSchema, type ProfileEditInput, type MerchantProfileData } from "../../types/profile.types";

interface ProfileEditFormProps {
  profile: MerchantProfileData | null;
  onSave: (data: ProfileEditInput) => Promise<boolean>;
  onCancel: () => void;
  isSaving: boolean;
}

export function ProfileEditForm({ profile, onSave, onCancel, isSaving }: ProfileEditFormProps) {
  const form = useForm<ProfileEditInput>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      activity_type: profile?.activity_type ?? "",
      activity_description: profile?.activity_description ?? "",
    },
  });

  const handleSubmit = async (data: ProfileEditInput) => {
    await onSave(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Modifier le profil</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Votre nom complet"
                    {...field}
                    disabled={isSaving}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="0701234567"
                    {...field}
                    disabled={isSaving}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activity_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'activité</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Commerce de détail"
                    {...field}
                    disabled={isSaving}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activity_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description de l'activité (optionnel)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez votre activité..."
                    className="min-h-[80px] resize-none"
                    {...field}
                    value={field.value ?? ""}
                    disabled={isSaving}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
