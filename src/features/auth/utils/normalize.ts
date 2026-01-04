/**
 * Utilitaires de normalisation pour les questions de sécurité
 * Tolérance aux fautes, accents, casse, espaces
 */

/**
 * Normalise une réponse pour comparaison tolérante
 * - Minuscules
 * - Sans accents
 * - Sans espaces/caractères spéciaux
 */
export function normalizeAnswer(answer: string): string {
  if (!answer) return '';
  
  return answer
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlever accents
    .replace(/[^a-z0-9]/g, "")       // Garder que lettres/chiffres
    .trim();
}

/**
 * Compare deux réponses de manière tolérante
 * Retourne true si les réponses normalisées correspondent
 */
export function compareAnswers(answer1: string, answer2: string): boolean {
  return normalizeAnswer(answer1) === normalizeAnswer(answer2);
}

/**
 * Calcule un score de similarité entre deux chaînes (0-100)
 * Utile pour la tolérance aux fautes de frappe
 */
export function similarityScore(str1: string, str2: string): number {
  const s1 = normalizeAnswer(str1);
  const s2 = normalizeAnswer(str2);
  
  if (s1 === s2) return 100;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // Levenshtein distance
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[s1.length][s2.length];
  const maxLength = Math.max(s1.length, s2.length);
  
  return Math.round(((maxLength - distance) / maxLength) * 100);
}
