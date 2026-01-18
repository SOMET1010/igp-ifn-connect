/**
 * AdminLoginPage - Page de connexion administrateur avec Design System Jùlaba
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/shared/contexts";
import { Loader2, ShieldCheck } from "lucide-react";
import { emailSchema, passwordSchema, getValidationError } from "@/shared/lib";
import { 
  JulabaPageLayout, 
  JulabaHeader, 
  JulabaCard, 
  JulabaButton, 
  JulabaInput 
} from "@/shared/ui/julaba";
import { ImmersiveBackground } from "@/shared/ui";
import { AdminLoginConfig } from "../types/login.types";

interface AdminLoginPageProps {
  config: AdminLoginConfig;
}

/**
 * Composant dédié pour la page de login admin (email/password)
 */
export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ config }) => {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, checkRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        const isAdmin = await checkRole("admin");
        if (isAdmin) {
          navigate(config.redirectTo);
        }
      }
    };
    checkAuth();
  }, [isAuthenticated, checkRole, navigate, config.redirectTo]);

  const handleLogin = async () => {
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
      toast.error("Email ou mot de passe incorrect");
      setIsLoading(false);
      return;
    }

    const isAdmin = await checkRole("admin");

    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits administrateur");
      setIsLoading(false);
      return;
    }

    toast.success("Bienvenue sur l'administration DGE");
    navigate(config.redirectTo);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password && !isLoading) {
      handleLogin();
    }
  };

  return (
    <JulabaPageLayout background="gradient" withBottomNav={false}>
      <ImmersiveBackground 
        variant="solar" 
        showMarketPhoto={false}
        blurAmount="md"
      />
      
      {/* Header Admin */}
      <JulabaHeader
        title="🏛️ Administration DGE"
        subtitle={config.headerSubtitle}
        showBack
        backTo="/"
      />

      {/* Formulaire de connexion */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <JulabaCard className="w-full max-w-md">
          {/* Icône et titre */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Connexion Administrateur</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Accès réservé aux administrateurs
            </p>
          </div>

          {/* Champs du formulaire */}
          <div className="space-y-4" onKeyDown={handleKeyDown}>
            <JulabaInput
              label="📧 Adresse email"
              type="email"
              placeholder="admin@dge.gouv.ci"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              emoji="📧"
            />

            <JulabaInput
              label="🔒 Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              emoji="🔒"
            />

            <JulabaButton
              variant="hero"
              onClick={handleLogin}
              disabled={!email || !password || isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-violet-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                "🔐 Se connecter"
              )}
            </JulabaButton>
          </div>

          {/* Info support */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Contactez le support DGE si vous avez oublié vos identifiants
          </p>
        </JulabaCard>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-white/70 relative z-10">
        <p>IGP-IFN Connect - © 2024</p>
      </footer>
    </JulabaPageLayout>
  );
};
