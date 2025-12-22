import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import OTPInput from '@/components/auth/OTPInput';
import { Phone, Loader2, Wheat, UserPlus, Lock, Smartphone, Headphones } from 'lucide-react';
import { phoneSchema, fullNameSchema, otpSchema, getValidationError } from '@/lib/validationSchemas';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { InstitutionalFooter } from '@/components/shared/InstitutionalFooter';
import { ContextualBanner } from '@/components/shared/ContextualBanner';

type Step = 'phone' | 'otp' | 'register';

// Messages contextuels selon l'étape
const STEP_BANNERS: Record<Step, { icon: string; message: string }> = {
  phone: { icon: '🌾', message: 'Accès réservé aux coopératives agricoles' },
  otp: { icon: '🔒', message: 'Ne partagez jamais votre code de vérification' },
  register: { icon: '✨', message: 'Créez votre espace coopérative en 30 secondes' },
};

// Configuration du stepper
const STEPS_CONFIG: Record<Step, { number: number; title: string; subtitle: string }> = {
  phone: { number: 1, title: 'Connexion Coopérative', subtitle: 'Étape 1 · Numéro de téléphone' },
  otp: { number: 2, title: 'Vérification OTP', subtitle: 'Étape 2 · Code de sécurité' },
  register: { number: 3, title: 'Créer votre espace', subtitle: 'Étape 3 · Informations coopérative' },
};

const CooperativeLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, isAuthenticated, checkRole } = useAuth();
  
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        const isCooperative = await checkRole('cooperative');
        if (isCooperative) {
          navigate('/cooperative');
        }
      }
    };
    checkAuth();
  }, [isAuthenticated, checkRole, navigate]);

  const generateMockOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    return code;
  };

  const handleSendOtp = async () => {
    const validationError = getValidationError(phoneSchema, phone);
    if (validationError) {
      toast({
        title: 'Erreur',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const code = generateMockOtp();
    toast({
      title: '📱 Code OTP envoyé',
      description: `Code de démonstration: ${code}`,
      duration: 10000,
    });
    
    setStep('otp');
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    const validationError = getValidationError(otpSchema, otp);
    if (validationError) {
      toast({
        title: 'Erreur',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    if (otp !== generatedOtp) {
      toast({
        title: 'Code incorrect',
        description: 'Le code saisi ne correspond pas',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const email = `coop_${phone}@ifn.ci`;
    const password = `coop_${phone}_secure`;
    
    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setStep('register');
      setIsLoading(false);
      return;
    }

    toast({
      title: '✅ Connexion réussie',
      description: 'Bienvenue sur l\'espace Coopérative',
    });
    
    navigate('/cooperative');
    setIsLoading(false);
  };

  const handleRegister = async () => {
    const validationError = getValidationError(fullNameSchema, fullName);
    if (validationError) {
      toast({
        title: 'Erreur',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const email = `coop_${phone}@ifn.ci`;
    const password = `coop_${phone}_secure`;

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        title: 'Erreur d\'inscription',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: '✅ Compte créé',
      description: 'Votre espace coopérative a été créé avec succès',
    });

    navigate('/cooperative');
    setIsLoading(false);
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
    } else if (step === 'register') {
      setStep('otp');
    }
  };

  const currentStepNumber = STEPS_CONFIG[step].number;
  const currentBanner = STEP_BANNERS[step];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Header Institutionnel */}
      <InstitutionalHeader
        subtitle="Espace Coopérative"
        showBackButton={step !== 'phone'}
        onBack={handleBack}
        showOfficialBadge={true}
      />

      {/* Bandeau Contextuel */}
      <ContextualBanner
        icon={currentBanner.icon}
        message={currentBanner.message}
        variant="default"
        maxWidth="2xl"
      />

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md shadow-lg border-2">
          <CardHeader className="text-center pb-2">
            {/* Icône réduite */}
            <div className="mx-auto mb-3 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {step === 'register' ? (
                <UserPlus className="h-8 w-8 text-primary" />
              ) : (
                <Wheat className="h-8 w-8 text-primary" />
              )}
            </div>
            
            {/* Stepper visuel */}
            <div className="flex items-center justify-center gap-2 mb-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    n === currentStepNumber 
                      ? 'bg-primary' 
                      : n < currentStepNumber 
                        ? 'bg-primary/50' 
                        : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            
            <CardTitle className="text-xl sm:text-2xl">
              {STEPS_CONFIG[step].title}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {STEPS_CONFIG[step].subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-2">
            {step === 'phone' && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="form-label-lg">
                    Numéro de téléphone
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      +225
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0701020304"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="form-input-lg pl-16"
                      maxLength={10}
                    />
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <Button
                  onClick={handleSendOtp}
                  disabled={phone.length !== 10 || isLoading}
                  className="btn-xxl w-full bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Recevoir le code OTP'
                  )}
                </Button>
              </>
            )}

            {step === 'otp' && (
              <>
                <div className="space-y-4">
                  <Label className="form-label-lg text-center block">
                    Code de vérification
                  </Label>
                  <div className="flex justify-center">
                    <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    Code envoyé au <span className="font-medium">+225 {phone}</span>
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || isLoading}
                  className="btn-xxl w-full bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    'Vérifier le code'
                  )}
                </Button>

                <button
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full text-center text-primary font-medium hover:underline"
                >
                  Renvoyer le code
                </button>
              </>
            )}

            {step === 'register' && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="form-label-lg">
                    Nom de la coopérative
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Coopérative des Vivriers de Bouaké"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input-lg"
                  />
                </div>

                <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">📱 Téléphone vérifié</p>
                  <p>+225 {phone}</p>
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={fullName.trim().length < 3 || isLoading}
                  className="btn-xxl w-full bg-secondary hover:bg-secondary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Création du compte...
                    </>
                  ) : (
                    'Créer mon espace Coopérative'
                  )}
                </Button>
              </>
            )}

            {/* Note de sécurité */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <Lock className="h-3.5 w-3.5" />
              <span>Connexion chiffrée et sécurisée</span>
            </div>
          </CardContent>
        </Card>

        {/* Zone informative secondaire */}
        <div className="w-full max-w-md mt-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl p-3 text-center shadow-sm border">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs font-medium text-foreground">Sécurisé</p>
              <p className="text-[10px] text-muted-foreground">Données chiffrées</p>
            </div>
            
            <div className="bg-card rounded-xl p-3 text-center shadow-sm border">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Smartphone className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-xs font-medium text-foreground">Officiel</p>
              <p className="text-[10px] text-muted-foreground">Plateforme DGE</p>
            </div>
            
            <div className="bg-card rounded-xl p-3 text-center shadow-sm border">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Headphones className="h-5 w-5 text-accent-foreground" />
              </div>
              <p className="text-xs font-medium text-foreground">Support</p>
              <p className="text-[10px] text-muted-foreground">Assistance 24/7</p>
            </div>
          </div>
          
          {/* Mention institutionnelle */}
          <p className="text-center text-[10px] text-muted-foreground mt-4">
            Plateforme opérée par l'ANSUT pour le compte de la DGE
          </p>
        </div>
      </div>

      {/* Footer Institutionnel */}
      <InstitutionalFooter variant="default" showSupportButton={true} maxWidth="2xl" />
    </div>
  );
};

export default CooperativeLogin;
