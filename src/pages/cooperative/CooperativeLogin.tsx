import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import OTPInput from '@/components/auth/OTPInput';
import { Phone, ArrowLeft, Loader2, Wheat, UserPlus } from 'lucide-react';
import { z } from 'zod';

const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Numéro de téléphone invalide (10 chiffres)');

type Step = 'phone' | 'otp' | 'register';

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
    try {
      phoneSchema.parse(phone);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un numéro valide (10 chiffres)',
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
    if (otp.length !== 6) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer le code à 6 chiffres',
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
    if (fullName.trim().length < 3) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer le nom de la coopérative',
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      <header className="bg-gradient-to-r from-amber-700 to-amber-600 text-primary-foreground py-6 px-4">
        <div className="flex items-center gap-3">
          {step !== 'phone' && (
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10">
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌾</span>
              <span className="font-bold">Espace Coopérative</span>
            </div>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Plateforme IFN - Commerce Vivrier
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              {step === 'register' ? (
                <UserPlus className="h-10 w-10 text-amber-700" />
              ) : (
                <Wheat className="h-10 w-10 text-amber-700" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {step === 'phone' && 'Connexion Coopérative'}
              {step === 'otp' && 'Vérification OTP'}
              {step === 'register' && 'Créer votre espace'}
            </CardTitle>
            <CardDescription className="text-base">
              {step === 'phone' && 'Entrez votre numéro pour recevoir un code'}
              {step === 'otp' && 'Entrez le code à 6 chiffres envoyé par SMS'}
              {step === 'register' && 'Enregistrez votre coopérative'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
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
                  className="btn-xxl w-full bg-amber-600 hover:bg-amber-700"
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
                  className="btn-xxl w-full bg-amber-600 hover:bg-amber-700"
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
                  className="w-full text-center text-amber-700 font-medium hover:underline"
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
                  className="btn-xxl w-full bg-amber-600 hover:bg-amber-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer mon espace Coopérative'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>Plateforme IFN - © 2024</p>
      </footer>
    </div>
  );
};

export default CooperativeLogin;
