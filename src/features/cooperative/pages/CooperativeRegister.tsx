/**
 * Page d'inscription Coopérative
 * Formulaire multi-étapes pour l'enregistrement des nouvelles coopératives
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Building2, 
  MapPin, 
  Users, 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  CheckCircle,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { REGIONS_CI } from '@/features/cooperative/types/profile.types';

interface FormData {
  // Étape 1 - Informations de base
  name: string;
  code: string;
  phone: string;
  email: string;
  // Étape 2 - Localisation
  region: string;
  commune: string;
  address: string;
  // Étape 3 - Détails
  total_members: string;
  igp_certified: boolean;
}

const STEPS = [
  { id: 1, title: 'Informations', icon: Building2 },
  { id: 2, title: 'Localisation', icon: MapPin },
  { id: 3, title: 'Détails', icon: Users },
];

const CooperativeRegister: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    phone: '',
    email: '',
    region: '',
    commune: '',
    address: '',
    total_members: '',
    igp_certified: false,
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          toast.error('Le nom de la coopérative est requis');
          return false;
        }
        if (!formData.code.trim()) {
          toast.error('Le code est requis');
          return false;
        }
        if (!formData.phone.trim()) {
          toast.error('Le téléphone est requis');
          return false;
        }
        return true;
      case 2:
        if (!formData.region) {
          toast.error('La région est requise');
          return false;
        }
        if (!formData.commune.trim()) {
          toast.error('La commune est requise');
          return false;
        }
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);

    try {
      // Vérifier si le code existe déjà
      const { data: existing } = await supabase
        .from('cooperatives')
        .select('id')
        .eq('code', formData.code.toUpperCase())
        .maybeSingle();

      if (existing) {
        toast.error('Ce code de coopérative existe déjà');
        setIsSubmitting(false);
        return;
      }

      // Créer la coopérative
      const { error } = await supabase
        .from('cooperatives')
        .insert({
          name: formData.name.trim(),
          code: formData.code.toUpperCase().trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || null,
          region: formData.region,
          commune: formData.commune.trim(),
          address: formData.address.trim() || null,
          total_members: formData.total_members ? parseInt(formData.total_members) : null,
          igp_certified: formData.igp_certified,
        });

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Demande d\'inscription envoyée !');
    } catch (err) {
      console.error('Erreur inscription:', err);
      toast.error('Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Inscription réussie !</h2>
            <p className="text-muted-foreground mb-6">
              Votre demande d'inscription a été enregistrée. 
              Un administrateur examinera votre demande et vous contactera prochainement.
            </p>
            <Button onClick={() => navigate('/cooperative/login')} className="w-full">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/cooperative/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à la connexion
          </Link>
          <h1 className="text-2xl font-bold">Inscription Coopérative</h1>
          <p className="text-muted-foreground">Plateforme JÙLABA</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={(step / 3) * 100} className="h-2 mb-4" />
          <div className="flex justify-between">
            {STEPS.map((s) => (
              <div 
                key={s.id} 
                className={`flex flex-col items-center ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  step >= s.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <span className="text-xs">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === 1 && <Building2 className="h-5 w-5" />}
              {step === 2 && <MapPin className="h-5 w-5" />}
              {step === 3 && <Users className="h-5 w-5" />}
              {STEPS[step - 1].title}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Informations de base de votre coopérative'}
              {step === 2 && 'Localisation géographique'}
              {step === 3 && 'Informations complémentaires'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Étape 1 - Informations de base */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la coopérative *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Ex: Coopérative Agricole du Sud"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Code (sigle) *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                    placeholder="Ex: COOPASUD"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">Sigle unique de la coopérative (max 10 caractères)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="07 XX XX XX XX"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="contact@cooperative.ci"
                      className="pl-10"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Étape 2 - Localisation */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="region">Région *</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => updateField('region', value)}
                  >
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS_CI.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commune">Commune *</Label>
                  <Input
                    id="commune"
                    value={formData.commune}
                    onChange={(e) => updateField('commune', e.target.value)}
                    placeholder="Ex: Bouaké"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse (optionnel)</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Quartier, rue, repère..."
                  />
                </div>
              </>
            )}

            {/* Étape 3 - Détails */}
            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="total_members">Nombre de membres estimé</Label>
                  <Input
                    id="total_members"
                    type="number"
                    value={formData.total_members}
                    onChange={(e) => updateField('total_members', e.target.value)}
                    placeholder="Ex: 150"
                    min="1"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <Checkbox
                    id="igp_certified"
                    checked={formData.igp_certified}
                    onCheckedChange={(checked) => updateField('igp_certified', !!checked)}
                  />
                  <div>
                    <Label htmlFor="igp_certified" className="cursor-pointer font-medium">
                      Certification IGP
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Cochez si votre coopérative est certifiée Indication Géographique Protégée
                    </p>
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h3 className="font-medium text-sm">Récapitulatif</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Nom:</strong> {formData.name}</p>
                    <p><strong>Code:</strong> {formData.code}</p>
                    <p><strong>Téléphone:</strong> {formData.phone}</p>
                    <p><strong>Localisation:</strong> {formData.commune}, {formData.region}</p>
                  </div>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button onClick={nextStep}>
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Inscription...
                    </>
                  ) : (
                    'Soumettre ma demande'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CooperativeRegister;
