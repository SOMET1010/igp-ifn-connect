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
  Activity,
  Store,
  UserCog,
  Wheat
} from 'lucide-react';
import type { NavItem } from '@/shared/ui/UnifiedBottomNav';

// Merchant navigation
// Navigation marchand simplifiée - MAX 3 items pour UX inclusive
export const merchantNavItems: NavItem[] = [
  { icon: Home, label: 'Accueil', path: '/marchand' },
  { icon: Wallet, label: 'Vendre', path: '/marchand/vendre' },
  { icon: User, label: 'Moi', path: '/marchand/profil' },
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

// Admin navigation - Main pages
export const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Store, label: 'Marchands', path: '/admin/marchands' },
  { icon: UserCog, label: 'Agents', path: '/admin/agents' },
  { icon: Leaf, label: 'Producteurs', path: '/admin/producteurs' },
];

// Admin secondary navigation (for specialized pages like vivriers, studio, etc.)
export const adminSecondaryNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Wheat, label: 'Vivriers', path: '/admin/vivriers' },
  { icon: Mic, label: 'Studio', path: '/admin/studio' },
  { icon: Activity, label: 'Monitoring', path: '/admin/monitoring' },
];

// Admin analytics navigation
export const adminAnalyticsNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: MapPin, label: 'Carte', path: '/admin/carte' },
  { icon: BarChart3, label: 'Stats', path: '/admin/analytics' },
  { icon: FileText, label: 'Rapports', path: '/admin/rapports' },
];
