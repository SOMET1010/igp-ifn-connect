import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache pour le token d'authentification LAFRICAMOBILE
let cachedToken: { token: string; expiresAt: number } | null = null;

const LANGUAGE_MAP: Record<string, string> = {
  'fr': 'fr-FR',
  'dioula': 'bm-ML',
  'nouchi': 'fr-CI',
  'suta': 'fr-FR',
};

/**
 * Questions de l'interview conversationnelle
 */
const INTERVIEW_QUESTIONS = {
  fr: [
    { key: 'full_name', question: "Comment tu t'appelles ?", prompt: "Dis-moi ton nom complet." },
    { key: 'activity_type', question: "Tu vends quoi au marché ?", prompt: "Qu'est-ce que tu vends ?" },
    { key: 'market_name', question: "C'est où ton marché ?", prompt: "Dans quel marché tu travailles ?" },
    { key: 'phone', question: "C'est quoi ton numéro de téléphone ?", prompt: "Donne-moi ton numéro." },
  ],
  nouchi: [
    { key: 'full_name', question: "C'est comment on t'appelle ?", prompt: "Ton nom là, c'est quoi ?" },
    { key: 'activity_type', question: "Tu fais quoi comme commerce ?", prompt: "Tu vends quoi au marché ?" },
    { key: 'market_name', question: "Tu es où ? C'est quel marché ?", prompt: "Ton marché c'est lequel ?" },
    { key: 'phone', question: "Donne ton numéro de téléphone", prompt: "C'est quoi ton numéro ?" },
  ],
  suta: [
    { key: 'full_name', question: "Bonjour ! Je suis Tantie Sagesse. Comment tu t'appelles ma fille ?", prompt: "Dis-moi ton nom complet, je t'écoute." },
    { key: 'activity_type', question: "D'accord. Tu vends quoi au marché ?", prompt: "Dis-moi ce que tu vends, les tomates, le poisson, les pagnes ?" },
    { key: 'market_name', question: "Très bien. C'est où ton marché ?", prompt: "Tu travailles à Adjamé, Treichville, Yopougon ?" },
    { key: 'phone', question: "Parfait. C'est quoi ton numéro de téléphone ?", prompt: "Donne-moi ton numéro, chiffre par chiffre." },
  ],
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

  console.log('[voice-interview] Authenticating with LAFRICAMOBILE...');

  const response = await fetch(`${apiUrl}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[voice-interview] Auth failed:', errorText);
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

  console.log('[voice-interview] Authentication successful');
  return token;
}

/**
 * Transcription audio via LAFRICAMOBILE STT
 */
async function transcribeAudio(audioBase64: string, language: string, token: string): Promise<string> {
  const apiUrl = Deno.env.get('LAFRICAMOBILE_API_URL') || 'https://api.lafricamobile.com';
  const langCode = LANGUAGE_MAP[language] || 'fr-FR';

  console.log(`[voice-interview] Transcribing audio in ${langCode}...`);

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
    console.error('[voice-interview] Transcription failed:', errorText);
    throw new Error(`Transcription failed: ${response.status}`);
  }

  const data = await response.json();
  const transcription = data.text || data.transcription || '';

  console.log(`[voice-interview] Transcription result: "${transcription}"`);
  return transcription;
}

/**
 * Extrait un numéro de téléphone du texte
 */
function extractPhoneNumber(text: string): string {
  // Mapping des mots vers chiffres
  const numberWords: Record<string, string> = {
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
  };

  let result = text.toLowerCase();
  
  // Remplacer les mots par des chiffres
  for (const [word, digit] of Object.entries(numberWords)) {
    result = result.replace(new RegExp(word, 'g'), digit);
  }

  // Extraire uniquement les chiffres
  const digits = result.replace(/\D/g, '');
  
  // Formater le numéro ivoirien
  if (digits.startsWith('225')) {
    return digits.slice(3);
  }
  
  return digits;
}

/**
 * Normalise le type d'activité
 */
function normalizeActivityType(text: string): string {
  const activityMap: Record<string, string> = {
    'tomate': 'Légumes',
    'tomates': 'Légumes',
    'légume': 'Légumes',
    'légumes': 'Légumes',
    'poisson': 'Poisson',
    'poissons': 'Poisson',
    'viande': 'Boucherie',
    'boucherie': 'Boucherie',
    'pagne': 'Textile',
    'pagnes': 'Textile',
    'tissu': 'Textile',
    'tissus': 'Textile',
    'habit': 'Prêt-à-porter',
    'habits': 'Prêt-à-porter',
    'vêtement': 'Prêt-à-porter',
    'vêtements': 'Prêt-à-porter',
    'fruit': 'Fruits',
    'fruits': 'Fruits',
    'riz': 'Céréales',
    'attiéké': 'Restauration',
    'attieke': 'Restauration',
    'manger': 'Restauration',
    'nourriture': 'Restauration',
    'restaurant': 'Restauration',
    'maquis': 'Restauration',
    'cosmétique': 'Cosmétique',
    'beauté': 'Cosmétique',
    'bijou': 'Bijouterie',
    'bijoux': 'Bijouterie',
    'chaussure': 'Chaussures',
    'chaussures': 'Chaussures',
    'épice': 'Épicerie',
    'épices': 'Épicerie',
    'épicerie': 'Épicerie',
  };

  const normalizedText = text.toLowerCase().trim();
  
  for (const [keyword, category] of Object.entries(activityMap)) {
    if (normalizedText.includes(keyword)) {
      return category;
    }
  }

  // Si pas de correspondance, capitaliser le premier mot
  return text.trim().split(' ')[0].charAt(0).toUpperCase() + text.trim().split(' ')[0].slice(1).toLowerCase();
}

/**
 * Extrait le nom du marché
 */
function extractMarketName(text: string): string {
  const markets = [
    'Adjamé', 'Treichville', 'Yopougon', 'Cocody', 'Marcory',
    'Koumassi', 'Port-Bouët', 'Abobo', 'Plateau', 'Attécoubé',
    'Anyama', 'Bingerville', 'Grand-Bassam', 'Dabou', 'Bouaké',
    'Daloa', 'San-Pédro', 'Korhogo', 'Man', 'Yamoussoukro',
  ];

  const normalizedText = text.toLowerCase();
  
  for (const market of markets) {
    if (normalizedText.includes(market.toLowerCase())) {
      return `Marché ${market}`;
    }
  }

  // Si pas de correspondance, retourner le texte nettoyé
  return text.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, language = 'fr', questionKey, step } = await req.json();

    // Mode 1: Récupérer les questions
    if (!audio && step !== undefined) {
      const lang = language === 'suta' ? 'suta' : (language === 'nouchi' ? 'nouchi' : 'fr');
      const questions = INTERVIEW_QUESTIONS[lang] || INTERVIEW_QUESTIONS.fr;
      
      if (step < questions.length) {
        return new Response(
          JSON.stringify({
            success: true,
            question: questions[step],
            totalSteps: questions.length,
            currentStep: step,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          complete: true,
          message: 'Interview terminée',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mode 2: Transcrire et interpréter une réponse
    if (!audio) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing audio parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authentification
    const token = await authenticate();

    // Transcription
    const transcription = await transcribeAudio(audio, language, token);

    // Interpréter selon le type de question
    let processedValue = transcription;
    let confidence = 0.8;

    switch (questionKey) {
      case 'full_name':
        // Nettoyer le nom (enlever les mots parasites)
        processedValue = transcription
          .replace(/^(je m'appelle|mon nom c'est|moi c'est|je suis)\s*/i, '')
          .replace(/\s+/g, ' ')
          .trim();
        // Capitaliser chaque mot
        processedValue = processedValue
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        confidence = processedValue.length > 3 ? 0.9 : 0.6;
        break;

      case 'activity_type':
        processedValue = normalizeActivityType(transcription);
        confidence = 0.85;
        break;

      case 'market_name':
        processedValue = extractMarketName(transcription);
        confidence = processedValue.includes('Marché') ? 0.95 : 0.7;
        break;

      case 'phone':
        processedValue = extractPhoneNumber(transcription);
        confidence = processedValue.length >= 8 ? 0.9 : 0.5;
        break;
    }

    console.log(`[voice-interview] Processed ${questionKey}: "${processedValue}" (confidence: ${confidence})`);

    return new Response(
      JSON.stringify({
        success: true,
        questionKey,
        rawTranscription: transcription,
        processedValue,
        confidence,
        language,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[voice-interview] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
