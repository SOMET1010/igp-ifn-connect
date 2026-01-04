import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneInput } from '@/components/shared/PhoneInput';
import OTPInput from '@/components/auth/OTPInput';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Mail, Lock, Loader2, ArrowLeft, User, Phone, ShieldCheck, 
  Store, Users, Briefcase 
} from 'lucide-react';
import { 
  emailSchema, passwordSchema, phoneSchema, fullNameSchema, 
  getValidationError 
} from '@/lib/validationSchemas';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { InstitutionalFooter } from '@/components/shared/InstitutionalFooter';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface RoleConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  authMethod: 'email' | 'phone';
  redirectTo: string;
  color: string;
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  admin: {
    title: 'Administration',
    subtitle: 'Direction Générale des Entreprises',
    icon: <ShieldCheck className="h-8 w-8" />,
    authMethod: 'email',
    redirectTo: '/admin',
    color: 'from-violet-800 to-violet-700',
  },
  agent: {
    title: 'Agent de terrain',
    subtitle: 'Enrôlement des marchands',
    icon: <Briefcase className="h-8 w-8" />,
    authMethod: 'email',
    redirectTo: '/agent',
    color: 'from-blue-800 to-blue-700',
  },
  merchant: {
    title: 'Espace Marchand',
    subtitle: 'Gestion de votre activité',
    icon: <Store className="h-8 w-8" />,
    authMethod: 'phone',
    redirectTo: '/marchand',
    color: 'from-emerald-800 to-emerald-700',
  },
  cooperative: {
    title: 'Espace Coopérative',
    subtitle: 'Gestion de vos stocks',
    icon: <Users className="h-8 w-8" />,
    authMethod: 'phone',
    redirectTo: '/cooperative',
    color: 'from-amber-700 to-amber-600',
  },
  producer: {
    title: 'Espace Producteur',
    subtitle: 'Publication de vos récoltes',
    icon: <Users className="h-8 w-8" />,
    authMethod: 'phone',
    redirectTo: '/producteur',
    color: 'from-emerald-700 to-emerald-600',
  },
};

type Step = 'credentials' | 'otp' | 'register';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || 'merchant';
  const modeParam = searchParams.get('mode') || 'login';
  
  const { signIn, signUp, signInWithPhone, verifyOtp, isAuthenticated, checkRole } = useAuth();

  const [step, setStep] = useState<Step>('credentials');
  const [mode, setMode] = useState<'login' | 'signup'>(modeParam as 'login' | 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const config = ROLE_CONFIGS[roleParam] || ROLE_CONFIGS.merchant;
  const isPhoneAuth = config.authMethod === 'phone';

  // Check if already authenticated with correct role
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        const hasRequiredRole = await checkRole(roleParam as AppRole);
        if (hasRequiredRole) {
          navigate(config.redirectTo);
        }
      }
    };
    checkAuth();
  }, [isAuthenticated, checkRole, roleParam, navigate, config.redirectTo]);

  // Email/Password login
  const handleEmailLogin = async () => {
    const emailError = getValidationError(emailSchema, email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    const passwordError = getValidationError(passwordSchema, password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error('Email ou mot de passe incorrect');
      setIsLoading(false);
      return;
    }

    const hasRole = await checkRole(roleParam as AppRole);
    
    if (!hasRole) {
      toast.error(`Vous n'avez pas les droits ${config.title}`);
      setIsLoading(false);
      return;
    }

    toast.success('Connexion réussie');
    navigate(config.redirectTo);
    setIsLoading(false);
  };

  // Email/Password signup
  const handleEmailSignup = async () => {
    const nameError = getValidationError(fullNameSchema, fullName);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    const emailError = getValidationError(emailSchema, email);
    if (emailError) {
      toast.error(emailError);
      return;
    }

    const passwordError = getValidationError(passwordSchema, password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Cet email est déjà utilisé');
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    toast.success('Compte créé ! Vérifiez votre email pour confirmer.');
    setMode('login');
    setIsLoading(false);
  };

  // Phone OTP - Step 1: Send OTP
  const handlePhoneSubmit = async () => {
    const error = getValidationError(phoneSchema, phone);
    if (error) {
      toast.error(error);
      return;
    }

    setIsLoading(true);

    // Check if user exists
    const tableName = roleParam === 'merchant' ? 'merchants' : 'cooperatives';
    const phoneField = roleParam === 'merchant' ? 'phone' : 'phone';
    
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq(phoneField, phone.replace(/\s/g, ''))
      .maybeSingle();

    setIsNewUser(!existing);

    // For demo: show OTP in toast (real implementation would use SMS)
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    toast.success(`Code de vérification : ${mockOtp}`, { duration: 15000 });

    // In production, use: await signInWithPhone(phone);

    setIsLoading(false);
    setStep('otp');
  };

  // Phone OTP - Step 2: Verify OTP
  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      toast.error('Code à 6 chiffres requis');
      return;
    }

    setIsLoading(true);

    if (isNewUser) {
      setIsLoading(false);
      setStep('register');
      return;
    }

    // For demo: accept any 6-digit code
    // In production: const { error } = await verifyOtp(phone, otp);

    toast.success('Connexion réussie');
    navigate(config.redirectTo);
    setIsLoading(false);
  };

  // Phone registration
  const handlePhoneRegister = async () => {
    const nameError = getValidationError(fullNameSchema, fullName);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    setIsLoading(true);

    try {
      const cleanPhone = phone.replace(/\s/g, '');
      const fakeEmail = `${cleanPhone}@${roleParam}.igp.ci`;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: `${roleParam}123`,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName }
        }
      });

      if (authError || !authData.user) {
        throw authError || new Error('Échec inscription');
      }

      const userId = authData.user.id;

      // Create role
      await supabase.from('user_roles').insert({
        user_id: userId,
        role: roleParam as AppRole
      });

      // Create entity record
      if (roleParam === 'merchant') {
        await supabase.from('merchants').insert({
          user_id: userId,
          full_name: fullName,
          phone: cleanPhone,
          cmu_number: `CMU-${Date.now()}`,
          activity_type: 'Détaillant',
          status: 'validated'
        });
      } else if (roleParam === 'cooperative') {
        await supabase.from('cooperatives').insert({
          user_id: userId,
          name: fullName,
          code: `COOP-${Date.now()}`,
          region: 'Abidjan',
          commune: 'Abidjan'
        });
      }

      toast.success('Compte créé avec succès');
      navigate(config.redirectTo);
    } catch (err) {
      toast.error('Erreur lors de la création du compte');
    }

    setIsLoading(false);
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('credentials');
      setOtp('');
    } else if (step === 'register') {
      setStep('otp');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <InstitutionalHeader
        subtitle={config.subtitle}
        showBackButton={step !== 'credentials'}
        onBack={handleBack}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardHeader className="text-center pb-4">
            <div className={`mx-auto mb-4 w-16 h-16 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center text-white`}>
              {config.icon}
            </div>
            <CardTitle className="text-2xl">{config.title}</CardTitle>
            <CardDescription>{config.subtitle}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email/Password Authentication */}
            {!isPhoneAuth && step === 'credentials' && (
              <>
                <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'signup')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Connexion</TabsTrigger>
                    <TabsTrigger value="signup">Inscription</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="exemple@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <Button
                      onClick={handleEmailLogin}
                      disabled={!email || !password || isLoading}
                      className="w-full"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Se connecter'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Votre nom"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                        />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signupEmail">Adresse email</Label>
                      <div className="relative">
                        <Input
                          id="signupEmail"
                          type="email"
                          placeholder="exemple@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signupPassword">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="signupPassword"
                          type="password"
                          placeholder="Min. 8 caractères"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <Button
                      onClick={handleEmailSignup}
                      disabled={!fullName || !email || !password || isLoading}
                      className="w-full"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer un compte'}
                    </Button>
                  </TabsContent>
                </Tabs>
              </>
            )}

            {/* Phone OTP - Step 1: Phone */}
            {isPhoneAuth && step === 'credentials' && (
              <>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  disabled={isLoading}
                />

                <Button
                  onClick={handlePhoneSubmit}
                  disabled={phone.length < 8 || isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Recevoir le code'}
                </Button>
              </>
            )}

            {/* Phone OTP - Step 2: Verify */}
            {isPhoneAuth && step === 'otp' && (
              <>
                <div className="space-y-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Code envoyé au +225 {phone}
                  </p>
                  <div className="flex justify-center">
                    <OTPInput value={otp} onChange={setOtp} />
                  </div>
                </div>

                <Button
                  onClick={handleOtpSubmit}
                  disabled={otp.length !== 6 || isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Valider'}
                </Button>

                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Modifier le numéro
                </button>
              </>
            )}

            {/* Phone OTP - Step 3: Register */}
            {isPhoneAuth && step === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="registerName">
                    {roleParam === 'cooperative' ? 'Nom de la coopérative' : 'Nom complet'}
                  </Label>
                  <Input
                    id="registerName"
                    type="text"
                    placeholder={roleParam === 'cooperative' ? 'Ex: COOP Vivriers Abidjan' : 'Ex: Kouamé Adjoua'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handlePhoneRegister}
                  disabled={fullName.length < 3 || isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer mon compte'}
                </Button>

                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Role selector links */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {Object.entries(ROLE_CONFIGS).map(([role, cfg]) => (
            <Button
              key={role}
              variant={roleParam === role ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate(`/auth?role=${role}`)}
              className="text-xs"
            >
              {cfg.title}
            </Button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4 max-w-sm">
          Plateforme opérée par l'ANSUT pour le compte de la DGE
        </p>
      </main>

      <InstitutionalFooter />
    </div>
  );
};

export default AuthPage;