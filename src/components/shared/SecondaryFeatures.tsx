import React from 'react';
import { Lock, Smartphone, Headphones, LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  colorClass?: string;
}

interface SecondaryFeaturesProps {
  variant?: 'default' | 'compact';
  features?: Feature[];
  showInstitutionalNote?: boolean;
  maxWidth?: 'md' | 'lg' | '2xl';
}

const DEFAULT_FEATURES: Feature[] = [
  { icon: Lock, title: 'Sécurisé', description: 'Données chiffrées', colorClass: 'bg-primary/10 text-primary' },
  { icon: Smartphone, title: 'Officiel', description: 'Plateforme DGE', colorClass: 'bg-secondary/10 text-secondary' },
  { icon: Headphones, title: 'Support', description: 'Assistance 24/7', colorClass: 'bg-accent/10 text-accent-foreground' },
];

export const SecondaryFeatures: React.FC<SecondaryFeaturesProps> = ({
  variant = 'default',
  features = DEFAULT_FEATURES,
  showInstitutionalNote = true,
  maxWidth = 'md',
}) => {
  const maxWidthClass = {
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  if (variant === 'compact') {
    return (
      <div className={`${maxWidthClass} w-full`}>
        <div className="grid grid-cols-3 gap-3 text-center">
          {features.map((feature, index) => (
            <div key={index} className="p-3 rounded-xl bg-muted/50">
              <feature.icon className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-xs font-medium">{feature.title}</p>
              <p className="text-[10px] text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
        {showInstitutionalNote && (
          <p className="text-center text-[10px] text-muted-foreground mt-4">
            Plateforme opérée par l'ANSUT pour le compte de la DGE
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`${maxWidthClass} w-full`}>
      <div className="grid grid-cols-3 gap-3">
        {features.map((feature, index) => {
          const [bgClass, textClass] = (feature.colorClass || 'bg-primary/10 text-primary').split(' ');
          return (
            <div key={index} className="bg-card rounded-xl p-3 text-center shadow-sm border">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${bgClass}`}>
                <feature.icon className={`h-5 w-5 ${textClass}`} />
              </div>
              <p className="text-xs font-medium text-foreground">{feature.title}</p>
              <p className="text-[10px] text-muted-foreground">{feature.description}</p>
            </div>
          );
        })}
      </div>
      {showInstitutionalNote && (
        <p className="text-center text-[10px] text-muted-foreground mt-4">
          Plateforme opérée par l'ANSUT pour le compte de la DGE
        </p>
      )}
    </div>
  );
};

export default SecondaryFeatures;
