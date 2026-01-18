/**
 * Page Connexion Marchand - /marchand/login
 * Refactorisée avec Design System Jùlaba
 */

import React from 'react';
import { SimpleLoginPage } from '@/shared/ui';
import { Link } from 'react-router-dom';
import { JulabaCard } from '@/shared/ui/julaba';

const MerchantLogin = () => {
  return (
    <div className="min-h-screen bg-[hsl(30_100%_98%)]">
      <SimpleLoginPage
        userType="merchant"
        redirectPath="/marchand"
      >
        <JulabaCard className="mt-4 text-center py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Nouveau marchand ?
          </p>
          <Link 
            to="/marchand/inscription-vocale" 
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
          >
            <span className="text-xl">🎤</span>
            Inscription vocale →
          </Link>
        </JulabaCard>
      </SimpleLoginPage>
    </div>
  );
};

export default MerchantLogin;
