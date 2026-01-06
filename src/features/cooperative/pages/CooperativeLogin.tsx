import React from 'react';
import { SimpleLoginPage } from '@/shared/ui';
import { Link } from 'react-router-dom';

/**
 * CooperativeLogin - Page de connexion Coopérative simplifiée
 * Flow linéaire : Téléphone → OTP → Connecté
 */
const CooperativeLogin = () => {
  return (
    <SimpleLoginPage
      userType="cooperative"
      redirectPath="/cooperative"
    >
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Vous êtes une nouvelle coopérative ?
        </p>
        <Link 
          to="/cooperative/register" 
          className="text-sm text-violet-600 hover:underline font-medium"
        >
          Demander l'accès →
        </Link>
      </div>
    </SimpleLoginPage>
  );
};

export default CooperativeLogin;
