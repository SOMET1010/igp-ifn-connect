import React from 'react';

interface InstitutionalFooterProps {
  version?: string;
}

export const InstitutionalFooter: React.FC<InstitutionalFooterProps> = ({
  version = '1.0.0',
}) => {
  return (
    <footer className="py-4 px-4 border-t border-border bg-card">
      <div className="max-w-md mx-auto text-center">
        <p className="text-xs text-muted-foreground">
          © 2024 Direction Générale des Entreprises – Tous droits réservés
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          v{version}
        </p>
      </div>
    </footer>
  );
};
