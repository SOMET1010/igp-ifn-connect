import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Save, Loader2, Briefcase, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { PhoneInput } from '@/shared/ui';
import {
  agentProfileEditSchema,
  type AgentProfileData,
  type AgentProfileEditInput,
} from '../../types/profile.types';

interface AgentProfileEditFormProps {
  profile: AgentProfileData | null;
  onSave: (data: AgentProfileEditInput) => Promise<boolean>;
  onCancel: () => void;
  isSaving: boolean;
}

export const AgentProfileEditForm: React.FC<AgentProfileEditFormProps> = ({
  profile,
  onSave,
  onCancel,
  isSaving,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AgentProfileEditInput>({
    resolver: zodResolver(agentProfileEditSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      zone: profile?.zone ?? '',
    },
  });

  const onSubmit = async (data: AgentProfileEditInput) => {
    await onSave(data);
  };

  if (!profile) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Modifier le profil</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Editable Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nom complet *</Label>
          <Input
            id="full_name"
            {...register('full_name')}
            placeholder="Votre nom complet"
            disabled={isSaving}
          />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <PhoneInput
              value={field.value ?? ''}
              onChange={field.onChange}
              label="Téléphone"
              disabled={isSaving}
              error={fieldState.error?.message}
            />
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="zone">Zone d'affectation</Label>
          <Input
            id="zone"
            {...register('zone')}
            placeholder="Ex: Abidjan Nord"
            disabled={isSaving}
          />
          {errors.zone && (
            <p className="text-sm text-destructive">{errors.zone.message}</p>
          )}
        </div>
      </div>

      {/* Read-only Fields */}
      <Card className="bg-muted/50">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground uppercase font-medium">
            Informations non modifiables
          </p>
          <div className="flex items-center gap-3">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Matricule</p>
              <p className="text-sm font-medium text-foreground">{profile.employee_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Organisation</p>
              <p className="text-sm font-medium text-foreground">{profile.organization}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSaving}
        >
          Annuler
        </Button>
        <Button type="submit" className="flex-1" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
