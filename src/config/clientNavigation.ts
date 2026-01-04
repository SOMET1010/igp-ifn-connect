import { Home, Grid, Wallet, FileText, User } from 'lucide-react';
import type { NavItem } from '@/components/shared/UnifiedBottomNav';

export const clientNavItems: NavItem[] = [
  { icon: Home, label: 'Accueil', path: '/client' },
  { icon: Grid, label: 'Services', path: '/client/services' },
  { icon: Wallet, label: 'Portefeuille', path: '/client/wallet' },
  { icon: FileText, label: 'Historique', path: '/client/transactions' },
  { icon: User, label: 'Profil', path: '/client/profile' },
];
