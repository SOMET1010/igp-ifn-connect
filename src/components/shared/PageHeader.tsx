import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
  rightAction?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBack = false, 
  showMenu = false,
  onMenuClick,
  rightAction 
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-gradient-africa text-primary-foreground shadow-africa">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
          )}
          {showMenu && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMenuClick}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Menu className="w-6 h-6" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && (
              <p className="text-sm opacity-80">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && (
          <div>{rightAction}</div>
        )}
      </div>
    </header>
  );
}
