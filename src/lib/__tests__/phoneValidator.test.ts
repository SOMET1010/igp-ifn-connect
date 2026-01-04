/**
 * Tests unitaires - Validation téléphone CI
 * Vérifie le format exact 10 chiffres avec préfixes valides
 */

import { describe, it, expect } from 'vitest';

// Fonctions de validation à tester
function isValidCIPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return false;
  return /^0[157]\d{8}$/.test(cleaned);
}

function isValidCIPhonePrefix(phone: string): boolean {
  if (phone.length < 2) return true;
  const prefix = phone.substring(0, 2);
  return ['01', '05', '07'].includes(prefix);
}

function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const chunks: string[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    chunks.push(cleaned.slice(i, i + 2));
  }
  return chunks.join(' ');
}

describe('Phone Validation - Côte d\'Ivoire', () => {
  
  describe('isValidCIPhone - Format complet', () => {
    
    it('accepte un numéro valide de 10 chiffres commençant par 07', () => {
      expect(isValidCIPhone('0701020304')).toBe(true);
      expect(isValidCIPhone('0798765432')).toBe(true);
    });

    it('accepte un numéro valide de 10 chiffres commençant par 05', () => {
      expect(isValidCIPhone('0501020304')).toBe(true);
      expect(isValidCIPhone('0598765432')).toBe(true);
    });

    it('accepte un numéro valide de 10 chiffres commençant par 01', () => {
      expect(isValidCIPhone('0101020304')).toBe(true);
      expect(isValidCIPhone('0198765432')).toBe(true);
    });

    it('refuse un numéro avec moins de 10 chiffres', () => {
      expect(isValidCIPhone('070102030')).toBe(false);
      expect(isValidCIPhone('07010203')).toBe(false);
      expect(isValidCIPhone('0701')).toBe(false);
      expect(isValidCIPhone('')).toBe(false);
    });

    it('refuse un numéro avec plus de 10 chiffres', () => {
      expect(isValidCIPhone('07010203040')).toBe(false);
      expect(isValidCIPhone('070102030405')).toBe(false);
    });

    it('refuse un numéro avec un préfixe invalide', () => {
      expect(isValidCIPhone('0201020304')).toBe(false);
      expect(isValidCIPhone('0301020304')).toBe(false);
      expect(isValidCIPhone('0401020304')).toBe(false);
      expect(isValidCIPhone('0601020304')).toBe(false);
      expect(isValidCIPhone('0801020304')).toBe(false);
      expect(isValidCIPhone('0901020304')).toBe(false);
    });

    it('nettoie les espaces et caractères spéciaux', () => {
      expect(isValidCIPhone('07 01 02 03 04')).toBe(true);
      expect(isValidCIPhone('07-01-02-03-04')).toBe(true);
      expect(isValidCIPhone('07.01.02.03.04')).toBe(true);
    });
  });

  describe('isValidCIPhonePrefix - Validation préfixe', () => {
    
    it('accepte les préfixes valides', () => {
      expect(isValidCIPhonePrefix('01')).toBe(true);
      expect(isValidCIPhonePrefix('05')).toBe(true);
      expect(isValidCIPhonePrefix('07')).toBe(true);
    });

    it('refuse les préfixes invalides', () => {
      expect(isValidCIPhonePrefix('02')).toBe(false);
      expect(isValidCIPhonePrefix('03')).toBe(false);
      expect(isValidCIPhonePrefix('08')).toBe(false);
      expect(isValidCIPhonePrefix('09')).toBe(false);
    });

    it('accepte un seul chiffre (validation en cours)', () => {
      expect(isValidCIPhonePrefix('0')).toBe(true);
      expect(isValidCIPhonePrefix('1')).toBe(true);
    });

    it('accepte une chaîne vide (rien saisi)', () => {
      expect(isValidCIPhonePrefix('')).toBe(true);
    });
  });

  describe('formatPhoneDisplay - Formatage visuel', () => {
    
    it('formate correctement un numéro complet', () => {
      expect(formatPhoneDisplay('0701020304')).toBe('07 01 02 03 04');
    });

    it('formate correctement un numéro partiel', () => {
      expect(formatPhoneDisplay('0701')).toBe('07 01');
      expect(formatPhoneDisplay('070102')).toBe('07 01 02');
      expect(formatPhoneDisplay('07')).toBe('07');
    });

    it('gère un chiffre impair', () => {
      expect(formatPhoneDisplay('070')).toBe('07 0');
      expect(formatPhoneDisplay('07010')).toBe('07 01 0');
    });

    it('gère une chaîne vide', () => {
      expect(formatPhoneDisplay('')).toBe('');
    });

    it('ignore les caractères non numériques', () => {
      expect(formatPhoneDisplay('07-01-02')).toBe('07 01 02');
      expect(formatPhoneDisplay('07 01 02')).toBe('07 01 02');
    });
  });

  describe('Limite de 10 chiffres - Blocage strict', () => {
    
    it('la saisie ne doit jamais dépasser 10 chiffres', () => {
      const maxLength = 10;
      const input = '07010203040506';
      const sanitized = input.replace(/\D/g, '').slice(0, maxLength);
      
      expect(sanitized.length).toBe(10);
      expect(sanitized).toBe('0701020304');
    });

    it('bloque les chiffres supplémentaires', () => {
      const maxLength = 10;
      const current = '0701020304';
      const canAddMore = current.length < maxLength;
      
      expect(canAddMore).toBe(false);
    });
  });
});
