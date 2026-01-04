import { describe, it, expect } from 'vitest';

// Validation des numéros de téléphone ivoiriens
describe('Phone Validation', () => {
  const isValidIvorianPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    // Format: 07XXXXXXXX, 05XXXXXXXX, 01XXXXXXXX
    const ivorianRegex = /^(07|05|01)\d{8}$/;
    return ivorianRegex.test(cleaned);
  };

  const normalizePhone = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    // Ajouter le préfixe +225 si absent
    if (cleaned.startsWith('225')) {
      cleaned = cleaned.substring(3);
    }
    return cleaned;
  };

  describe('isValidIvorianPhone', () => {
    it('should validate Orange numbers (07)', () => {
      expect(isValidIvorianPhone('0708091234')).toBe(true);
      expect(isValidIvorianPhone('07 08 09 12 34')).toBe(true);
    });

    it('should validate MTN numbers (05)', () => {
      expect(isValidIvorianPhone('0508091234')).toBe(true);
    });

    it('should validate Moov numbers (01)', () => {
      expect(isValidIvorianPhone('0108091234')).toBe(true);
    });

    it('should reject invalid prefixes', () => {
      expect(isValidIvorianPhone('0208091234')).toBe(false);
      expect(isValidIvorianPhone('0808091234')).toBe(false);
    });

    it('should reject wrong length', () => {
      expect(isValidIvorianPhone('070809123')).toBe(false);
      expect(isValidIvorianPhone('07080912345')).toBe(false);
    });
  });

  describe('normalizePhone', () => {
    it('should remove +225 prefix', () => {
      expect(normalizePhone('2250708091234')).toBe('0708091234');
    });

    it('should remove spaces and dashes', () => {
      expect(normalizePhone('07-08-09-12-34')).toBe('0708091234');
      expect(normalizePhone('07 08 09 12 34')).toBe('0708091234');
    });

    it('should keep clean numbers as is', () => {
      expect(normalizePhone('0708091234')).toBe('0708091234');
    });
  });
});
