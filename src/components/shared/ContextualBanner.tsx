import React from 'react';

interface ContextualBannerProps {
  icon: string;
  message: string;
  variant?: 'default' | 'compact';
  maxWidth?: 'md' | 'lg' | '2xl';
  fontWeight?: 'normal' | 'medium';
}

export const ContextualBanner: React.FC<ContextualBannerProps> = ({
  icon,
  message,
  variant = 'default',
  maxWidth = '2xl',
  fontWeight = 'normal',
}) => {
  const maxWidthClass = {
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  const paddingClass = variant === 'compact' ? 'py-2.5' : 'py-3';
  const fontWeightClass = fontWeight === 'medium' ? 'font-medium' : '';

  return (
    <div className={`bg-muted/60 border-b border-border/50 ${paddingClass} px-4`}>
      <div className={`${maxWidthClass} mx-auto flex items-center justify-center gap-2 text-sm`}>
        <span>{icon}</span>
        <span className={`text-muted-foreground ${fontWeightClass}`}>{message}</span>
      </div>
    </div>
  );
};

export default ContextualBanner;
