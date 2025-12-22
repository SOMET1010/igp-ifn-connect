import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import OTPInput from '@/components/auth/OTPInput';
import { Loader2 } from 'lucide-react';
import { PhoneInput } from '@/components/shared/PhoneInput';
import { phoneSchema, fullNameSchema, otpSchema, getValidationError } from '@/lib/validationSchemas';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { InstitutionalFooter } from '@/components/shared/InstitutionalFooter';
import { LoginCard } from '@/components/shared/LoginCard';

type Step = 'phone' | 'otp' | 'register';

const STEPS_CONFIG: Record<Step, { title: string; subtitle: string }> = {
  phone: { title: 'Connexion Coopérative', subtitle: 'Étape 1 · Numéro de téléphone' },
  otp: { title: 'Vérification', subtitle: 'Étape 2 · Code de sécurité' },
  register: { title: 'Création de compte', subtitle: 'Étape 3 · Informations coopérative' },
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
      title: 'Code OTP envoyé',
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
      title: 'Connexion réussie',
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
      title: 'Compte créé',
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <InstitutionalHeader
        subtitle="Espace Coopérative"
        showBackButton={step !== 'phone'}
        onBack={handleBack}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <LoginCard
          title={STEPS_CONFIG[step].title}
          subtitle={STEPS_CONFIG[step].subtitle}
        >
          {step === 'phone' && (
            <>
              <PhoneInput
                value={phone}
                onChange={setPhone}
                disabled={isLoading}
              />

              <Button
                onClick={handleSendOtp}
                disabled={phone.length !== 10 || isLoading}
                className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Envoi...
                  </>
                ) : (
                  'Recevoir le code OTP'
                )}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="space-y-3">
                <Label className="form-label-lg text-center block">
                  Code de vérification
                </Label>
                <div className="flex justify-center">
                  <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Code envoyé au +225 {phone}
                </p>
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || isLoading}
                className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Vérification...
                  </>
                ) : (
                  'Vérifier le code'
                )}
              </Button>

              <button
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full text-center text-sm text-primary hover:underline"
              >
                Renvoyer le code
              </button>
            </>
          )}

          {step === 'register' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="form-label-lg">
                  Nom de la coopérative
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Coopérative des Vivriers de Bouaké"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-institutional"
                />
              </div>

              <div className="bg-muted rounded-md p-3 text-sm">
                <p className="text-xs text-muted-foreground">Téléphone vérifié</p>
                <p className="font-medium text-foreground">+225 {phone}</p>
              </div>

              <Button
                onClick={handleRegister}
                disabled={fullName.trim().length < 3 || isLoading}
                className="btn-institutional w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Création...
                  </>
                ) : (
                  'Créer mon espace'
                )}
              </Button>
            </>
          )}
        </LoginCard>

        {/* Note institutionnelle */}
        <p className="text-xs text-muted-foreground text-center mt-6 max-w-sm">
          Plateforme opérée par l'ANSUT pour le compte de la DGE
        </p>
      </main>

      <InstitutionalFooter />
    </div>
  );
};

export default CooperativeLogin;
