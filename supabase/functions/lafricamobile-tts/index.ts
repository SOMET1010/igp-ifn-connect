import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache pour le token (valide 50 minutes)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function authenticate(): Promise<string> {
  // Vérifier le cache
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    console.log('Using cached token');
    return cachedToken.token;
  }

  const apiUrl = Deno.env.get('LAFRICAMOBILE_API_URL');
  const login = Deno.env.get('LAFRICAMOBILE_LOGIN');
  const password = Deno.env.get('LAFRICAMOBILE_PASSWORD');

  if (!apiUrl || !login || !password) {
    throw new Error('LAFRICAMOBILE credentials not configured');
  }

  console.log('Authenticating with LAFRICAMOBILE...');

  const response = await fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: login,
      password: password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Auth failed:', errorText);
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  const token = data.access_token;

  // Cache le token pour 50 minutes
  cachedToken = {
    token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };

  console.log('Authentication successful');
  return token;
}

async function translateToLocal(text: string, toLang: string, token: string): Promise<string> {
  const apiUrl = Deno.env.get('LAFRICAMOBILE_API_URL');

  console.log(`Translating to ${toLang}:`, text.substring(0, 50) + '...');

  const response = await fetch(`${apiUrl}/tts/translate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      from_lang: 'fr',
      to_lang: toLang, // 'bambara' pour Dioula ou 'wolof'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Translation failed:', errorText);
    throw new Error(`Translation failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('Translation result:', data);
  return data.translated_text || data.translation || text;
}

async function textToSpeech(text: string, language: string, token: string): Promise<string> {
  const apiUrl = Deno.env.get('LAFRICAMOBILE_API_URL');

  console.log(`TTS for ${language}:`, text.substring(0, 50) + '...');

  const response = await fetch(`${apiUrl}/tts/vocalize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      language: language, // 'bambara' ou 'wolof'
      pitch: 0.0,
      speed: 1.0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('TTS failed:', errorText);
    throw new Error(`TTS failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('TTS result:', data);
  return data.audio_url || data.audioUrl;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language = 'dioula', translateFromFrench = true } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Request:', { text: text.substring(0, 100), language, translateFromFrench });

    // Mapper la langue vers le code LAFRICAMOBILE
    const langCode = language === 'dioula' ? 'bambara' : language === 'wolof' ? 'wolof' : 'bambara';

    // Authentification
    const token = await authenticate();

    let textToVocalize = text;

    // Traduire du français si demandé
    if (translateFromFrench) {
      textToVocalize = await translateToLocal(text, langCode, token);
    }

    // Synthèse vocale
    const audioUrl = await textToSpeech(textToVocalize, langCode, token);

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl,
        translatedText: textToVocalize,
        language: langCode,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in lafricamobile-tts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
