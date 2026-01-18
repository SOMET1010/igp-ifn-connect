/**
 * AgentLogin - Page de connexion Agent
 * Refonte Jùlaba Design System
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { SimpleLoginPage } from '@/shared/ui';
import { JulabaCard } from '@/shared/ui/julaba';

const AgentLogin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100">
      <SimpleLoginPage
        userType="agent"
        redirectPath="/agent"
      >
        <JulabaCard accent="green" className="mt-6 p-4">
          <div className="text-center space-y-2">
            <span className="text-3xl">🌿</span>
            <p className="text-sm text-muted-foreground">
              Vous n'êtes pas encore agent ?
            </p>
            <Link 
              to="/agent/request" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              📝 Soumettre une candidature →
            </Link>
          </div>
        </JulabaCard>
      </SimpleLoginPage>
    </div>
  );
};

export default AgentLogin;
