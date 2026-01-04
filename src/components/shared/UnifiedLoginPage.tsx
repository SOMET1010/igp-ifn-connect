import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { VoiceSocialAuth } from '@/features/social-auth';
import { ImmersiveBackground } from '@/components/shared/ImmersiveBackground';
import { GlassCard } from '@/components/shared/GlassCard';
import { FloatingAccessibilityButton } from '@/components/shared/FloatingAccessibilityButton';
import { ContextualHelp } from '@/components/shared/ContextualHelp';
import logoDge from '@/assets/logo-dge.png';
import logoAnsut from '@/assets/logo-ansut.png';

export type UserRole = 'merchant' | 'cooperative' | 'agent';
export type RoleAccentColor = 'orange' | 'emerald' | 'violet';

interface UnifiedLoginPageProps {
  userType: UserRole;
  accentColor: RoleAccentColor;
  title: string;
  subtitle: string;
  redirectPath: string;
  registerLink?: {
    text: string;
    linkText: string;
    to: string;
  };
  backgroundVariant?: 'warm-gradient' | 'market-blur';
  children?: React.ReactNode;
}

/**
 * UnifiedLoginPage - Composant de page login unifié PNAVIM
 * Garantit une expérience cohérente pour Marchand, Agent et Coopérative
 */
export function UnifiedLoginPage({
  userType,
  accentColor,
  title,
  subtitle,
  redirectPath,
  registerLink,
  backgroundVariant = 'warm-gradient',
  children,
}: UnifiedLoginPageProps) {
  // Map des couleurs par rôle
  const accentColorClasses: Record<RoleAccentColor, {
    banner: string;
    text: string;
    border: string;
  }> = {
    orange: {
      banner: 'bg-gradient-to-r from-orange-500 to-amber-500',
      text: 'text-orange-600',
      border: 'border-orange-500/30',
    },
    emerald: {
      banner: 'bg-gradient-to-r from-emerald-600 to-teal-500',
      text: 'text-emerald-600',
      border: 'border-emerald-500/30',
    },
    violet: {
      banner: 'bg-gradient-to-r from-violet-600 to-purple-500',
      text: 'text-violet-600',
      border: 'border-violet-500/30',
    },
  };

  const colors = accentColorClasses[accentColor];

  // Labels par type d'utilisateur
  const roleLabels: Record<UserRole, string> = {
    merchant: 'Espace Marchand',
    agent: 'Espace Agent Terrain',
    cooperative: 'Espace Coopérative',
  };

  return (
    <div className="min-h-screen relative">
      {/* Fond immersif unifié */}
      <ImmersiveBackground variant={backgroundVariant} />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header institutionnel standardisé */}
        <header className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3">
            <img src={logoDge} alt="DGE" className="h-10 md:h-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-bold text-foreground">PNAVIM-CI</span>
              <span className="text-[10px] md:text-xs text-muted-foreground">République de Côte d'Ivoire</span>
              <span className={cn("text-[9px] italic", colors.text)}>
                {roleLabels[userType]}
              </span>
            </div>
          </div>
          <img src={logoAnsut} alt="ANSUT" className="h-9 md:h-11 object-contain" />
        </header>

        {/* Contenu principal */}
        <main id="main-content" className="flex-1 flex items-center justify-center px-4 py-8">
          <GlassCard 
            className={cn("w-full max-w-md overflow-hidden", colors.border)}
            borderColor={accentColor === 'orange' ? 'orange' : accentColor === 'emerald' ? 'green' : 'gold'}
          >
            {/* Bandeau coloré par rôle */}
            <div className={cn("px-4 py-3 -mx-4 -mt-4 mb-4", colors.banner)}>
              <h1 className="text-white font-bold text-center text-lg">
                {title}
              </h1>
              <p className="text-white/80 text-center text-xs mt-0.5">
                {subtitle}
              </p>
            </div>

            {/* Composant d'authentification sociale vocale */}
            <VoiceSocialAuth
              redirectPath={redirectPath}
              userType={userType}
            />

            {/* Lien d'inscription optionnel */}
            {registerLink && (
              <div className="mt-6 pt-4 border-t border-border/50 text-center">
                <p className="text-sm text-muted-foreground">
                  {registerLink.text}
                </p>
                <Link 
                  to={registerLink.to} 
                  className={cn("text-sm font-medium hover:underline", colors.text)}
                >
                  {registerLink.linkText}
                </Link>
              </div>
            )}

            {/* Contenu additionnel */}
            {children}
          </GlassCard>
        </main>

        {/* Footer discret */}
        <footer className="py-3 text-center">
          <p className="text-[10px] text-muted-foreground/60">
            Plateforme opérée par l'ANSUT pour le compte de la DGE
          </p>
        </footer>
      </div>

      {/* Boutons flottants accessibilité et aide */}
      <FloatingAccessibilityButton />
      <ContextualHelp pageKey="login" />
    </div>
  );
}

export default UnifiedLoginPage;
