import { useState, useEffect, useMemo } from 'react';

/**
 * Hook pour retarder la mise à jour d'une valeur.
 * Utile pour les champs de recherche pour éviter les re-renders excessifs.
 * 
 * @param value - La valeur à debouncer
 * @param delay - Le délai en millisecondes (défaut: 300ms)
 * @returns La valeur debouncée
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Options pour le hook useDebouncedSearch
 */
interface UseDebouncedSearchOptions<T> {
  /** Liste des éléments à filtrer */
  items: T[];
  /** Champs à rechercher ou fonction de filtrage personnalisée */
  searchFields: (keyof T)[] | ((item: T, query: string) => boolean);
  /** Délai de debounce en ms (défaut: 300ms) */
  delay?: number;
}

/**
 * Résultat du hook useDebouncedSearch
 */
interface UseDebouncedSearchResult<T> {
  /** Valeur actuelle du champ de recherche */
  searchQuery: string;
  /** Fonction pour mettre à jour la recherche */
  setSearchQuery: (query: string) => void;
  /** Valeur debouncée de la recherche */
  debouncedQuery: string;
  /** Liste filtrée des éléments */
  filteredItems: T[];
  /** Indique si une recherche est en cours (pendant le debounce) */
  isSearching: boolean;
}

/**
 * Hook spécialisé pour la recherche avec debounce et filtrage automatique.
 * Combine useDebounce avec la logique de filtrage pour simplifier l'implémentation.
 * 
 * @example
 * // Usage avec liste de champs
 * const { searchQuery, setSearchQuery, filteredItems } = useDebouncedSearch({
 *   items: merchants,
 *   searchFields: ['full_name', 'phone', 'cmu_number'],
 * });
 * 
 * @example
 * // Usage avec fonction personnalisée
 * const { searchQuery, setSearchQuery, filteredItems } = useDebouncedSearch({
 *   items: merchants,
 *   searchFields: (item, query) => 
 *     item.full_name.toLowerCase().includes(query) ||
 *     item.tags?.some(tag => tag.includes(query)),
 * });
 */
export function useDebouncedSearch<T>({
  items,
  searchFields,
  delay = 300,
}: UseDebouncedSearchOptions<T>): UseDebouncedSearchResult<T> {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, delay);

  const filteredItems = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim();
    if (!trimmedQuery) return items;

    const query = trimmedQuery.toLowerCase();

    return items.filter((item) => {
      // Fonction de filtrage personnalisée
      if (typeof searchFields === 'function') {
        return searchFields(item, query);
      }

      // Filtrage par liste de champs
      return searchFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        return false;
      });
    });
  }, [items, debouncedQuery, searchFields]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    filteredItems,
    isSearching: searchQuery !== debouncedQuery,
  };
}
