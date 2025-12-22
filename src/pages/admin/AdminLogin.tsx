import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { emailSchema, passwordSchema, getValidationError } from '@/lib/validationSchemas';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, isAuthenticated, checkRole } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        const isAdmin = await checkRole('admin');
        if (isAdmin) {
          navigate('/admin');
        }
      }
    };
    checkAuth();
  }, [isAuthenticated, checkRole, navigate]);

  const handleLogin = async () => {
    // Validate email
    const emailError = getValidationError(emailSchema, email);
    if (emailError) {
      toast({
        title: 'Erreur',
        description: emailError,
        variant: 'destructive',
      });
      return;
    }

    // Validate password
    const passwordError = getValidationError(passwordSchema, password);
    if (passwordError) {
      toast({
        title: 'Erreur',
        description: passwordError,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: 'Erreur de connexion',
        description: 'Email ou mot de passe incorrect',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Verify admin role
    const isAdmin = await checkRole('admin');
    
    if (!isAdmin) {
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'avez pas les droits administrateur',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: '✅ Connexion réussie',
      description: 'Bienvenue sur l\'administration IFN',
    });
    
    navigate('/admin');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      <header className="bg-gradient-to-r from-violet-800 to-violet-700 text-primary-foreground py-6 px-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="font-bold">Administration IFN</span>
            </div>
            <p className="text-sm text-primary-foreground/80 mt-1">
              Direction Générale des Entreprises
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-10 w-10 text-violet-700" />
            </div>
            <CardTitle className="text-2xl">Connexion Administrateur</CardTitle>
            <CardDescription className="text-base">
              Accès réservé aux administrateurs DGE
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label htmlFor="email" className="form-label-lg">
                Adresse email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@dge.gouv.ci"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input-lg pl-12"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="form-label-lg">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input-lg pl-12"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={!email || !password || isLoading}
              className="btn-xxl w-full bg-violet-700 hover:bg-violet-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Contactez le support DGE si vous avez oublié vos identifiants
            </p>
          </CardContent>
        </Card>
      </div>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>Plateforme IFN - © 2024</p>
      </footer>
    </div>
  );
};

export default AdminLogin;
