import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDemoMode } from '@/shared/hooks';
import { TestTube, X } from 'lucide-react';

export function DemoBanner() {
  const { isDemoMode, demoRole, exitDemoMode, demoProfile } = useDemoMode();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  const handleExit = () => {
    exitDemoMode();
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            <TestTube className="h-3 w-3 mr-1" />
            DEMO
          </Badge>
          <span className="text-sm font-medium">
            Connecté en tant que: {demoProfile?.full_name || demoRole}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleExit}
          className="text-white hover:bg-white/20 gap-1"
        >
          <X className="h-4 w-4" />
          Quitter
        </Button>
      </div>
    </div>
  );
}
