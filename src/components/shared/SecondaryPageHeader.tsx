import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

interface SecondaryPageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightContent?: React.ReactNode;
}

export const SecondaryPageHeader: React.FC<SecondaryPageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightContent,
}) => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center gap-3 p-4 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-10 w-10 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rightContent}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
