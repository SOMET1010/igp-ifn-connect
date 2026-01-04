import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { UnifiedLoginPage } from '@/components/shared/UnifiedLoginPage';

/**
 * MerchantLogin - Page de connexion Marchand unifiée
 * Utilise le composant UnifiedLoginPage avec couleur Orange
 */
export default function MerchantLogin() {
  return (
    <UnifiedLoginPage
      userType="merchant"
      accentColor="orange"
      title="Espace Marchand Copilote"
      subtitle="Authentification sécurisée par la voix"
      redirectPath="/marchand"
      backgroundVariant="warm-gradient"
    >
      {/* Lien inscription vocale conversationnelle */}
      <Link
        to="/marchand/inscription-vocale"
        className="flex items-center justify-center gap-2 mt-4 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 rounded-xl px-4 py-3 border border-border/50"
      >
        <Sparkles className="w-5 h-5 text-amber-500" />
        <span className="font-medium text-sm">Nouvelle inscription avec Tantie Sagesse</span>
      </Link>
    </UnifiedLoginPage>
  );
}
