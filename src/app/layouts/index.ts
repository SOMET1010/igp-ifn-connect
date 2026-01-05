/**
 * Layouts - Structures de page
 * 
 * Architecture unifiée Phase 3:
 * - AppShell: Shell global (banners, indicators)
 * - PageLayout: Template standard pour toutes les pages
 * - RoleLayout: Layout avec navigation contextuelle par rôle
 */

export { AppShell } from './AppShell';
export { PageLayout, type BreadcrumbItem } from './PageLayout';
export { RoleLayout } from './RoleLayout';
