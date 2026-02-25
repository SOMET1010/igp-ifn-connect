/**
 * MobileLayout - Layout responsive pour les pages mobiles JÙLABA
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  isActive?: boolean;
}

interface MobileLayoutProps {
  children: React.ReactNode;
  title: string;
  navItems: NavItem[];
  showHeader?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title,
  navItems,
  showHeader = true,
}) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="px-4 h-14 flex items-center justify-center">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = item.isActive ?? location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 mb-1", isActive && "scale-110")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
