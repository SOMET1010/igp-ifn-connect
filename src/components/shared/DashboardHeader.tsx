import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userName?: string;
  onSignOut: () => void;
  rightContent?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  userName,
  onSignOut,
  rightContent
}) => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
        <div>
          {subtitle && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {subtitle}
            </p>
          )}
          <h1 className="text-lg font-semibold text-foreground">
            {userName ? `Bonjour, ${userName}` : title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {rightContent}
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSignOut}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
