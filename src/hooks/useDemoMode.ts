import { useEffect, useState } from 'react';

interface DemoData {
  agentId: string;
  merchantId: string;
  cooperativeId: string;
  profile: {
    full_name: string;
    phone: string;
  };
}

// IDs correspondant aux données de démonstration dans la base
const DEMO_DATA: Record<string, DemoData> = {
  agent: {
    agentId: 'a1111111-1111-1111-1111-111111111111',
    merchantId: '',
    cooperativeId: '',
    profile: {
      full_name: 'Kouassi Yao (Démo)',
      phone: '+225 07 00 00 01'
    }
  },
  merchant: {
    agentId: '',
    merchantId: 'b1111111-1111-1111-1111-111111111111', // Fatou Diallo
    cooperativeId: '',
    profile: {
      full_name: 'Fatou Diallo (Démo)',
      phone: '+225 07 01 00 01'
    }
  },
  cooperative: {
    agentId: '',
    merchantId: '',
    cooperativeId: 'ab175346-7e25-4821-af18-444fabac0b96', // Coopérative Savane du Nord
    profile: {
      full_name: 'Coopérative Savane du Nord',
      phone: '+225 07 00 00 03'
    }
  },
  admin: {
    agentId: '',
    merchantId: '',
    cooperativeId: '',
    profile: {
      full_name: 'Admin IFN (Démo)',
      phone: '+225 27 20 00 00'
    }
  }
};

export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoRole, setDemoRole] = useState<string | null>(null);
  const [demoData, setDemoData] = useState<DemoData | null>(null);

  useEffect(() => {
    const checkDemoMode = () => {
      const demoModeValue = sessionStorage.getItem('demo_mode');
      const role = sessionStorage.getItem('demo_role');
      
      if (demoModeValue === 'true' && role) {
        setIsDemoMode(true);
        setDemoRole(role);
        setDemoData(DEMO_DATA[role] || null);
      } else {
        setIsDemoMode(false);
        setDemoRole(null);
        setDemoData(null);
      }
    };

    checkDemoMode();
    
    // Listen for storage changes
    window.addEventListener('storage', checkDemoMode);
    return () => window.removeEventListener('storage', checkDemoMode);
  }, []);

  const exitDemoMode = () => {
    sessionStorage.removeItem('demo_mode');
    sessionStorage.removeItem('demo_role');
    setIsDemoMode(false);
    setDemoRole(null);
    setDemoData(null);
  };

  return {
    isDemoMode,
    demoRole,
    demoData,
    exitDemoMode,
    demoProfile: demoData?.profile || null
  };
}
