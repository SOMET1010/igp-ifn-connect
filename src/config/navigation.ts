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
import type { NavItem } from '@/shared/ui';

// ============================================
// NAVIGATION INCLUSIVE - Libellés français simples
// Compréhensibles sans formation
// ============================================

// MARCHAND - 3 items max pour UX inclusive
export const merchantNavItems: NavItem[] = [
  { icon: Home, label: 'Accueil', path: '/marchand' },
  { icon: Wallet, label: 'Vendre', path: '/marchand/vendre' },
  { icon: User, label: 'Moi', path: '/marchand/profil' },
];

// AGENT - Navigation simplifiée
export const agentNavItems: NavItem[] = [
  { icon: Home, label: 'Accueil', path: '/agent' },
  { icon: Users, label: 'Mes gens', path: '/agent/marchands' },
  { icon: User, label: 'Moi', path: '/agent/profil' },
];

// COOPÉRATIVE - Navigation simplifiée
export const cooperativeNavItems: NavItem[] = [
  { icon: Home, label: 'Accueil', path: '/cooperative' },
  { icon: Package, label: 'Nos produits', path: '/cooperative/stock' },
  { icon: ClipboardList, label: 'Demandes', path: '/cooperative/commandes' },
  { icon: User, label: 'Moi', path: '/cooperative/profil' },
];

// ADMIN - Tableau de bord (usage interne)
export const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
  { icon: Store, label: 'Marchands', path: '/admin/marchands' },
  { icon: UserCog, label: 'Agents', path: '/admin/agents' },
  { icon: Leaf, label: 'Producteurs', path: '/admin/producteurs' },
];

// ADMIN - Navigation secondaire
export const adminSecondaryNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
  { icon: Package, label: 'Produits', path: '/admin/produits' },
  { icon: Wheat, label: 'Vivriers', path: '/admin/vivriers' },
  { icon: Mic, label: 'Studio', path: '/admin/studio' },
];

// ADMIN - Statistiques
export const adminAnalyticsNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
  { icon: MapPin, label: 'Carte', path: '/admin/carte' },
  { icon: BarChart3, label: 'Chiffres', path: '/admin/analytics' },
  { icon: FileText, label: 'Rapports', path: '/admin/rapports' },
];
