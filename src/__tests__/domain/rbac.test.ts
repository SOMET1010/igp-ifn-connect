/**
 * Tests RBAC - Role-Based Access Control
 * 
 * Tests unitaires pour les fonctions de contrôle d'accès
 */

import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  canAccessPage,
  getRedirectPath,
  getBasePath,
  getHighestPriorityRole,
  ROLE_PAGES,
  ROLE_ACTIONS,
  ROLE_PRIORITY,
  type AppRole,
} from '@/domain/rbac';

describe('RBAC - Role-Based Access Control', () => {
  
  describe('hasPermission', () => {
    it('should return true for admin with any action (wildcard)', () => {
      expect(hasPermission('admin', 'sell')).toBe(true);
      expect(hasPermission('admin', 'enroll_merchant')).toBe(true);
      expect(hasPermission('admin', 'any_random_action')).toBe(true);
    });

    it('should return true for merchant with authorized actions', () => {
      expect(hasPermission('merchant', 'sell')).toBe(true);
      expect(hasPermission('merchant', 'view_stock')).toBe(true);
      expect(hasPermission('merchant', 'manage_stock')).toBe(true);
      expect(hasPermission('merchant', 'view_transactions')).toBe(true);
      expect(hasPermission('merchant', 'manage_credits')).toBe(true);
    });

    it('should return false for merchant with unauthorized actions', () => {
      expect(hasPermission('merchant', 'enroll_merchant')).toBe(false);
      expect(hasPermission('merchant', 'validate_kyc')).toBe(false);
      expect(hasPermission('merchant', 'publish_harvest')).toBe(false);
    });

    it('should return true for agent with authorized actions', () => {
      expect(hasPermission('agent', 'enroll_merchant')).toBe(true);
      expect(hasPermission('agent', 'view_merchants')).toBe(true);
      expect(hasPermission('agent', 'validate_merchant')).toBe(true);
      expect(hasPermission('agent', 'validate_kyc')).toBe(true);
    });

    it('should return false for agent with unauthorized actions', () => {
      expect(hasPermission('agent', 'sell')).toBe(false);
      expect(hasPermission('agent', 'manage_stock')).toBe(false);
    });

    it('should return true for cooperative with authorized actions', () => {
      expect(hasPermission('cooperative', 'manage_stock')).toBe(true);
      expect(hasPermission('cooperative', 'create_orders')).toBe(true);
      expect(hasPermission('cooperative', 'view_producers')).toBe(true);
    });

    it('should return true for producer with authorized actions', () => {
      expect(hasPermission('producer', 'publish_harvest')).toBe(true);
      expect(hasPermission('producer', 'update_harvest')).toBe(true);
      expect(hasPermission('producer', 'view_orders')).toBe(true);
    });

    it('should return false for user role (minimal permissions)', () => {
      expect(hasPermission('user', 'sell')).toBe(false);
      expect(hasPermission('user', 'view_profile')).toBe(true);
    });

    it('should return false for deprecated client role', () => {
      expect(hasPermission('client', 'sell')).toBe(false);
      expect(hasPermission('client', 'view_profile')).toBe(false);
    });
  });

  describe('canAccessPage', () => {
    it('should allow merchant to access merchant pages', () => {
      expect(canAccessPage('merchant', 'dashboard')).toBe(true);
      expect(canAccessPage('merchant', 'cashier')).toBe(true);
      expect(canAccessPage('merchant', 'stock')).toBe(true);
      expect(canAccessPage('merchant', 'transactions')).toBe(true);
      expect(canAccessPage('merchant', 'wallet')).toBe(true);
    });

    it('should deny merchant access to admin pages', () => {
      expect(canAccessPage('merchant', 'merchants')).toBe(false);
      expect(canAccessPage('merchant', 'agents')).toBe(false);
      expect(canAccessPage('merchant', 'monitoring')).toBe(false);
    });

    it('should allow agent to access agent pages', () => {
      expect(canAccessPage('agent', 'dashboard')).toBe(true);
      expect(canAccessPage('agent', 'merchants')).toBe(true);
      expect(canAccessPage('agent', 'enrollment')).toBe(true);
      expect(canAccessPage('agent', 'profile')).toBe(true);
    });

    it('should deny agent access to merchant-specific pages', () => {
      expect(canAccessPage('agent', 'cashier')).toBe(false);
      expect(canAccessPage('agent', 'wallet')).toBe(false);
    });

    it('should allow admin to access all admin pages', () => {
      expect(canAccessPage('admin', 'dashboard')).toBe(true);
      expect(canAccessPage('admin', 'merchants')).toBe(true);
      expect(canAccessPage('admin', 'agents')).toBe(true);
      expect(canAccessPage('admin', 'monitoring')).toBe(true);
      expect(canAccessPage('admin', 'analytics')).toBe(true);
    });

    it('should allow cooperative to access cooperative pages', () => {
      expect(canAccessPage('cooperative', 'dashboard')).toBe(true);
      expect(canAccessPage('cooperative', 'stock')).toBe(true);
      expect(canAccessPage('cooperative', 'orders')).toBe(true);
      expect(canAccessPage('cooperative', 'producers')).toBe(true);
    });

    it('should allow producer to access producer pages', () => {
      expect(canAccessPage('producer', 'dashboard')).toBe(true);
      expect(canAccessPage('producer', 'harvests')).toBe(true);
      expect(canAccessPage('producer', 'orders')).toBe(true);
    });

    it('should deny producer access to cooperative-specific pages', () => {
      expect(canAccessPage('producer', 'stock')).toBe(false);
    });

    it('should allow user to access only profile', () => {
      expect(canAccessPage('user', 'profile')).toBe(true);
      expect(canAccessPage('user', 'dashboard')).toBe(false);
    });

    it('should deny deprecated client role all pages', () => {
      expect(canAccessPage('client', 'dashboard')).toBe(false);
      expect(canAccessPage('client', 'profile')).toBe(false);
    });
  });

  describe('getRedirectPath', () => {
    it('should return correct login path for merchant', () => {
      expect(getRedirectPath('merchant')).toBe('/marchand/login');
    });

    it('should return correct login path for agent', () => {
      expect(getRedirectPath('agent')).toBe('/agent/login');
    });

    it('should return correct login path for admin', () => {
      expect(getRedirectPath('admin')).toBe('/admin/login');
    });

    it('should return correct login path for cooperative', () => {
      expect(getRedirectPath('cooperative')).toBe('/cooperative/login');
    });

    it('should return correct login path for producer', () => {
      expect(getRedirectPath('producer')).toBe('/producteur/login');
    });

    it('should return /auth for user role', () => {
      expect(getRedirectPath('user')).toBe('/auth');
    });

    it('should return / for deprecated client role', () => {
      expect(getRedirectPath('client')).toBe('/');
    });
  });

  describe('getBasePath', () => {
    it('should return correct base path for each role', () => {
      expect(getBasePath('merchant')).toBe('/marchand');
      expect(getBasePath('agent')).toBe('/agent');
      expect(getBasePath('admin')).toBe('/admin');
      expect(getBasePath('cooperative')).toBe('/cooperative');
      expect(getBasePath('producer')).toBe('/producteur');
      expect(getBasePath('user')).toBe('/');
      expect(getBasePath('client')).toBe('/');
    });
  });

  describe('getHighestPriorityRole', () => {
    it('should return admin when multiple roles include admin', () => {
      const roles: AppRole[] = ['merchant', 'admin', 'agent'];
      expect(getHighestPriorityRole(roles)).toBe('admin');
    });

    it('should return agent over merchant', () => {
      const roles: AppRole[] = ['merchant', 'agent'];
      expect(getHighestPriorityRole(roles)).toBe('agent');
    });

    it('should return cooperative or producer equally (same priority)', () => {
      const roles: AppRole[] = ['cooperative', 'producer'];
      const result = getHighestPriorityRole(roles);
      expect(['cooperative', 'producer']).toContain(result);
    });

    it('should return merchant over user', () => {
      const roles: AppRole[] = ['user', 'merchant'];
      expect(getHighestPriorityRole(roles)).toBe('merchant');
    });

    it('should return null for empty array', () => {
      expect(getHighestPriorityRole([])).toBeNull();
    });

    it('should return the only role when single element', () => {
      expect(getHighestPriorityRole(['merchant'])).toBe('merchant');
      expect(getHighestPriorityRole(['admin'])).toBe('admin');
    });
  });

  describe('ROLE_PRIORITY', () => {
    it('should have admin as highest priority', () => {
      expect(ROLE_PRIORITY.admin).toBe(5);
    });

    it('should have agent second highest', () => {
      expect(ROLE_PRIORITY.agent).toBe(4);
    });

    it('should have cooperative and producer equal', () => {
      expect(ROLE_PRIORITY.cooperative).toBe(ROLE_PRIORITY.producer);
      expect(ROLE_PRIORITY.cooperative).toBe(3);
    });

    it('should have merchant above user', () => {
      expect(ROLE_PRIORITY.merchant).toBeGreaterThan(ROLE_PRIORITY.user);
    });

    it('should have client and user lowest', () => {
      expect(ROLE_PRIORITY.client).toBe(1);
      expect(ROLE_PRIORITY.user).toBe(1);
    });
  });

  describe('ROLE_PAGES structure', () => {
    it('should have all roles defined', () => {
      const roles: AppRole[] = ['merchant', 'agent', 'cooperative', 'producer', 'admin', 'client', 'user'];
      roles.forEach(role => {
        expect(ROLE_PAGES[role]).toBeDefined();
        expect(Array.isArray(ROLE_PAGES[role])).toBe(true);
      });
    });

    it('should have dashboard for most roles', () => {
      expect(ROLE_PAGES.merchant).toContain('dashboard');
      expect(ROLE_PAGES.agent).toContain('dashboard');
      expect(ROLE_PAGES.admin).toContain('dashboard');
      expect(ROLE_PAGES.cooperative).toContain('dashboard');
      expect(ROLE_PAGES.producer).toContain('dashboard');
    });

    it('should have profile for most active roles', () => {
      expect(ROLE_PAGES.merchant).toContain('profile');
      expect(ROLE_PAGES.agent).toContain('profile');
      expect(ROLE_PAGES.cooperative).toContain('profile');
      expect(ROLE_PAGES.producer).toContain('profile');
      expect(ROLE_PAGES.user).toContain('profile');
    });
  });

  describe('ROLE_ACTIONS structure', () => {
    it('should have all roles defined', () => {
      const roles: AppRole[] = ['merchant', 'agent', 'cooperative', 'producer', 'admin', 'client', 'user'];
      roles.forEach(role => {
        expect(ROLE_ACTIONS[role]).toBeDefined();
        expect(Array.isArray(ROLE_ACTIONS[role])).toBe(true);
      });
    });

    it('should have admin with wildcard permission', () => {
      expect(ROLE_ACTIONS.admin).toContain('*');
    });

    it('should have client with empty actions (deprecated)', () => {
      expect(ROLE_ACTIONS.client).toHaveLength(0);
    });
  });
});
