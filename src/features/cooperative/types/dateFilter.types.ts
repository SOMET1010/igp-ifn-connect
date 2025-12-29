/**
 * Types pour les filtres temporels du dashboard coopérative
 */

export type DateFilterValue = 'today' | 'week' | 'month' | 'all';

export interface DateFilterOption {
  value: DateFilterValue;
  label: string;
}

export const DATE_FILTER_OPTIONS: DateFilterOption[] = [
  { value: 'today', label: 'Aujourd\'hui' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'all', label: 'Tout' },
];

/**
 * Calcule les dates de début et fin pour un filtre donné
 */
export function getDateRangeForFilter(filter: DateFilterValue): { startDate: Date | null; endDate: Date } {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  switch (filter) {
    case 'today': {
      const startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case 'week': {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case 'month': {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      return { startDate, endDate };
    }
    case 'all':
    default:
      return { startDate: null, endDate };
  }
}
