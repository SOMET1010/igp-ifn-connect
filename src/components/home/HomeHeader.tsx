import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const HomeHeader: React.FC = () => {
  const { language, setLanguage, languages: allLanguages } = useLanguage();

  // Only show FR and Dioula in header selector
  const headerLanguages = allLanguages.filter(l => l.code === 'fr' || l.code === 'dioula');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-sanguine to-terre-battue flex items-center justify-center shadow-lg">
            <span className="text-white font-nunito font-extrabold text-sm">P</span>
          </div>
          <span className="font-nunito font-extrabold text-lg text-charbon hidden sm:block">
            PNAVIM-CI
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-3 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80"
              >
                <Globe className="w-4 h-4 mr-1" />
                <span className="font-medium uppercase">{language === 'dioula' ? 'DI' : language.slice(0, 2).toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {headerLanguages.map((lng) => (
                <DropdownMenuItem
                  key={lng.code}
                  onClick={() => setLanguage(lng.code)}
                  className={language === lng.code ? 'bg-orange-sanguine/10' : ''}
                >
                  {lng.nativeName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Login Button */}
          <Link to="/marchand/login">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl bg-white/80 backdrop-blur-sm border-terre-battue/30 hover:bg-terre-battue hover:text-white transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              <span className="font-medium">Se connecter</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
