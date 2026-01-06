import React from 'react';
import { SimpleLoginPage } from '@/shared/ui/SimpleLoginPage';
import { Link } from 'react-router-dom';

/**
 * MerchantLogin - Page de connexion Marchand simplifiée
 * Flow linéaire : Téléphone → OTP → Connecté
 */
const MerchantLogin = () => {
  return (
    <SimpleLoginPage
      userType="merchant"
      redirectPath="/marchand"
    >
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Nouveau marchand ?
        </p>
        <Link 
          to="/marchand/inscription-vocale" 
          className="text-sm text-orange-500 hover:underline font-medium"
        >
          Inscription vocale →
        </Link>
      </div>
    </SimpleLoginPage>
  );
};

export default MerchantLogin;
