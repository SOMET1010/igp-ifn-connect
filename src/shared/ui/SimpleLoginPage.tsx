import React from 'react';
import { cn } from '@/shared/lib';
import { InclusivePhoneAuth } from '@/features/auth/components/InclusivePhoneAuth';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import { Separator } from '@/components/ui/separator';
import logoDge from '@/assets/logo-dge.png';
import logoAnsut from '@/assets/logo-ansut.png';

export type UserRole = 'merchant' | 'cooperative' | 'agent';

interface SimpleLoginPageProps {
  userType: UserRole;
  redirectPath: string;
  children?: React.ReactNode;
}

/**
 * SimpleLoginPage - Page de login inclusive PNAVIM
 * 
 * Flow linéaire visible : Téléphone → OTP → Connecté
 * Rails sociaux invisibles : Risk Gate silencieux après OTP
 * 
 * Inclusion : voix guidée, clavier contrôlé, répéter/corriger
 */
export function SimpleLoginPage({
  userType,
  redirectPath,
  children,
}: SimpleLoginPageProps) {
  const config = {
    merchant: {
      title: 'Espace Marchand',
      color: 'from-orange-500 to-amber-500',
      textColor: 'text-orange-600',
    },
    agent: {
      title: 'Espace Agent',
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600',
    },
    cooperative: {
      title: 'Espace Coopérative',
      color: 'from-violet-500 to-purple-500',
      textColor: 'text-violet-600',
    },
  }[userType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header simple */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <img src={logoDge} alt="DGE" className="h-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">JÙLABA</span>
            <span className="text-[10px] text-muted-foreground">
              République de Côte d'Ivoire
            </span>
          </div>
        </div>
        <img src={logoAnsut} alt="ANSUT" className="h-9 object-contain" />
      </header>

      {/* Contenu principal - centré */}
      <main className="flex items-center justify-center px-4 py-8 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-sm">
          {/* Titre */}
          <div className="text-center mb-6">
            <h1 className={cn("text-2xl font-bold", config.textColor)}>
              {config.title}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Connexion par téléphone
            </p>
          </div>

          {/* Composant d'auth inclusive */}
          <InclusivePhoneAuth
            redirectPath={redirectPath}
            userType={userType}
          />

          {/* Séparateur et Google OAuth */}
          <div className="mt-4">
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-50 px-2 text-xs text-muted-foreground">
                ou
              </span>
            </div>
            <GoogleSignInButton className="w-full mt-4" />
          </div>

          {/* Contenu additionnel */}
          {children}

          {/* Aide */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Besoin d'aide ? Appelle le <span className="font-medium">1234</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
