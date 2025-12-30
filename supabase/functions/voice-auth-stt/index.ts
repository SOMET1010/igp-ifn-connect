import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapping des mots vers chiffres - Français
const FRENCH_NUMBERS: Record<string, string> = {
  'zéro': '0', 'zero': '0', 'o': '0',
  'un': '1', 'une': '1',
  'deux': '2',
  'trois': '3',
  'quatre': '4',
  'cinq': '5',
  'six': '6',
  'sept': '7',
  'huit': '8',
  'neuf': '9',
  'dix': '10',
  'onze': '11',
  'douze': '12',
  'treize': '13',
  'quatorze': '14',
  'quinze': '15',
  'seize': '16',
  'vingt': '20',
  'trente': '30',
  'quarante': '40',
  'cinquante': '50',
  'soixante': '60',
  'soixante-dix': '70',
  'quatre-vingt': '80',
  'quatre-vingts': '80',
  'quatre-vingt-dix': '90',
  'cent': '100',
};

// Mapping des mots vers chiffres - Dioula/Bambara
const DIOULA_NUMBERS: Record<string, string> = {
  'kelen': '1', 'kɛlɛn': '1',
  'fila': '2', 'fla': '2',
  'saba': '3',
  'naani': '4', 'nani': '4',
  'duuru': '5', 'duru': '5',
  'wɔɔrɔ': '6', 'wooro': '6', 'woro': '6',
  'wolonwula': '7', 'wolonfila': '7',
  'segin': '8', 'seegi': '8',
  'kɔnɔntɔn': '9', 'kononton': '9',
  'tan': '10',
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

  console.log('[voice-auth-stt] Authenticating with LAFRICAMOBILE...');

  const response = await fetch(`${apiUrl}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[voice-auth-stt] Auth failed:', errorText);
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  const token = data.token || data.access_token;

  if (!token) {
    throw new Error('No token in authentication response');
  }

  // Cache pour 50 minutes (tokens expirent généralement après 60 min)
  cachedToken = {
    token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };

  console.log('[voice-auth-stt] Authentication successful');
  return token;
}

/**
 * Transcription audio via LAFRICAMOBILE STT
 */
async function transcribeAudio(audioBase64: string, language: string, token: string): Promise<string> {
  const apiUrl = Deno.env.get('LAFRICAMOBILE_API_URL') || 'https://api.lafricamobile.com';
  const langCode = LANGUAGE_MAP[language] || 'fr-FR';

  console.log(`[voice-auth-stt] Transcribing audio in ${langCode}...`);

  // Décoder le base64
  const binaryString = atob(audioBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Créer le FormData
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
    console.error('[voice-auth-stt] Transcription failed:', errorText);
    throw new Error(`Transcription failed: ${response.status}`);
  }

  const data = await response.json();
  const transcription = data.text || data.transcription || '';

  console.log(`[voice-auth-stt] Transcription result: "${transcription}"`);
  return transcription;
}

/**
 * Extrait les chiffres d'un texte transcrit
 */
function extractPhoneNumber(text: string, language: string): { phoneNumber: string; confidence: number } {
  const normalizedText = text.toLowerCase().trim();
  let result = '';
  let matchedWords = 0;
  let totalWords = 0;

  // Sélectionner le bon mapping selon la langue
  const numberMap = language === 'dioula' 
    ? { ...FRENCH_NUMBERS, ...DIOULA_NUMBERS }
    : FRENCH_NUMBERS;

  // Remplacer les mots composés d'abord
  let processedText = normalizedText
    .replace(/soixante[- ]dix/g, 'soixante-dix')
    .replace(/quatre[- ]vingt[- ]dix/g, 'quatre-vingt-dix')
    .replace(/quatre[- ]vingt/g, 'quatre-vingt');

  // Séparer en mots
  const words = processedText.split(/[\s,.-]+/).filter(w => w.length > 0);
  totalWords = words.length;

  for (const word of words) {
    // Vérifier si c'est un chiffre direct
    if (/^\d+$/.test(word)) {
      result += word;
      matchedWords++;
      continue;
    }

    // Vérifier dans le mapping
    if (numberMap[word]) {
      result += numberMap[word];
      matchedWords++;
      continue;
    }

    // Essayer de trouver une correspondance partielle
    const partialMatch = Object.entries(numberMap).find(([key]) => 
      word.includes(key) || key.includes(word)
    );
    if (partialMatch) {
      result += partialMatch[1];
      matchedWords++;
    }
  }

  // Nettoyer le résultat
  const phoneNumber = result.replace(/\D/g, '');
  
  // Calculer la confiance
  const confidence = totalWords > 0 ? matchedWords / totalWords : 0;

  console.log(`[voice-auth-stt] Extracted phone: "${phoneNumber}" (confidence: ${confidence.toFixed(2)})`);

  return { phoneNumber, confidence };
}

/**
 * Formate un numéro de téléphone ivoirien
 */
function formatIvorianPhone(phone: string): string {
  // Supprimer tout sauf les chiffres
  const digits = phone.replace(/\D/g, '');
  
  // Si le numéro commence par 225 (indicatif CI), le retirer
  const localNumber = digits.startsWith('225') ? digits.slice(3) : digits;
  
  // Les numéros ivoiriens ont 10 chiffres
  if (localNumber.length === 10) {
    return localNumber;
  }
  
  // Si 8 chiffres, ajouter le préfixe 07 (mobile Orange)
  if (localNumber.length === 8) {
    return localNumber;
  }
  
  return localNumber;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, language = 'fr' } = await req.json();

    if (!audio) {
      console.error('[voice-auth-stt] Missing audio parameter');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing audio parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier la langue supportée
    if (!['fr', 'dioula', 'nouchi'].includes(language)) {
      console.error(`[voice-auth-stt] Unsupported language: ${language}`);
      return new Response(
        JSON.stringify({ success: false, error: `Unsupported language: ${language}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authentification
    const token = await authenticate();

    // Transcription
    const rawTranscription = await transcribeAudio(audio, language, token);

    // Extraction du numéro de téléphone
    const { phoneNumber, confidence } = extractPhoneNumber(rawTranscription, language);
    
    // Formater le numéro
    const formattedPhone = formatIvorianPhone(phoneNumber);

    console.log(`[voice-auth-stt] Final result: phone="${formattedPhone}", raw="${rawTranscription}"`);

    return new Response(
      JSON.stringify({
        success: true,
        phoneNumber: formattedPhone,
        rawTranscription,
        confidence,
        language,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[voice-auth-stt] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
