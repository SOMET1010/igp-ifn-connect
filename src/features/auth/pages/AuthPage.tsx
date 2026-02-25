/**
 * AuthPage - Page d'authentification universelle avec Design System Jùlaba
 * 
 * Supporte: email/password (admin, agent) et phone/OTP (merchant, cooperative, producer)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneInput, ImmersiveBackground } from '@/shared/ui';
import { 
  JulabaPageLayout, 
  JulabaCard, 
  JulabaButton, 
  JulabaInput 
} from '@/shared/ui/julaba';
import OTPInput from "@/features/auth/components/OTPInput";
import { useAuth } from '@/shared/contexts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ShieldCheck, Store, Users, Briefcase } from 'lucide-react';
import { GoogleSignInButton } from "@/features/auth/components/GoogleSignInButton";
import { 
  emailSchema, passwordSchema, phoneSchema, fullNameSchema, 
  getValidationError 
} from '@/shared/lib';
import { JulabaInstitutionalHeader, JulabaPillButton, JulabaWaxCurve } from '@/features/public/components/julaba';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface RoleConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  emoji: string;
  authMethod: 'email' | 'phone';
  redirectTo: string;
  accentColor: string;
  bgGradient: string;
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  admin: {
    title: 'Administration',
    subtitle: 'Direction Générale des Entreprises',
    icon: <ShieldCheck className="h-8 w-8" />,
    emoji: '🏛️',
    authMethod: 'email',
    redirectTo: '/admin',
    accentColor: 'violet',
    bgGradient: 'from-violet-600 to-violet-800',
  },
  agent: {
    title: 'Agent de terrain',
    subtitle: 'Enrôlement des marchands',
    icon: <Briefcase className="h-8 w-8" />,
    emoji: '👔',
    authMethod: 'email',
    redirectTo: '/agent',
    accentColor: 'emerald',
    bgGradient: 'from-emerald-600 to-emerald-800',
  },
  merchant: {
    title: 'Espace Marchand',
    subtitle: 'Gestion de votre activité',
    icon: <Store className="h-8 w-8" />,
    emoji: '🏪',
    authMethod: 'phone',
    redirectTo: '/marchand',
    accentColor: 'orange',
    bgGradient: 'from-orange-500 to-orange-700',
  },
  cooperative: {
    title: 'Espace Coopérative',
    subtitle: 'Gestion de vos stocks',
    icon: <Users className="h-8 w-8" />,
    emoji: '🤝',
    authMethod: 'phone',
    redirectTo: '/cooperative',
    accentColor: 'amber',
    bgGradient: 'from-amber-500 to-amber-700',
  },
  producer: {
    title: 'Espace Producteur',
    subtitle: 'Publication de vos récoltes',
    icon: <Users className="h-8 w-8" />,
    emoji: '🌾',
    authMethod: 'phone',
    redirectTo: '/producteur',
    accentColor: 'green',
    bgGradient: 'from-emerald-500 to-emerald-700',
  },
};

type Step = 'credentials' | 'otp' | 'register';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') || 'admin';
  const modeParam = searchParams.get('mode') || 'login';
  
  const { signIn, signUp, isAuthenticated, checkRole } = useAuth();

  const [step, setStep] = useState<Step>('credentials');
  const [mode, setMode] = useState<'login' | 'signup'>(modeParam as 'login' | 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  const config = ROLE_CONFIGS[roleParam] || ROLE_CONFIGS.admin;
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
    const tableName = roleParam === 'merchant' ? 'merchants' : roleParam === 'producer' ? 'producers' : 'cooperatives';
    const phoneField = 'phone';
    
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .eq(phoneField, phone.replace(/\s/g, ''))
      .maybeSingle();

    setIsNewUser(!existing);

    // For demo: show OTP in toast (real implementation would use SMS)
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    toast.success(`📲 Code de vérification : ${mockOtp}`, { duration: 15000 });

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

      await supabase.from('user_roles').insert({
        user_id: userId,
        role: roleParam as AppRole
      });

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
      } else if (roleParam === 'producer') {
        await supabase.from('producers').insert({
          user_id: userId,
          full_name: fullName,
          phone: cleanPhone,
          region: 'Abidjan',
          commune: 'Abidjan'
        });
      }

      toast.success('Compte créé avec succès');
      navigate(config.redirectTo);
    } catch {
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
    <JulabaPageLayout background="warm" withBottomNav={false}>
      {/* Fond immersif Afro-Futuriste */}
      <ImmersiveBackground 
        variant="solar"
        showMarketPhoto
        blurAmount="sm"
        showWaxPattern={false}
        showBlobs={false}
      />

      {/* Header institutionnel */}
      <JulabaInstitutionalHeader
        showAccessibility={false}
        showAudioToggle={false}
        showLanguageSelector={true}
        showLoginButton={false}
        variant="compact"
      />

      {/* Contenu principal */}
      <main className="relative z-10 pt-24 pb-40 px-4 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Carte principale */}
          <JulabaCard className="space-y-6">
            {/* Icône et titre */}
            <div className="text-center">
              <motion.div 
                className={`mx-auto mb-4 w-16 h-16 bg-gradient-to-br ${config.bgGradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {config.icon}
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground">
                {config.emoji} {config.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{config.subtitle}</p>
            </div>

            {/* Formulaire Email/Password */}
            {!isPhoneAuth && step === 'credentials' && (
              <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="signup">Inscription</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-4">
                  <JulabaInput
                    label="Adresse email"
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    emoji="📧"
                  />

                  <JulabaInput
                    label="Mot de passe"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    emoji="🔒"
                  />

                  <JulabaButton
                    variant="hero"
                    onClick={handleEmailLogin}
                    disabled={!email || !password || isLoading}
                    className="w-full"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '🔐 Se connecter'}
                  </JulabaButton>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  <GoogleSignInButton disabled={isLoading} className="w-full h-12" />
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-4">
                  <JulabaInput
                    label="Nom complet"
                    type="text"
                    placeholder="Votre nom"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    emoji="👤"
                  />

                  <JulabaInput
                    label="Adresse email"
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    emoji="📧"
                  />

                  <JulabaInput
                    label="Mot de passe"
                    type="password"
                    placeholder="Min. 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    emoji="🔒"
                  />

                  <JulabaButton
                    variant="hero"
                    onClick={handleEmailSignup}
                    disabled={!fullName || !email || !password || isLoading}
                    className="w-full"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '✨ Créer un compte'}
                  </JulabaButton>
                </TabsContent>
              </Tabs>
            )}

            {/* Phone OTP - Step 1: Phone */}
            {isPhoneAuth && step === 'credentials' && (
              <div className="space-y-4">
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  disabled={isLoading}
                />

                <JulabaButton
                  variant="hero"
                  onClick={handlePhoneSubmit}
                  disabled={phone.length < 8 || isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '📲 Recevoir le code'}
                </JulabaButton>
              </div>
            )}

            {/* Phone OTP - Step 2: Verify */}
            {isPhoneAuth && step === 'otp' && (
              <div className="space-y-4">
                <div className="space-y-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Code envoyé au +225 {phone}
                  </p>
                  <div className="flex justify-center">
                    <OTPInput value={otp} onChange={setOtp} />
                  </div>
                </div>

                <JulabaButton
                  variant="hero"
                  onClick={handleOtpSubmit}
                  disabled={otp.length !== 6 || isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '✅ Valider'}
                </JulabaButton>

                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Modifier le numéro
                </button>
              </div>
            )}

            {/* Phone OTP - Step 3: Register */}
            {isPhoneAuth && step === 'register' && (
              <div className="space-y-4">
                <JulabaInput
                  label={roleParam === 'cooperative' ? '🏢 Nom de la coopérative' : '👤 Nom complet'}
                  type="text"
                  placeholder={roleParam === 'cooperative' ? 'Ex: COOP Vivriers Abidjan' : 'Ex: Kouamé Adjoua'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                <JulabaButton
                  variant="hero"
                  onClick={handlePhoneRegister}
                  disabled={fullName.length < 3 || isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '🎉 Créer mon compte'}
                </JulabaButton>

                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
              </div>
            )}
          </JulabaCard>

          {/* Sélecteur de rôle */}
          <motion.div 
            className="mt-6 flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {Object.entries(ROLE_CONFIGS).map(([role, cfg]) => (
              <JulabaPillButton
                key={role}
                variant={roleParam === role ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => navigate(`/auth?role=${role}`)}
              >
                {cfg.emoji} {cfg.title}
              </JulabaPillButton>
            ))}
          </motion.div>

          {/* Footer info */}
          <motion.p 
            className="text-xs text-white/70 text-center mt-6 drop-shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Plateforme opérée par l'ANSUT pour le compte de la DGE
          </motion.p>
        </motion.div>
      </main>

      {/* Courbe décorative Wax */}
      <JulabaWaxCurve className="fixed bottom-0 left-0 right-0 z-0" />
    </JulabaPageLayout>
  );
};

export default AuthPage;
