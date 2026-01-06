/**
 * Tests useErrorHandler
 * 
 * Tests unitaires pour le hook de gestion d'erreurs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectErrorCode', () => {
    it('should detect NETWORK_ERROR from "Failed to fetch"', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Failed to fetch');
      const code = result.current.detectErrorCode(error);
      
      expect(code).toBe('NETWORK_ERROR');
    });

    it('should detect NETWORK_ERROR from "Network Error"', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Network Error');
      const code = result.current.detectErrorCode(error);
      
      expect(code).toBe('NETWORK_ERROR');
    });

    it('should detect NETWORK_ERROR from "fetch failed"', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('fetch failed');
      const code = result.current.detectErrorCode(error);
      
      expect(code).toBe('NETWORK_ERROR');
    });

    it('should detect UNAUTHORIZED from error with status 401', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = { status: 401, message: 'Unauthorized' };
      const code = result.current.detectErrorCode(error);
      
      expect(code).toBe('UNAUTHORIZED');
    });

    it('should detect FORBIDDEN from error with status 403', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = { status: 403, message: 'Forbidden' };
      const code = result.current.detectErrorCode(error);
      
      expect(code).toBe('FORBIDDEN');
    });

    it('should detect NOT_FOUND from error with status 404', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = { status: 404, message: 'Not Found' };
      const code = result.current.detectErrorCode(error);
      
      expect(code).toBe('NOT_FOUND');
    });

    it('should detect SERVER_ERROR from error with status 500', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = { status: 500, message: 'Internal Server Error' };
      const code = result.current.detectErrorCode(error);
      
      expect(code).toBe('SERVER_ERROR');
    });

    it('should detect SESSION_EXPIRED from relevant error messages', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error1 = new Error('JWT expired');
      const error2 = new Error('session expired');
      const error3 = new Error('token expired');
      
      expect(result.current.detectErrorCode(error1)).toBe('SESSION_EXPIRED');
      expect(result.current.detectErrorCode(error2)).toBe('SESSION_EXPIRED');
      expect(result.current.detectErrorCode(error3)).toBe('SESSION_EXPIRED');
    });

    it('should detect VALIDATION_ERROR from validation messages', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Validation failed: email is invalid');
      const code = result.current.detectErrorCode(error);
      
      expect(code).toBe('VALIDATION_ERROR');
    });

    it('should return UNKNOWN for unrecognized errors', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Something weird happened');
      const code = result.current.detectErrorCode(error);
      
      expect(code).toBe('UNKNOWN');
    });

    it('should return UNKNOWN for null/undefined', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      expect(result.current.detectErrorCode(null)).toBe('UNKNOWN');
      expect(result.current.detectErrorCode(undefined)).toBe('UNKNOWN');
    });
  });

  describe('getHumanReadableMessage', () => {
    it('should return French message for NETWORK_ERROR', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Failed to fetch');
      const message = result.current.getHumanReadableMessage(error);
      
      expect(message).toContain('connexion');
    });

    it('should return French message for UNAUTHORIZED', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = { status: 401, message: 'Unauthorized' };
      const message = result.current.getHumanReadableMessage(error);
      
      expect(message).toContain('autorisé');
    });

    it('should return French message for SESSION_EXPIRED', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('JWT expired');
      const message = result.current.getHumanReadableMessage(error);
      
      expect(message).toContain('session');
    });

    it('should return French message for SERVER_ERROR', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = { status: 500, message: 'Internal Server Error' };
      const message = result.current.getHumanReadableMessage(error);
      
      expect(message).toContain('serveur');
    });

    it('should return default message for UNKNOWN', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Random error');
      const message = result.current.getHumanReadableMessage(error);
      
      expect(message).toContain('erreur');
    });

    it('should return custom fallback when provided', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Random error');
      const fallback = 'Message personnalisé';
      const message = result.current.getHumanReadableMessage(error, fallback);
      
      expect(message).toBe(fallback);
    });
  });

  describe('handleError', () => {
    it('should return detected error code', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Failed to fetch');
      const code = result.current.handleError(error);
      
      expect(code).toBe('NETWORK_ERROR');
    });

    it('should not show toast when silent option is true', async () => {
      const { toast } = await import('sonner');
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Test error');
      result.current.handleError(error, undefined, { silent: true });
      
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should log error with context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Test error');
      const context = { module: 'TestModule', action: 'testAction' };
      
      result.current.handleError(error, context);
      
      // Vérifie que console.error a été appelé
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('reportError', () => {
    it('should log error without showing toast', async () => {
      const { toast } = await import('sonner');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Silent error');
      result.current.reportError(error);
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should include context in log', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useErrorHandler());
      
      const error = new Error('Contextual error');
      const context = { module: 'Auth', action: 'login', userId: '123' };
      
      result.current.reportError(error, context);
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
