import React from 'react';
import { SimpleLoginPage } from '@/components/shared/SimpleLoginPage';

/**
 * MerchantLogin - Page de connexion Marchand simplifiée
 * Flow linéaire : Téléphone → OTP → Connecté
 */
export default function MerchantLogin() {
  return (
    <SimpleLoginPage
      userType="merchant"
      redirectPath="/marchand"
    />
  );
}
