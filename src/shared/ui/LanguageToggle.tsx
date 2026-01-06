import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSensoryFeedback } from '@/hooks/useSensoryFeedback';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'icon';
}

export function LanguageToggle({ className, variant = 'pill' }: LanguageToggleProps) {
  const { language, setLanguage, languages, currentLanguageInfo } = useLanguage();
  const { triggerTap } = useSensoryFeedback();

  const handleLanguageChange = (code: string) => {
    triggerTap();
    setLanguage(code as 'fr' | 'dioula' | 'baoule' | 'bete' | 'senoufo' | 'malinke');
  };

  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", className)}
          >
            <Globe className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                language === lang.code && "bg-primary/10 text-primary font-medium"
              )}
            >
              <span className="text-lg">{lang.symbol}</span>
              <span>{lang.nativeName}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Variant: pill - bouton compact FR/Dioula
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-2.5 rounded-full border-2 font-medium text-xs gap-1.5",
            "bg-background hover:bg-muted transition-colors",
            className
          )}
        >
          <span className="text-base">{currentLanguageInfo.symbol}</span>
          <span className="hidden sm:inline uppercase">{currentLanguageInfo.code.slice(0, 2)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              language === lang.code && "bg-primary/10 text-primary font-medium"
            )}
          >
            <span className="text-lg">{lang.symbol}</span>
            <div className="flex flex-col">
              <span className="text-sm">{lang.nativeName}</span>
              {lang.code !== 'fr' && (
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
