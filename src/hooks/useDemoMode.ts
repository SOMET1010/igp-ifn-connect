import { useEffect, useState } from 'react';

interface DemoProfile {
  full_name: string;
  phone: string;
  avatar_url?: string;
}

interface DemoStats {
  today: number;
  week: number;
  total: number;
}

interface DemoMerchant {
  id: string;
  full_name: string;
  phone: string;
  activity_type: string;
  market_name: string;
  status: 'pending' | 'validated' | 'rejected';
  enrolled_at: string;
}

interface DemoTransaction {
  id: string;
  amount: number;
  transaction_type: 'cash' | 'mobile_money';
  created_at: string;
  reference: string;
}

interface DemoStockItem {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  status: 'ok' | 'low' | 'out';
}

interface DemoOrder {
  id: string;
  merchant_name: string;
  product_name: string;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'delivered';
  created_at: string;
}

interface DemoData {
  agentId: string;
  merchantId: string;
  cooperativeId: string;
  profile: DemoProfile;
  stats?: DemoStats;
  merchants?: DemoMerchant[];
  transactions?: DemoTransaction[];
  stock?: DemoStockItem[];
  orders?: DemoOrder[];
  todaySales?: number;
}

// Données de démonstration enrichies et réalistes
const DEMO_DATA: Record<string, DemoData> = {
  agent: {
    agentId: 'a1111111-1111-1111-1111-111111111111',
    merchantId: '',
    cooperativeId: '',
    profile: {
      full_name: 'Kouassi Yao',
      phone: '+225 07 00 00 01',
      avatar_url: ''
    },
    stats: {
      today: 3,
      week: 12,
      total: 87
    },
    merchants: [
      {
        id: 'm001',
        full_name: 'Fatou Diallo',
        phone: '+225 07 01 00 01',
        activity_type: 'Alimentation générale',
        market_name: 'Marché de Cocody',
        status: 'validated',
        enrolled_at: new Date().toISOString()
      },
      {
        id: 'm002',
        full_name: 'Amadou Koné',
        phone: '+225 07 01 00 02',
        activity_type: 'Vente de légumes',
        market_name: 'Marché de Treichville',
        status: 'pending',
        enrolled_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'm003',
        full_name: 'Marie Touré',
        phone: '+225 07 01 00 03',
        activity_type: 'Poissonnerie',
        market_name: 'Marché de Marcory',
        status: 'validated',
        enrolled_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'm004',
        full_name: 'Ibrahim Cissé',
        phone: '+225 07 01 00 04',
        activity_type: 'Boucherie',
        market_name: 'Marché de Yopougon',
        status: 'validated',
        enrolled_at: new Date(Date.now() - 259200000).toISOString()
      }
    ]
  },
  merchant: {
    agentId: '',
    merchantId: 'b1111111-1111-1111-1111-111111111111',
    cooperativeId: '',
    profile: {
      full_name: 'Fatou Diallo',
      phone: '+225 07 01 00 01',
      avatar_url: ''
    },
    todaySales: 47500,
    transactions: [
      {
        id: 't001',
        amount: 15000,
        transaction_type: 'cash',
        created_at: new Date().toISOString(),
        reference: 'TX-' + Date.now().toString(36).toUpperCase()
      },
      {
        id: 't002',
        amount: 7500,
        transaction_type: 'mobile_money',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        reference: 'TX-' + (Date.now() - 1000).toString(36).toUpperCase()
      },
      {
        id: 't003',
        amount: 25000,
        transaction_type: 'cash',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        reference: 'TX-' + (Date.now() - 2000).toString(36).toUpperCase()
      }
    ],
    stock: [
      { id: 's001', product_name: 'Riz local (5kg)', quantity: 45, unit: 'sacs', unit_price: 3500, status: 'ok' },
      { id: 's002', product_name: 'Huile Dinor (1L)', quantity: 8, unit: 'bouteilles', unit_price: 1200, status: 'low' },
      { id: 's003', product_name: 'Sucre (1kg)', quantity: 0, unit: 'paquets', unit_price: 800, status: 'out' },
      { id: 's004', product_name: 'Tomates fraîches', quantity: 25, unit: 'kg', unit_price: 500, status: 'ok' },
      { id: 's005', product_name: 'Oignons', quantity: 3, unit: 'kg', unit_price: 450, status: 'low' },
      { id: 's006', product_name: 'Attiéké', quantity: 30, unit: 'sachets', unit_price: 200, status: 'ok' }
    ]
  },
  cooperative: {
    agentId: '',
    merchantId: '',
    cooperativeId: 'ab175346-7e25-4821-af18-444fabac0b96',
    profile: {
      full_name: 'Coopérative Savane du Nord',
      phone: '+225 07 00 00 03',
      avatar_url: ''
    },
    stats: {
      today: 5,
      week: 23,
      total: 156
    },
    stock: [
      { id: 'cs001', product_name: 'Riz de Gagnoa IGP', quantity: 500, unit: 'kg', unit_price: 650, status: 'ok' },
      { id: 'cs002', product_name: 'Attiéké de Grand-Lahou IGP', quantity: 200, unit: 'kg', unit_price: 350, status: 'ok' },
      { id: 'cs003', product_name: 'Huile de palme artisanale', quantity: 50, unit: 'L', unit_price: 1500, status: 'low' },
      { id: 'cs004', product_name: 'Cacao en fèves', quantity: 1000, unit: 'kg', unit_price: 2200, status: 'ok' }
    ],
    orders: [
      {
        id: 'o001',
        merchant_name: 'Fatou Diallo',
        product_name: 'Riz de Gagnoa IGP',
        quantity: 50,
        total_amount: 32500,
        status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: 'o002',
        merchant_name: 'Amadou Koné',
        product_name: 'Attiéké de Grand-Lahou IGP',
        quantity: 30,
        total_amount: 10500,
        status: 'confirmed',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'o003',
        merchant_name: 'Marie Touré',
        product_name: 'Huile de palme artisanale',
        quantity: 10,
        total_amount: 15000,
        status: 'delivered',
        created_at: new Date(Date.now() - 172800000).toISOString()
      }
    ]
  },
  admin: {
    agentId: '',
    merchantId: '',
    cooperativeId: '',
    profile: {
      full_name: 'Admin IFN',
      phone: '+225 27 20 00 00',
      avatar_url: ''
    },
    stats: {
      today: 47,
      week: 234,
      total: 4521
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
    demoProfile: demoData?.profile || null,
    demoStats: demoData?.stats || null,
    demoMerchants: demoData?.merchants || [],
    demoTransactions: demoData?.transactions || [],
    demoStock: demoData?.stock || [],
    demoOrders: demoData?.orders || [],
    demoTodaySales: demoData?.todaySales || 0
  };
}
