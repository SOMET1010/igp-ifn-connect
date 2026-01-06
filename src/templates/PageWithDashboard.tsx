import React from 'react';
import { LucideIcon } from 'lucide-react';
import { PageLayout, PageLayoutProps } from './PageLayout';
import { StatCard } from '@/shared/ui/StatCard';
import { UnifiedActionCard } from '@/shared/ui/UnifiedActionCard';
import { AnimatedList } from '@/shared/ui/AnimatedList';
import { AnimatedListItem } from '@/shared/ui/AnimatedListItem';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export interface StatItem {
  /** Identifiant unique */
  id: string;
  /** Titre de la statistique (affiché en petit) */
  title: string;
  /** Valeur affichée (grand) */
  value: string | number;
  /** Icône Lucide */
  icon: LucideIcon;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Variante de style */
  variant?: 'default' | 'warning' | 'success' | 'primary';
  /** Callback au clic */
  onClick?: () => void;
}

export interface ActionItem {
  /** Identifiant unique */
  id: string;
  /** Titre de l'action */
  title: string;
  /** Description courte */
  description?: string;
  /** Icône Lucide */
  icon: LucideIcon;
  /** Callback au clic */
  onClick: () => void;
  /** Variante de style */
  variant?: 'default' | 'primary';
  /** Badge optionnel (nombre) */
  badge?: number;
  /** Mode compact */
  compact?: boolean;
}

export interface PageWithDashboardProps extends Omit<PageLayoutProps, 'children'> {
  /** Liste des statistiques à afficher */
  stats: StatItem[];
  /** Liste des actions rapides */
  actions?: ActionItem[];
  /** Composant chart optionnel */
  chart?: React.ReactNode;
  /** Titre de la section chart */
  chartTitle?: string;
  /** Titre de la section actions */
  actionsTitle?: string;
  /** Contenu supplémentaire en haut */
  headerContent?: React.ReactNode;
  /** Contenu supplémentaire en bas */
  footerContent?: React.ReactNode;
  /** État de chargement */
  isLoading?: boolean;
  /** Nombre de colonnes pour les stats (mobile) */
  statColumns?: 1 | 2;
  /** Classes CSS pour le conteneur */
  contentClassName?: string;
}

// ============================================
// SKELETON
// ============================================

const DashboardSkeleton: React.FC<{ statCount?: number }> = ({ statCount = 4 }) => (
  <div className="space-y-6 py-4">
    {/* Stats skeleton */}
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: statCount }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-card">
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ))}
    </div>

    {/* Chart skeleton */}
    <div className="p-4 rounded-xl border border-border bg-card">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>

    {/* Actions skeleton */}
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================
// COMPOSANT
// ============================================

/**
 * Template pour les pages dashboard.
 * Hérite de PageLayout et ajoute stats + chart + actions.
 * 
 * @example
 * ```tsx
 * <PageWithDashboard
 *   title="Dashboard"
 *   subtitle="Marchand"
 *   navItems={merchantNavItems}
 *   stats={[
 *     { id: '1', title: "Ventes", value: "45 000 F", icon: TrendingUp, variant: 'success' },
 *     { id: '2', title: "Transactions", value: 12, icon: Receipt },
 *   ]}
 *   chart={<SalesChart data={chartData} />}
 *   chartTitle="Évolution des ventes"
 *   actions={[
 *     { id: '1', title: "Nouvelle vente", icon: Plus, onClick: handleNewSale, variant: 'primary' },
 *   ]}
 *   isLoading={isLoading}
 * />
 * ```
 */
export const PageWithDashboard: React.FC<PageWithDashboardProps> = ({
  stats,
  actions = [],
  chart,
  chartTitle,
  actionsTitle = 'Actions rapides',
  headerContent,
  footerContent,
  isLoading = false,
  statColumns = 2,
  contentClassName,
  ...pageLayoutProps
}) => {
  const hasActions = actions.length > 0;
  const hasChart = Boolean(chart);


  return (
    <PageLayout {...pageLayoutProps}>
      <div className={cn('py-4 space-y-6', contentClassName)}>
        {/* Loading State */}
        {isLoading && <DashboardSkeleton statCount={stats.length || 4} />}

        {!isLoading && (
          <>
            {/* Header Content */}
            {headerContent}

            {/* Stats Grid */}
            <AnimatedList 
              className={cn(
                'grid gap-3',
                statColumns === 1 ? 'grid-cols-1' : 'grid-cols-2'
              )}
            >
              {stats.map((stat) => (
                <AnimatedListItem key={stat.id}>
                  <StatCard
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    subtitle={stat.subtitle}
                    variant={stat.variant}
                    className={cn(
                      stat.onClick && 'cursor-pointer hover:shadow-md'
                    )}
                  />
                </AnimatedListItem>
              ))}
            </AnimatedList>

            {/* Chart Section */}
            {hasChart && (
              <section className="space-y-3">
                {chartTitle && (
                  <h2 className="text-sm font-medium text-muted-foreground px-1">
                    {chartTitle}
                  </h2>
                )}
                <div className="rounded-xl border border-border bg-card p-4 overflow-hidden">
                  {chart}
                </div>
              </section>
            )}

            {/* Actions Section */}
            {hasActions && (
              <section className="space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground px-1">
                  {actionsTitle}
                </h2>
                <AnimatedList className="space-y-2">
                  {actions.map((action) => (
                    <AnimatedListItem key={action.id}>
                      <UnifiedActionCard
                        title={action.title}
                        description={action.description}
                        icon={action.icon}
                        onClick={action.onClick}
                        variant={action.variant}
                        badge={action.badge}
                        compact={action.compact}
                      />
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </section>
            )}

            {/* Footer Content */}
            {footerContent}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default PageWithDashboard;
