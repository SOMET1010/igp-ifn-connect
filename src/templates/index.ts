/**
 * Templates de pages réutilisables
 * 
 * Ces templates fournissent une structure cohérente pour toutes les pages
 * et réduisent la duplication de code layout.
 * 
 * @module templates
 */

// ============================================
// EXPORTS
// ============================================

export { PageLayout } from './PageLayout';
export type { PageLayoutProps } from './PageLayout';

export { PageWithList } from './PageWithList';
export type { PageWithListProps, FilterOption } from './PageWithList';

export { PageWithDashboard } from './PageWithDashboard';
export type { 
  PageWithDashboardProps, 
  StatItem, 
  ActionItem 
} from './PageWithDashboard';
