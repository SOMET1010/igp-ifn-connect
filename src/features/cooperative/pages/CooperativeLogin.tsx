/**
 * CooperativeLogin - Page de connexion Coopérative
 * Refonte Jùlaba Design System
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { SimpleLoginPage } from '@/shared/ui';
import { JulabaCard } from '@/shared/ui/julaba';

const CooperativeLogin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-purple-100">
      <SimpleLoginPage
        userType="cooperative"
        redirectPath="/cooperative"
      >
        <JulabaCard accent="green" className="mt-6 p-4">
          <div className="text-center space-y-2">
            <span className="text-3xl">🤝</span>
            <p className="text-sm text-muted-foreground">
              Vous êtes une nouvelle coopérative ?
            </p>
            <Link 
              to="/cooperative/register" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              📝 Demander l'accès →
            </Link>
          </div>
        </JulabaCard>
      </SimpleLoginPage>
    </div>
  );
};

export default CooperativeLogin;
