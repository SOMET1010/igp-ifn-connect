import React from 'react';
import { Link } from 'react-router-dom';
import { VoiceSocialAuth } from '@/features/social-auth';
import { Shield, HelpCircle } from 'lucide-react';
import logoDge from '@/assets/logo-dge.png';
import logoAnsut from '@/assets/logo-ansut.png';
import marcheIvoirien from '@/assets/marche-ivoirien.jpg';
import { WaxPattern } from '@/components/shared/WaxPattern';
import { FloatingAccessibilityButton } from '@/components/shared/FloatingAccessibilityButton';
import { ContextualHelp } from '@/components/shared/ContextualHelp';

/**
 * AgentLogin - Page de connexion Agent Terrain
 * Version "Enjaillement" : Glassmorphism + Wax + Fond Marché Immersif
 */
const AgentLogin = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 1. BACKGROUND IMMERSIF (Le Marché Flou) */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${marcheIvoirien})` }}
      >
        {/* Overlay gradient pour lisibilité - Teinte émeraude pour Agent */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/70 via-black/50 to-emerald-900/80" />
      </div>
      
      {/* Motif Wax Overlay */}
      <div className="absolute inset-0 opacity-10">
        <WaxPattern variant="geometric" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 2. HEADER INSTITUTIONNEL (DGE / ANSUT) */}
        <header className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3">
            <img src={logoDge} alt="DGE" className="h-10 md:h-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-bold text-foreground">PNAVIM-CI</span>
              <span className="text-[10px] md:text-xs text-muted-foreground">République de Côte d'Ivoire</span>
            </div>
          </div>
          <img src={logoAnsut} alt="ANSUT" className="h-9 md:h-11 object-contain" />
        </header>

        {/* 3. CONTENU PRINCIPAL */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          {/* Carte Glassmorphism Agent */}
          <div className="w-full max-w-md">
            {/* Bandeau supérieur émeraude */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-t-3xl px-6 py-4 relative overflow-hidden">
              {/* Motif décoratif en fond */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  <pattern id="agent-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="2" fill="white" />
                    <path d="M0,10 L20,10 M10,0 L10,20" stroke="white" strokeWidth="0.5" opacity="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#agent-pattern)" />
                </svg>
              </div>
              
              {/* Badge + Titre */}
              <div className="relative flex items-center justify-center gap-2 text-white">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Accès Agent Terrain
                </span>
              </div>
            </div>

            {/* Corps de la carte - Glassmorphism */}
            <div className="bg-white/95 backdrop-blur-xl rounded-b-3xl border-2 border-t-0 border-emerald-200/50 shadow-2xl overflow-hidden">
              {/* Zone Avatar (déplacé dans VoiceSocialAuth) */}
              <div className="px-6 pt-6 pb-4">
                <VoiceSocialAuth
                  redirectPath="/agent/dashboard"
                  userType="agent"
                />
              </div>

              {/* Message d'aide contextuel */}
              <div className="px-6 pb-4">
                <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-emerald-800">
                    <p className="font-medium">Besoin d'aide ?</p>
                    <p className="text-emerald-600 text-xs mt-0.5">
                      Parle clairement dans le micro ou utilise le clavier si tu es dans un endroit bruyant.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer de la carte */}
              <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Vous n'êtes pas encore agent ?
                  </p>
                  <Link 
                    to="/agent/request" 
                    className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline font-semibold transition-colors"
                  >
                    Soumettre une candidature →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 4. FOOTER LÉGAL */}
        <footer className="py-3 text-center">
          <p className="text-[10px] text-white/60">
            PNAVIM-CI v2.0 • Plateforme Sécurisée
          </p>
          <p className="text-[9px] text-white/40 mt-0.5">
            Opérée par l'ANSUT pour le compte de la DGE
          </p>
        </footer>

        {/* Floating Accessibility Button */}
        <FloatingAccessibilityButton />
        
        {/* Contextual Help */}
        <ContextualHelp pageKey="login" className="bottom-44 right-4" />
      </div>
    </div>
  );
};

export default AgentLogin;
