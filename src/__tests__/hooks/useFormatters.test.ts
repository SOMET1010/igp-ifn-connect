import { describe, it, expect } from 'vitest';

// Test des fonctions de formatage communes
describe('Formatters', () => {
  describe('formatCurrency', () => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('fr-CI', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    it('should format positive amounts correctly', () => {
      expect(formatCurrency(1000)).toContain('1');
      expect(formatCurrency(1000)).toContain('000');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toContain('0');
    });

    it('should format large amounts correctly', () => {
      const result = formatCurrency(1000000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });
  });

  describe('formatPhone', () => {
    const formatPhone = (phone: string): string => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
      }
      return phone;
    };

    it('should format 10-digit phone numbers', () => {
      expect(formatPhone('0708090102')).toBe('07 08 09 01 02');
    });

    it('should return original for non-10-digit numbers', () => {
      expect(formatPhone('123')).toBe('123');
    });

    it('should clean non-digit characters', () => {
      expect(formatPhone('07-08-09-01-02')).toBe('07 08 09 01 02');
    });
  });

  describe('formatDate', () => {
    const formatDate = (date: Date): string => {
      return new Intl.DateTimeFormat('fr-CI', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date);
    };

    it('should format dates in French locale', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });
});
