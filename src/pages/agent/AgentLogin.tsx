import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import OTPInput from '@/components/auth/OTPInput';
import { Loader2, RefreshCw } from 'lucide-react';
import { PhoneInput } from '@/components/shared/PhoneInput';
import { phoneSchema, fullNameSchema, otpSchema, getValidationError } from '@/lib/validationSchemas';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { InstitutionalFooter } from '@/components/shared/InstitutionalFooter';
import { LoginCard } from '@/components/shared/LoginCard';
import { useRetryOperation } from '@/hooks/useRetryOperation';
import { authLogger } from '@/infra/logger';
import { supabase } from '@/integrations/supabase/client';

type Step = 'phone' | 'otp' | 'register';

const STEPS_CONFIG: Record<Step, { title: string; subtitle: string }> = {
  phone: { title: 'Identification Agent', subtitle: 'Étape 1 · Numéro de téléphone' },
  otp: { title: 'Vérification', subtitle: 'Étape 2 · Code de sécurité' },
  register: { title: 'Création de compte', subtitle: 'Étape 3 · Informations agent' },
};

const AgentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, isAuthenticated, checkRole } = useAuth();
  
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Hook de retry pour les opérations réseau
  const { execute: executeWithRetry, state: retryState } = useRetryOperation({
    maxRetries: 3,
    baseDelay: 1500,
    onRetry: (attempt) => {
      toast({
        title: 'Nouvelle tentative',
        description: `Tentative ${attempt}/3 en cours...`,
      });
    },
    onExhausted: () => {
      toast({
        title: 'Échec de connexion',
        description: 'Vérifiez votre connexion internet.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        const isAgent = await checkRole('agent');
        if (isAgent) {
          navigate('/agent');
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

    const email = `agent_${phone}@igp-ifn.ci`;
    const password = `agent_${phone}_secure`;
    
    const result = await executeWithRetry(async () => {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }
      
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Lier l'agent existant (sans user_id) à cet utilisateur si nécessaire
        await supabase
          .from("agents")
          .update({ user_id: user.id })
          .is("user_id", null);
        
        // Assigner le rôle agent
        const { error: roleError } = await supabase.rpc('assign_agent_role', {
          p_user_id: user.id
        });
        
        if (roleError) {
          authLogger.warn("Role assignment error:", { error: roleError.message });
        }
      }
      
      return true;
    });

    setIsLoading(false);

    if (result) {
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue sur l\'application Agent',
      });
      navigate('/agent');
    } else if (!retryState.error) {
      // Pas d'erreur = utilisateur non trouvé, passer à l'inscription
      setStep('register');
    }
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

    const email = `agent_${phone}@igp-ifn.ci`;
    const password = `agent_${phone}_secure`;

    const result = await executeWithRetry(async () => {
      // Créer le compte utilisateur
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName }
        }
      });

      if (signUpError || !data.user) {
        throw signUpError || new Error("Échec inscription");
      }

      const userId = data.user.id;
      const cleanPhone = phone.replace(/\s/g, "");

      // Créer l'entrée agent
      const { error: agentError } = await supabase.from("agents").insert({
        user_id: userId,
        employee_id: `AGT-${Date.now()}`,
        organization: 'DGE',
        zone: 'À définir',
        is_active: true
      });

      if (agentError) {
        authLogger.error("Agent creation error:", agentError);
        throw agentError;
      }

      // Utiliser la fonction RPC sécurisée pour assigner le rôle
      const { error: roleError } = await supabase.rpc('assign_agent_role', {
        p_user_id: userId
      });

      if (roleError) {
        authLogger.warn("Role assignment error:", { error: roleError.message });
      }

      authLogger.info('Agent inscrit avec succès', { phone: cleanPhone });
      return true;
    });

    setIsLoading(false);

    if (result) {
      toast({
        title: 'Compte créé',
        description: 'Votre compte agent a été créé avec succès',
      });
      navigate('/agent');
    }
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
        subtitle="Accès Agent"
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
                  retryState.isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Nouvelle tentative...
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Envoi...
                    </>
                  )
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
                  Nom complet
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Kouassi Konan Jean"
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
                  'Créer mon compte'
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

export default AgentLogin;
