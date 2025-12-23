import { 
  Home, 
  Package, 
  Wallet, 
  User, 
  Users, 
  ClipboardList,
  LayoutDashboard,
  MapPin,
  BarChart3,
  FileText,
  Mic,
  Leaf,
  Activity
} from 'lucide-react';
import type { NavItem } from '@/components/shared/UnifiedBottomNav';

// Merchant navigation
export const merchantNavItems: NavItem[] = [
  { icon: Home, label: 'Accueil', path: '/marchand' },
  { icon: Package, label: 'Stock', path: '/marchand/stock' },
  { icon: Wallet, label: 'Encaisser', path: '/marchand/encaisser' },
  { icon: User, label: 'Profil', path: '/marchand/profil' },
];

// Agent navigation
export const agentNavItems: NavItem[] = [
  { icon: Home, label: 'Accueil', path: '/agent' },
  { icon: Users, label: 'Marchands', path: '/agent/marchands' },
  { icon: User, label: 'Profil', path: '/agent/profil' },
];

// Cooperative navigation
export const cooperativeNavItems: NavItem[] = [
  { icon: Home, label: 'Accueil', path: '/cooperative' },
  { icon: Package, label: 'Stock', path: '/cooperative/stock' },
  { icon: ClipboardList, label: 'Commandes', path: '/cooperative/commandes' },
  { icon: User, label: 'Profil', path: '/cooperative/profil' },
];

// Admin navigation
export const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: MapPin, label: 'Carte', path: '/admin/carte' },
  { icon: BarChart3, label: 'Stats', path: '/admin/analytics' },
  { icon: FileText, label: 'Rapports', path: '/admin/rapports' },
];

// Admin secondary navigation (for pages like vivriers, studio, etc.)
export const adminSecondaryNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Leaf, label: 'Vivriers', path: '/admin/vivriers' },
  { icon: Mic, label: 'Studio', path: '/admin/studio' },
  { icon: Activity, label: 'Monitoring', path: '/admin/monitoring' },
];
