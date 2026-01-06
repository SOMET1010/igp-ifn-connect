import React from 'react';

interface LoginCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <div className={`card-institutional p-6 w-full max-w-sm ${className}`}>
      {/* En-tête sobre */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-foreground uppercase tracking-wide">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {subtitle}
        </p>
      </div>
      
      {/* Contenu du formulaire */}
      <div className="space-y-4">
        {children}
      </div>
      
      {/* Note de sécurité sobre */}
      <p className="text-xs text-muted-foreground mt-6 text-center">
        Connexion sécurisée par authentification forte
      </p>
    </div>
  );
};
