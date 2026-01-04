import React from 'react';
import { UnifiedLoginPage } from '@/components/shared/UnifiedLoginPage';

/**
 * CooperativeLogin - Page de connexion Coopérative unifiée
 * Utilise le composant UnifiedLoginPage avec couleur Violet
 */
const CooperativeLogin = () => {
  return (
    <UnifiedLoginPage
      userType="cooperative"
      accentColor="violet"
      title="Espace Coopérative"
      subtitle="Authentification Sociale PNAVIM"
      redirectPath="/cooperative/dashboard"
      registerLink={{
        text: "Vous êtes une nouvelle coopérative ?",
        linkText: "Demander l'accès",
        to: "/cooperative/register"
      }}
      backgroundVariant="warm-gradient"
    />
  );
};

export default CooperativeLogin;
