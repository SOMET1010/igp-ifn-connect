import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import OTPInput from '@/components/auth/OTPInput';
import { Phone, Loader2, Wheat, UserPlus } from 'lucide-react';
import { phoneSchema, fullNameSchema, otpSchema, getValidationError } from '@/lib/validationSchemas';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { InstitutionalFooter } from '@/components/shared/InstitutionalFooter';
import { ContextualBanner } from '@/components/shared/ContextualBanner';
import { SecondaryFeatures } from '@/components/shared/SecondaryFeatures';
import { LoginCard } from '@/components/shared/LoginCard';

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
        <LoginCard
          variant="default"
          icon={step === 'register' ? UserPlus : Wheat}
          currentStep={currentStepNumber}
          title={STEPS_CONFIG[step].title}
          subtitle={STEPS_CONFIG[step].subtitle}
          showSecurityNote={true}
        >
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
        </LoginCard>

        {/* Zone informative secondaire */}
        <div className="w-full max-w-md mt-6">
          <SecondaryFeatures variant="default" showInstitutionalNote={true} maxWidth="md" />
        </div>
      </div>

      {/* Footer Institutionnel */}
      <InstitutionalFooter variant="default" showSupportButton={true} maxWidth="2xl" />
    </div>
  );
};

export default CooperativeLogin;
