/**
 * Types UI partagés
 * États, props communes, types de composants
 */

// ============================================
// ÉTATS DE CHARGEMENT
// ============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export interface PaginatedState<T> extends AsyncState<T[]> {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

// ============================================
// PROPS COMMUNES
// ============================================

export interface BaseComponentProps {
  className?: string;
  testId?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithOptionalChildren {
  children?: React.ReactNode;
}

// ============================================
// FORMULAIRES
// ============================================

export interface FormFieldState {
  value: string;
  error: string | null;
  touched: boolean;
}

export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

// ============================================
// MODALES & SHEETS
// ============================================

export interface ModalState {
  isOpen: boolean;
  onClose: () => void;
}

export interface SheetState extends ModalState {
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export interface DialogProps extends ModalState {
  title?: string;
  description?: string;
}

// ============================================
// LISTES & TABLEAUX
// ============================================

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'in';
  value: unknown;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

// ============================================
// NOTIFICATIONS & FEEDBACK
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ============================================
// NAVIGATION
// ============================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  children?: NavItem[];
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  content?: React.ReactNode;
}

// ============================================
// RESPONSIVE
// ============================================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// ============================================
// THEME
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  destructive: string;
}
