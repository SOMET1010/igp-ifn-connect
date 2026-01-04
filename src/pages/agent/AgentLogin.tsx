import React from 'react';
import { SimpleLoginPage } from '@/components/shared/SimpleLoginPage';
import { Link } from 'react-router-dom';

/**
 * AgentLogin - Page de connexion Agent simplifiée
 * Flow linéaire : Téléphone → OTP → Connecté
 */
const AgentLogin = () => {
  return (
    <SimpleLoginPage
      userType="agent"
      redirectPath="/agent/dashboard"
    >
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Vous n'êtes pas encore agent ?
        </p>
        <Link 
          to="/agent/request" 
          className="text-sm text-emerald-600 hover:underline font-medium"
        >
          Soumettre une candidature →
        </Link>
      </div>
    </SimpleLoginPage>
  );
};

export default AgentLogin;
