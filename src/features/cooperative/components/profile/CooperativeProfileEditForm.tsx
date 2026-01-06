import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Edit2, MapPin, Save, X } from 'lucide-react';
import { GPSCapture, PhoneInput } from '@/shared/ui';
import { MiniMap } from '@/features/agent/components/MiniMap';
import { REGIONS_CI, type CooperativeProfileFormData } from '../../types/profile.types';

interface CooperativeProfileEditFormProps {
  formData: CooperativeProfileFormData;
  isSaving: boolean;
  onUpdateField: <K extends keyof CooperativeProfileFormData>(
    field: K,
    value: CooperativeProfileFormData[K]
  ) => void;
  onGPSCapture: (coords: { latitude: number; longitude: number }) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CooperativeProfileEditForm: React.FC<CooperativeProfileEditFormProps> = ({
  formData,
  isSaving,
  onUpdateField,
  onGPSCapture,
  onSave,
  onCancel,
}) => {
  return (
    <>
      {/* Edit form */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Modifier les informations
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="region">Région *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => onUpdateField('region', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une région" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS_CI.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commune">Commune *</Label>
              <Input
                id="commune"
                value={formData.commune}
                onChange={(e) => onUpdateField('commune', e.target.value)}
                placeholder="Nom de la commune"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => onUpdateField('address', e.target.value)}
                placeholder="Adresse complète"
                rows={2}
              />
            </div>

            <PhoneInput
              id="phone"
              label="Téléphone"
              value={formData.phone}
              onChange={(value) => onUpdateField('phone', value)}
              placeholder="XX XX XX XX XX"
            />

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onUpdateField('email', e.target.value)}
                placeholder="email@exemple.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GPS Section */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Position GPS
          </h3>

          <GPSCapture
            onCapture={onGPSCapture}
            coords={formData.latitude && formData.longitude ? {
              latitude: formData.latitude,
              longitude: formData.longitude
            } : undefined}
          />

          {formData.latitude && formData.longitude && (
            <div className="h-40 rounded-xl overflow-hidden">
              <MiniMap
                latitude={formData.latitude}
                longitude={formData.longitude}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save/Cancel buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button
          className="flex-1"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>
    </>
  );
};
