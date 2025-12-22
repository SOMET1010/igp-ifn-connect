import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LucideIcon } from 'lucide-react';

interface LoginCardProps {
  variant?: 'default' | 'compact';
  icon: LucideIcon;
  currentStep: number;
  totalSteps?: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showSecurityNote?: boolean;
  securityNoteText?: string;
  className?: string;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  variant = 'default',
  icon: Icon,
  currentStep,
  totalSteps = 3,
  title,
  subtitle,
  children,
  showSecurityNote = false,
  securityNoteText = 'Connexion chiffrée et sécurisée',
  className = '',
}) => {
  const isCompact = variant === 'compact';

  // Style variants
  const cardClass = isCompact
    ? `shadow-lg border-border/50 ${className}`
    : `w-full max-w-md shadow-lg border-2 ${className}`;

  const headerClass = isCompact ? 'text-center pb-4' : 'text-center pb-2';

  const iconContainerClass = isCompact
    ? 'mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3'
    : 'mx-auto mb-3 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center';

  const iconClass = isCompact ? 'w-7 h-7 text-primary' : 'h-8 w-8 text-primary';

  const stepperGapClass = isCompact ? 'gap-1.5' : 'gap-2';

  const titleClass = isCompact ? 'text-xl' : 'text-xl sm:text-2xl';
  const subtitleClass = isCompact ? 'text-sm' : 'text-sm sm:text-base';

  const contentClass = isCompact ? 'space-y-6' : 'space-y-5 pt-2';

  return (
    <Card className={cardClass}>
      <CardHeader className={headerClass}>
        {/* Icône */}
        <div className={iconContainerClass}>
          <Icon className={iconClass} />
        </div>

        {/* Stepper visuel */}
        <div className={`flex items-center justify-center ${stepperGapClass} mb-3`}>
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                isCompact
                  ? n <= currentStep
                    ? 'bg-primary'
                    : 'bg-muted-foreground/20'
                  : n === currentStep
                    ? 'bg-primary'
                    : n < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        <CardTitle className={titleClass}>{title}</CardTitle>
        <CardDescription className={subtitleClass}>{subtitle}</CardDescription>
      </CardHeader>

      <CardContent className={contentClass}>
        {children}

        {/* Note de sécurité */}
        {showSecurityNote && (
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <Lock className="h-3.5 w-3.5" />
            <span>{securityNoteText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginCard;
