import { describe, it, expect } from 'vitest';
import {
  phoneLocalSchema,
  phoneFullSchema,
  phoneLocalOptionalSchema,
  normalizePhoneCI,
  formatPhoneCI,
  isValidCIPhonePrefix,
} from './validationSchemas';

// ============================================
// Tests phoneLocalSchema (10 chiffres ivoiriens)
// ============================================
describe('phoneLocalSchema', () => {
  describe('numéros valides', () => {
    it('accepte un numéro Orange (01)', () => {
      const result = phoneLocalSchema.safeParse('0101234567');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('0101234567');
    });

    it('accepte un numéro MTN (05)', () => {
      const result = phoneLocalSchema.safeParse('0507654321');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('0507654321');
    });

    it('accepte un numéro Moov (07)', () => {
      const result = phoneLocalSchema.safeParse('0798765432');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('0798765432');
    });

    it('accepte un numéro avec variante de préfixe Orange (0102...)', () => {
      const result = phoneLocalSchema.safeParse('0102345678');
      expect(result.success).toBe(true);
    });

    it('accepte un numéro avec variante de préfixe MTN (0599...)', () => {
      const result = phoneLocalSchema.safeParse('0599887766');
      expect(result.success).toBe(true);
    });
  });

  describe('numéros invalides - mauvais préfixe', () => {
    it('rejette un numéro avec préfixe 02', () => {
      const result = phoneLocalSchema.safeParse('0201234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec préfixe 03', () => {
      const result = phoneLocalSchema.safeParse('0301234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec préfixe 04', () => {
      const result = phoneLocalSchema.safeParse('0401234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec préfixe 06', () => {
      const result = phoneLocalSchema.safeParse('0601234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec préfixe 08', () => {
      const result = phoneLocalSchema.safeParse('0801234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec préfixe 09', () => {
      const result = phoneLocalSchema.safeParse('0901234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec préfixe 00', () => {
      const result = phoneLocalSchema.safeParse('0001234567');
      expect(result.success).toBe(false);
    });
  });

  describe('numéros invalides - mauvaise longueur', () => {
    it('rejette un numéro trop court (9 chiffres)', () => {
      const result = phoneLocalSchema.safeParse('010123456');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro trop long (11 chiffres)', () => {
      const result = phoneLocalSchema.safeParse('01012345678');
      expect(result.success).toBe(false);
    });

    it('rejette une chaîne vide', () => {
      const result = phoneLocalSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro trop court (5 chiffres)', () => {
      const result = phoneLocalSchema.safeParse('01012');
      expect(result.success).toBe(false);
    });
  });

  describe('transformation', () => {
    it('supprime les espaces dans le numéro', () => {
      const result = phoneLocalSchema.safeParse('01 01 23 45 67');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('0101234567');
    });

    it('supprime plusieurs espaces consécutifs', () => {
      const result = phoneLocalSchema.safeParse('01  01  23  45  67');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('0101234567');
    });
  });

  describe('formats invalides', () => {
    it('rejette un numéro avec le préfixe 225', () => {
      const result = phoneLocalSchema.safeParse('2250101234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec lettres', () => {
      const result = phoneLocalSchema.safeParse('01012345ab');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec caractères spéciaux', () => {
      const result = phoneLocalSchema.safeParse('01-01-23-45-67');
      expect(result.success).toBe(false);
    });
  });
});

// ============================================
// Tests phoneFullSchema (225 + 10 chiffres)
// ============================================
describe('phoneFullSchema', () => {
  describe('numéros valides', () => {
    it('accepte un numéro complet Orange (2250101...)', () => {
      const result = phoneFullSchema.safeParse('2250101234567');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('2250101234567');
    });

    it('accepte un numéro complet MTN (2250507...)', () => {
      const result = phoneFullSchema.safeParse('2250507654321');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('2250507654321');
    });

    it('accepte un numéro complet Moov (2250798...)', () => {
      const result = phoneFullSchema.safeParse('2250798765432');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('2250798765432');
    });
  });

  describe('numéros invalides - format incorrect', () => {
    it('rejette un numéro local (sans 225)', () => {
      const result = phoneFullSchema.safeParse('0101234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec signe +', () => {
      const result = phoneFullSchema.safeParse('+2250101234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro incomplet (12 chiffres)', () => {
      const result = phoneFullSchema.safeParse('225010123456');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro trop long (14 chiffres)', () => {
      const result = phoneFullSchema.safeParse('22501012345678');
      expect(result.success).toBe(false);
    });
  });

  describe('numéros invalides - mauvais préfixe opérateur', () => {
    it('rejette un numéro avec préfixe 02', () => {
      const result = phoneFullSchema.safeParse('2250201234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec préfixe 08', () => {
      const result = phoneFullSchema.safeParse('2250801234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro avec préfixe 00', () => {
      const result = phoneFullSchema.safeParse('2250001234567');
      expect(result.success).toBe(false);
    });
  });

  describe('transformation', () => {
    it('supprime les espaces dans le numéro complet', () => {
      const result = phoneFullSchema.safeParse('225 01 01 23 45 67');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('2250101234567');
    });
  });

  describe('chaîne vide', () => {
    it('rejette une chaîne vide', () => {
      const result = phoneFullSchema.safeParse('');
      expect(result.success).toBe(false);
    });
  });
});

// ============================================
// Tests phoneLocalOptionalSchema
// ============================================
describe('phoneLocalOptionalSchema', () => {
  describe('valeurs valides', () => {
    it('accepte un numéro valide', () => {
      const result = phoneLocalOptionalSchema.safeParse('0101234567');
      expect(result.success).toBe(true);
    });

    it('accepte undefined', () => {
      const result = phoneLocalOptionalSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it('accepte null', () => {
      const result = phoneLocalOptionalSchema.safeParse(null);
      expect(result.success).toBe(true);
    });

    it('accepte une chaîne vide', () => {
      const result = phoneLocalOptionalSchema.safeParse('');
      expect(result.success).toBe(true);
    });
  });

  describe('valeurs invalides', () => {
    it('rejette un numéro avec mauvais préfixe quand fourni', () => {
      const result = phoneLocalOptionalSchema.safeParse('0201234567');
      expect(result.success).toBe(false);
    });

    it('rejette un numéro trop court quand fourni', () => {
      const result = phoneLocalOptionalSchema.safeParse('010123456');
      expect(result.success).toBe(false);
    });
  });
});

// ============================================
// Tests normalizePhoneCI()
// ============================================
describe('normalizePhoneCI', () => {
  describe('format local → format complet', () => {
    it('ajoute 225 à un numéro Orange local', () => {
      expect(normalizePhoneCI('0101234567')).toBe('2250101234567');
    });

    it('ajoute 225 à un numéro MTN local', () => {
      expect(normalizePhoneCI('0507654321')).toBe('2250507654321');
    });

    it('ajoute 225 à un numéro Moov local', () => {
      expect(normalizePhoneCI('0798765432')).toBe('2250798765432');
    });
  });

  describe('format complet inchangé', () => {
    it('retourne tel quel un numéro déjà complet', () => {
      expect(normalizePhoneCI('2250101234567')).toBe('2250101234567');
    });

    it('retourne tel quel un numéro MTN complet', () => {
      expect(normalizePhoneCI('2250507654321')).toBe('2250507654321');
    });
  });

  describe('nettoyage de caractères', () => {
    it('supprime les espaces et ajoute 225', () => {
      expect(normalizePhoneCI('01 01 23 45 67')).toBe('2250101234567');
    });

    it('supprime le + et normalise', () => {
      expect(normalizePhoneCI('+2250101234567')).toBe('2250101234567');
    });

    it('supprime les tirets', () => {
      expect(normalizePhoneCI('01-01-23-45-67')).toBe('2250101234567');
    });

    it('supprime les parenthèses', () => {
      expect(normalizePhoneCI('(01)01234567')).toBe('2250101234567');
    });
  });

  describe('entrées invalides', () => {
    it('retourne la chaîne nettoyée si longueur incorrecte (trop court)', () => {
      expect(normalizePhoneCI('01234')).toBe('01234');
    });

    it('retourne la chaîne nettoyée si longueur incorrecte (trop long)', () => {
      expect(normalizePhoneCI('010123456789012')).toBe('010123456789012');
    });

    it('retourne chaîne vide si entrée vide', () => {
      expect(normalizePhoneCI('')).toBe('');
    });

    it('retourne chaîne nettoyée pour format non reconnu', () => {
      expect(normalizePhoneCI('12345678901234')).toBe('12345678901234');
    });
  });
});

// ============================================
// Tests formatPhoneCI()
// ============================================
describe('formatPhoneCI', () => {
  describe('format local', () => {
    it('formate un numéro Orange local avec espaces', () => {
      expect(formatPhoneCI('0101234567')).toBe('01 01 23 45 67');
    });

    it('formate un numéro MTN local avec espaces', () => {
      expect(formatPhoneCI('0507654321')).toBe('05 07 65 43 21');
    });

    it('formate un numéro Moov local avec espaces', () => {
      expect(formatPhoneCI('0798765432')).toBe('07 98 76 54 32');
    });
  });

  describe('format complet (225 + 10 chiffres)', () => {
    it('extrait et formate la partie locale d\'un numéro complet', () => {
      expect(formatPhoneCI('2250101234567')).toBe('01 01 23 45 67');
    });

    it('extrait et formate un numéro MTN complet', () => {
      expect(formatPhoneCI('2250507654321')).toBe('05 07 65 43 21');
    });
  });

  describe('entrées déjà formatées', () => {
    it('reformate un numéro avec espaces existants', () => {
      expect(formatPhoneCI('01 01 23 45 67')).toBe('01 01 23 45 67');
    });
  });

  describe('entrées invalides', () => {
    it('retourne tel quel si longueur incorrecte (trop court)', () => {
      expect(formatPhoneCI('01234')).toBe('01234');
    });

    it('retourne tel quel si longueur incorrecte (trop long)', () => {
      expect(formatPhoneCI('01234567890123')).toBe('01234567890123');
    });

    it('retourne chaîne vide si entrée vide', () => {
      expect(formatPhoneCI('')).toBe('');
    });
  });
});

// ============================================
// Tests isValidCIPhonePrefix()
// ============================================
describe('isValidCIPhonePrefix', () => {
  describe('préfixes valides', () => {
    it('retourne true pour préfixe Orange (01)', () => {
      expect(isValidCIPhonePrefix('0101234567')).toBe(true);
    });

    it('retourne true pour préfixe MTN (05)', () => {
      expect(isValidCIPhonePrefix('0507654321')).toBe(true);
    });

    it('retourne true pour préfixe Moov (07)', () => {
      expect(isValidCIPhonePrefix('0798765432')).toBe(true);
    });

    it('retourne true pour saisie partielle Orange (01)', () => {
      expect(isValidCIPhonePrefix('01')).toBe(true);
    });

    it('retourne true pour saisie partielle MTN (05)', () => {
      expect(isValidCIPhonePrefix('05')).toBe(true);
    });

    it('retourne true pour saisie partielle Moov (07)', () => {
      expect(isValidCIPhonePrefix('07')).toBe(true);
    });

    it('retourne true pour chaîne vide (pas encore saisi)', () => {
      expect(isValidCIPhonePrefix('')).toBe(true);
    });
  });

  describe('préfixes invalides', () => {
    it('retourne false pour préfixe 02', () => {
      expect(isValidCIPhonePrefix('0201234567')).toBe(false);
    });

    it('retourne false pour préfixe 03', () => {
      expect(isValidCIPhonePrefix('0301234567')).toBe(false);
    });

    it('retourne false pour préfixe 04', () => {
      expect(isValidCIPhonePrefix('04')).toBe(false);
    });

    it('retourne false pour préfixe 06', () => {
      expect(isValidCIPhonePrefix('06')).toBe(false);
    });

    it('retourne false pour préfixe 08', () => {
      expect(isValidCIPhonePrefix('0801234567')).toBe(false);
    });

    it('retourne false pour préfixe 09', () => {
      expect(isValidCIPhonePrefix('09')).toBe(false);
    });

    it('retourne false pour préfixe 00', () => {
      expect(isValidCIPhonePrefix('00')).toBe(false);
    });
  });

  describe('nettoyage de caractères', () => {
    it('nettoie les espaces avant validation', () => {
      expect(isValidCIPhonePrefix('01 01 23')).toBe(true);
    });

    it('nettoie les tirets avant validation', () => {
      expect(isValidCIPhonePrefix('01-01-23')).toBe(true);
    });

    it('nettoie le + avant validation', () => {
      expect(isValidCIPhonePrefix('+01')).toBe(true);
    });

    it('valide après nettoyage pour préfixe invalide', () => {
      expect(isValidCIPhonePrefix('+02')).toBe(false);
    });
  });

  describe('cas limites', () => {
    it('retourne true pour un seul chiffre 0', () => {
      expect(isValidCIPhonePrefix('0')).toBe(true);
    });

    it('retourne false pour un seul chiffre 1 (sans 0)', () => {
      expect(isValidCIPhonePrefix('1')).toBe(false);
    });

    it('retourne false pour un seul chiffre 2', () => {
      expect(isValidCIPhonePrefix('2')).toBe(false);
    });
  });
});
