import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Loader2,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Award,
  Users,
  Hash,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { NotificationToggle } from '@/components/shared/NotificationToggle';
import { UnifiedHeader } from '@/components/shared/UnifiedHeader';
import { UnifiedBottomNav } from '@/components/shared/UnifiedBottomNav';
import { cooperativeNavItems } from '@/config/navigation';
import { GPSCapture } from '@/components/shared/GPSCapture';
import { MiniMap } from '@/components/agent/MiniMap';

interface CooperativeData {
  id: string;
  name: string;
  code: string;
  region: string;
  commune: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  igp_certified?: boolean;
  total_members: number;
  latitude: number | null;
  longitude: number | null;
}

interface FormData {
  address: string;
  region: string;
  commune: string;
  phone: string;
  email: string;
  latitude: number | null;
  longitude: number | null;
}

const REGIONS = [
  'Abidjan', 'Abengourou', 'Adzopé', 'Agboville', 'Bondoukou', 
  'Bongouanou', 'Bouaflé', 'Bouaké', 'Bouna', 'Dabou', 
  'Daloa', 'Dimbokro', 'Divo', 'Ferkessédougou', 'Gagnoa', 
  'Korhogo', 'Man', 'Odienné', 'San-Pédro', 'Yamoussoukro'
];

const CooperativeProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [cooperative, setCooperative] = useState<CooperativeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    address: '',
    region: '',
    commune: '',
    phone: '',
    email: '',
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: coopData } = await supabase
        .from('cooperatives')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (coopData) {
        setCooperative(coopData);
        setFormData({
          address: coopData.address || '',
          region: coopData.region || '',
          commune: coopData.commune || '',
          phone: coopData.phone || '',
          email: coopData.email || '',
          latitude: coopData.latitude,
          longitude: coopData.longitude,
        });
      }

      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/cooperative/login');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (cooperative) {
      setFormData({
        address: cooperative.address || '',
        region: cooperative.region || '',
        commune: cooperative.commune || '',
        phone: cooperative.phone || '',
        email: cooperative.email || '',
        latitude: cooperative.latitude,
        longitude: cooperative.longitude,
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!cooperative) return;

    // Validation
    if (!formData.region) {
      toast.error('La région est obligatoire');
      return;
    }
    if (!formData.commune) {
      toast.error('La commune est obligatoire');
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Format d\'email invalide');
      return;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Le téléphone doit contenir 10 chiffres');
      return;
    }

    setIsSaving(true);

    const { error } = await supabase
      .from('cooperatives')
      .update({
        address: formData.address || null,
        region: formData.region,
        commune: formData.commune,
        phone: formData.phone || null,
        email: formData.email || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
      })
      .eq('id', cooperative.id);

    setIsSaving(false);

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error('Update error:', error);
      return;
    }

    // Update local state
    setCooperative({
      ...cooperative,
      address: formData.address || null,
      region: formData.region,
      commune: formData.commune,
      phone: formData.phone || null,
      email: formData.email || null,
      latitude: formData.latitude,
      longitude: formData.longitude,
    });

    toast.success('Informations mises à jour');
    setIsEditing(false);
  };

  const handleGPSCapture = (coords: { latitude: number; longitude: number }) => {
    setFormData(prev => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <UnifiedHeader
        title="Profil Coopérative"
        subtitle="Informations et paramètres"
        showBack
        backTo="/cooperative"
        rightContent={
          !isEditing ? (
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit2 className="h-5 w-5" />
            </Button>
          ) : null
        }
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Profile header */}
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-4xl">🌾</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {cooperative?.name}
            </h2>
            {cooperative?.igp_certified && (
              <Badge className="bg-primary/20 text-primary mb-2">
                <Award className="w-4 h-4 mr-1" />
                Certifié IGP
              </Badge>
            )}
            <p className="text-muted-foreground">
              {cooperative?.commune}, {cooperative?.region}
            </p>
          </CardContent>
        </Card>

        {/* Edit form or view mode */}
        {isEditing ? (
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
                      onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une région" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((region) => (
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
                      onChange={(e) => setFormData(prev => ({ ...prev, commune: e.target.value }))}
                      placeholder="Nom de la commune"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Adresse complète"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="0X XX XX XX XX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                  onCapture={handleGPSCapture}
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
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
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
        ) : (
          <>
            {/* View mode - Details */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>📋</span> Informations
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Code coopérative</p>
                      <p className="font-medium text-foreground">{cooperative?.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Localisation</p>
                      <p className="font-medium text-foreground">
                        {cooperative?.address || `${cooperative?.commune}, ${cooperative?.region}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre de membres</p>
                      <p className="font-medium text-foreground">{cooperative?.total_members ?? 0} membres</p>
                    </div>
                  </div>

                  {cooperative?.phone && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="font-medium text-foreground">+225 {cooperative.phone}</p>
                      </div>
                    </div>
                  )}

                  {cooperative?.email && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">{cooperative.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* GPS position view */}
            {cooperative?.latitude && cooperative?.longitude && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Position GPS
                  </h3>
                  <div className="h-40 rounded-xl overflow-hidden">
                    <MiniMap
                      latitude={cooperative.latitude}
                      longitude={cooperative.longitude}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {cooperative.latitude.toFixed(6)}, {cooperative.longitude.toFixed(6)}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* IGP Status */}
            <Card className={cooperative?.igp_certified ? 'border-2 border-primary/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    cooperative?.igp_certified ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Award className={`h-6 w-6 ${
                      cooperative?.igp_certified ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Certification IGP
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {cooperative?.igp_certified 
                        ? 'Votre coopérative est certifiée IGP' 
                        : 'Non certifié - Contactez la DGE pour la certification'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Notifications */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Notifications</h3>
            <NotificationToggle className="w-full" />
          </CardContent>
        </Card>

        {/* Logout button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Se déconnecter
        </Button>

        <p className="text-center text-xs text-muted-foreground pt-4">
          Plateforme IFN - © 2024
        </p>
      </div>

      <UnifiedBottomNav items={cooperativeNavItems} />
    </div>
  );
};

export default CooperativeProfile;
