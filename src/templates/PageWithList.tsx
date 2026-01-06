import React from 'react';
import { PageLayout, PageLayoutProps } from './PageLayout';
import { SearchInput, FilterChips, AnimatedList, AnimatedListItem, type FilterOption } from '@/shared/ui';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Re-export FilterOption pour compatibilité
export type { FilterOption } from '@/shared/ui';

export interface PageWithListProps<T> extends Omit<PageLayoutProps, 'children'> {
  /** Valeur de recherche */
  searchValue: string;
  /** Callback changement de recherche */
  onSearchChange: (value: string) => void;
  /** Placeholder de la recherche */
  searchPlaceholder?: string;
  /** Délai de debounce de la recherche en ms */
  searchDebounceMs?: number;
  /** Options de filtres */
  filterOptions?: FilterOption[];
  /** Valeur du filtre actif */
  filterValue?: string;
  /** Callback changement de filtre */
  onFilterChange?: (value: string) => void;
  /** Liste des items à afficher */
  items: T[];
  /** Fonction de rendu pour chaque item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Clé unique pour chaque item */
  keyExtractor: (item: T, index: number) => string;
  /** État de chargement */
  isLoading?: boolean;
  /** Nombre de skeletons à afficher pendant le chargement */
  skeletonCount?: number;
  /** Composant skeleton personnalisé */
  renderSkeleton?: () => React.ReactNode;
  /** Message/composant état vide */
  emptyState?: React.ReactNode;
  /** Message/composant état erreur */
  errorState?: React.ReactNode;
  /** Contenu supplémentaire au-dessus de la liste */
  headerContent?: React.ReactNode;
  /** Contenu supplémentaire en-dessous de la liste */
  footerContent?: React.ReactNode;
  /** Classes CSS pour le conteneur de liste */
  listClassName?: string;
  /** Délai d'animation stagger entre les items */
  staggerDelay?: number;
}

// ============================================
// SKELETON PAR DÉFAUT
// ============================================

const DefaultListSkeleton: React.FC = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================
// ÉTAT VIDE PAR DÉFAUT
// ============================================

const DefaultEmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <span className="text-2xl">📭</span>
    </div>
    <h3 className="text-lg font-medium text-foreground mb-1">
      Aucun résultat
    </h3>
    <p className="text-sm text-muted-foreground">
      Essayez de modifier vos critères de recherche
    </p>
  </div>
);

// ============================================
// COMPOSANT
// ============================================

/**
 * Template pour les pages avec liste filtrable.
 * Hérite de PageLayout et ajoute recherche + filtres + liste animée.
 * 
 * @example
 * ```tsx
 * <PageWithList
 *   title="Mon Stock"
 *   navItems={merchantNavItems}
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   filterOptions={[
 *     { value: 'all', label: 'Tous' },
 *     { value: 'low', label: 'Stock bas', count: 3 },
 *   ]}
 *   filterValue={filter}
 *   onFilterChange={setFilter}
 *   items={filteredProducts}
 *   keyExtractor={(item) => item.id}
 *   renderItem={(product) => <ProductCard product={product} />}
 *   isLoading={isLoading}
 *   emptyState={<CustomEmptyState />}
 * />
 * ```
 */
export function PageWithList<T>({
  // Search props
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  searchDebounceMs = 300,
  // Filter props
  filterOptions,
  filterValue,
  onFilterChange,
  // List props
  items,
  renderItem,
  keyExtractor,
  isLoading = false,
  skeletonCount = 5,
  renderSkeleton,
  emptyState,
  errorState,
  headerContent,
  footerContent,
  listClassName,
  staggerDelay = 0.05,
  // PageLayout props
  ...pageLayoutProps
}: PageWithListProps<T>) {
  const hasFilters = filterOptions && filterOptions.length > 0 && onFilterChange;
  const isEmpty = !isLoading && items.length === 0;
  const hasError = Boolean(errorState);

  return (
    <PageLayout {...pageLayoutProps} withPadding={false}>
      {/* Search Bar (sticky) */}
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        debounceMs={searchDebounceMs}
        sticky
      />

      {/* Filters */}
      {hasFilters && (
        <div className="px-4 py-2">
          <FilterChips
            options={filterOptions}
            value={filterValue || ''}
            onChange={onFilterChange}
          />
        </div>
      )}

      {/* Header Content */}
      {headerContent && <div className="px-4">{headerContent}</div>}

      {/* Main Content */}
      <div className={cn('px-4 py-4', listClassName)}>
        {/* Loading State */}
        {isLoading && (
          renderSkeleton ? (
            <div className="space-y-3">
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
              ))}
            </div>
          ) : (
            <DefaultListSkeleton />
          )
        )}

        {/* Error State */}
        {!isLoading && hasError && errorState}

        {/* Empty State */}
        {isEmpty && !hasError && (emptyState || <DefaultEmptyState />)}

        {/* List */}
        {!isLoading && !isEmpty && !hasError && (
          <AnimatedList staggerDelay={staggerDelay} className="space-y-3">
            {items.map((item, index) => (
              <AnimatedListItem key={keyExtractor(item, index)}>
                {renderItem(item, index)}
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </div>

      {/* Footer Content */}
      {footerContent && <div className="px-4 pb-4">{footerContent}</div>}
    </PageLayout>
  );
}

export default PageWithList;
