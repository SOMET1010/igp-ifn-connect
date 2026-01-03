import React from 'react';
import { Link } from 'react-router-dom';
import { VoiceSocialAuth } from '@/features/social-auth';
import { ImmersiveBackground } from '@/components/shared/ImmersiveBackground';
import { GlassCard } from '@/components/shared/GlassCard';
import { Shield } from 'lucide-react';
import logoDge from '@/assets/logo-dge.png';
import logoAnsut from '@/assets/logo-ansut.png';

/**
 * AgentLogin - Page de connexion Agent Terrain
 * Utilise le protocole d'Authentification Sociale PNAVIM
 */
const AgentLogin = () => {
  return (
    <div className="min-h-screen relative">
      {/* Fond immersif */}
      <ImmersiveBackground variant="warm-gradient" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header institutionnel */}
        <header className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3">
            <img src={logoDge} alt="DGE" className="h-10 md:h-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-bold text-foreground">PNAVIM-CI</span>
              <span className="text-[10px] md:text-xs text-muted-foreground">République de Côte d'Ivoire</span>
              <span className="text-[9px] text-muted-foreground/70 italic">Espace Agent Terrain</span>
            </div>
          </div>
          <img src={logoAnsut} alt="ANSUT" className="h-9 md:h-11 object-contain" />
        </header>

        {/* Contenu principal */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <GlassCard className="w-full max-w-md p-6">
            {/* Badge agent */}
            <div className="flex items-center justify-center gap-2 mb-6 text-primary">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">
                Accès Agent
              </span>
            </div>

            <VoiceSocialAuth
              redirectPath="/agent/dashboard"
              userType="agent"
            />

            {/* Lien vers demande d'accès */}
            <div className="mt-6 pt-4 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                Vous n'êtes pas encore agent ?
              </p>
              <Link 
                to="/agent/request" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Soumettre une candidature
              </Link>
            </div>
          </GlassCard>
        </main>

        {/* Footer discret */}
        <footer className="py-3 text-center">
          <p className="text-[10px] text-muted-foreground/60">
            Plateforme opérée par l'ANSUT pour le compte de la DGE
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AgentLogin;
