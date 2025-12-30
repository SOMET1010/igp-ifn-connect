import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mots de confirmation - Français
const FRENCH_CONFIRMATIONS = {
  positive: ['oui', 'ouais', 'ok', 'okay', "d'accord", 'exact', 'exactement', 'correct', "c'est bon", "c'est ça", 'parfait', 'bien', 'yes', 'yep', 'affirmatif'],
  negative: ['non', 'nan', 'pas', "c'est pas ça", "c'est faux", 'faux', 'incorrect', 'erreur', 'no', 'nope', 'négatif', "pas du tout"],
};

// Mots de confirmation - Dioula/Bambara
const DIOULA_CONFIRMATIONS = {
  positive: ['ɔwɔ', 'owo', 'awo', 'ii', 'ɛɛ', 'a ye', 'aye', 'a bɛ', 'tɔ'],
  negative: ['ayi', 'aayi', 'a tɛ', 'ate', 'dɛ', 'de'],
};

// Cache pour le token d'authentification LAFRICAMOBILE
let cachedToken: { token: string; expiresAt: number } | null = null;

const LANGUAGE_MAP: Record<string, string> = {
  'fr': 'fr-FR',
  'dioula': 'bm-ML',
  'nouchi': 'fr-CI',
};

/**
 * Authentification auprès de LAFRICAMOBILE
 */
async function authenticate(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const login = Deno.env.get('LAFRICAMOBILE_LOGIN');
  const password = Deno.env.get('LAFRICAMOBILE_PASSWORD');
  const apiUrl = Deno.env.get('LAFRICAMOBILE_API_URL') || 'https://api.lafricamobile.com';

  if (!login || !password) {
    throw new Error('LAFRICAMOBILE credentials not configured');
  }

  console.log('[voice-auth-validate] Authenticating with LAFRICAMOBILE...');

  const response = await fetch(`${apiUrl}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[voice-auth-validate] Auth failed:', errorText);
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  const token = data.token || data.access_token;

  if (!token) {
    throw new Error('No token in authentication response');
  }

  cachedToken = {
    token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };

  console.log('[voice-auth-validate] Authentication successful');
  return token;
}

/**
 * Transcription audio via LAFRICAMOBILE STT
 */
async function transcribeAudio(audioBase64: string, language: string, token: string): Promise<string> {
  const apiUrl = Deno.env.get('LAFRICAMOBILE_API_URL') || 'https://api.lafricamobile.com';
  const langCode = LANGUAGE_MAP[language] || 'fr-FR';

  console.log(`[voice-auth-validate] Transcribing audio in ${langCode}...`);

  const binaryString = atob(audioBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const formData = new FormData();
  const blob = new Blob([bytes], { type: 'audio/webm' });
  formData.append('audio', blob, 'recording.webm');
  formData.append('language', langCode);

  const response = await fetch(`${apiUrl}/v1/stt/transcribe`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[voice-auth-validate] Transcription failed:', errorText);
    throw new Error(`Transcription failed: ${response.status}`);
  }

  const data = await response.json();
  const transcription = data.text || data.transcription || '';

  console.log(`[voice-auth-validate] Transcription result: "${transcription}"`);
  return transcription;
}

/**
 * Normalise un texte pour comparaison
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s]/g, '') // Garder seulement lettres, chiffres, espaces
    .trim();
}

/**
 * Calcule le score de similarité entre deux textes (Levenshtein simplifié)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Vérifier si l'un contient l'autre
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }

  // Calcul de distance de Levenshtein simplifiée
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  const longerLength = longer.length;
  if (longerLength === 0) return 1;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longerLength - editDistance) / longerLength;
}

/**
 * Distance de Levenshtein
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Détecte une confirmation OUI/NON dans le texte
 */
function detectConfirmation(text: string, language: string): { confirmed: boolean | null; confidence: number } {
  const normalizedText = normalizeText(text);
  
  const confirmations = language === 'dioula'
    ? { ...FRENCH_CONFIRMATIONS, positive: [...FRENCH_CONFIRMATIONS.positive, ...DIOULA_CONFIRMATIONS.positive], negative: [...FRENCH_CONFIRMATIONS.negative, ...DIOULA_CONFIRMATIONS.negative] }
    : FRENCH_CONFIRMATIONS;

  // Chercher les mots positifs
  for (const word of confirmations.positive) {
    const normalizedWord = normalizeText(word);
    if (normalizedText.includes(normalizedWord)) {
      console.log(`[voice-auth-validate] Detected POSITIVE: "${word}" in "${text}"`);
      return { confirmed: true, confidence: 0.9 };
    }
  }

  // Chercher les mots négatifs
  for (const word of confirmations.negative) {
    const normalizedWord = normalizeText(word);
    if (normalizedText.includes(normalizedWord)) {
      console.log(`[voice-auth-validate] Detected NEGATIVE: "${word}" in "${text}"`);
      return { confirmed: false, confidence: 0.9 };
    }
  }

  console.log(`[voice-auth-validate] No confirmation detected in "${text}"`);
  return { confirmed: null, confidence: 0 };
}

/**
 * Valide une réponse à une question de sécurité
 */
function validateSecurityAnswer(transcription: string, expectedAnswer: string): { confirmed: boolean; matchScore: number } {
  const similarity = calculateSimilarity(transcription, expectedAnswer);
  
  // Seuil de similarité pour accepter la réponse
  const THRESHOLD = 0.7;
  const confirmed = similarity >= THRESHOLD;

  console.log(`[voice-auth-validate] Answer validation: "${transcription}" vs "${expectedAnswer}" = ${similarity.toFixed(2)} (${confirmed ? 'MATCH' : 'NO MATCH'})`);

  return {
    confirmed,
    matchScore: similarity,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, language = 'fr', mode = 'confirmation', expectedAnswer } = await req.json();

    if (!audio) {
      console.error('[voice-auth-validate] Missing audio parameter');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing audio parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['confirmation', 'answer'].includes(mode)) {
      console.error(`[voice-auth-validate] Invalid mode: ${mode}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid mode. Use "confirmation" or "answer"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (mode === 'answer' && !expectedAnswer) {
      console.error('[voice-auth-validate] Missing expectedAnswer for answer mode');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing expectedAnswer for answer mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authentification
    const token = await authenticate();

    // Transcription
    const transcription = await transcribeAudio(audio, language, token);

    let result: { confirmed: boolean | null; confidence: number; matchScore?: number };

    if (mode === 'confirmation') {
      // Mode confirmation OUI/NON
      result = detectConfirmation(transcription, language);
    } else {
      // Mode validation de réponse
      const validation = validateSecurityAnswer(transcription, expectedAnswer);
      result = {
        confirmed: validation.confirmed,
        confidence: validation.matchScore,
        matchScore: validation.matchScore,
      };
    }

    console.log(`[voice-auth-validate] Final result: mode=${mode}, confirmed=${result.confirmed}, confidence=${result.confidence}`);

    return new Response(
      JSON.stringify({
        success: true,
        confirmed: result.confirmed,
        confidence: result.confidence,
        transcription,
        matchScore: result.matchScore,
        language,
        mode,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[voice-auth-validate] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
