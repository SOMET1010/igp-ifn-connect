import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache du token d'authentification
let cachedToken: { token: string; expiresAt: number } | null = null;

// Mapping des langues vers LAFRICAMOBILE
const LANGUAGE_MAP: Record<string, string> = {
  'dioula': 'bambara'
};

async function authenticate(): Promise<string> {
  // Vérifier si le token est encore valide (avec marge de 5 minutes)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 300000) {
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
      grant_type: 'password',
      username: login,
      password: password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Authentication failed:', errorText);
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache le token avec son expiration
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  console.log('Authentication successful');
  return data.access_token;
}

async function speechToText(audioBase64: string, language: string, token: string): Promise<string> {
  const apiUrl = Deno.env.get('LAFRICAMOBILE_API_URL');
  
  // Mapper la langue vers le code LAFRICAMOBILE
  const lafricaLanguage = LANGUAGE_MAP[language] || language;
  
  console.log(`Converting speech to text in ${lafricaLanguage}...`);

  // Convertir Base64 en Blob
  const binaryString = atob(audioBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Créer le FormData avec le fichier audio
  const formData = new FormData();
  const audioBlob = new Blob([bytes], { type: 'audio/webm' });
  formData.append('file', audioBlob, 'audio.webm');

  const response = await fetch(`${apiUrl}/stt/?language=${lafricaLanguage}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('STT API error:', errorText);
    throw new Error(`STT failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('STT response:', data);
  
  return data.transcription || data.text || '';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, language } = await req.json();

    if (!audio) {
      throw new Error('Audio data is required');
    }

    if (!language) {
      throw new Error('Language is required');
    }

    // Vérifier que la langue est supportée
    if (!LANGUAGE_MAP[language]) {
      throw new Error(`Language '${language}' is not supported. Supported: ${Object.keys(LANGUAGE_MAP).join(', ')}`);
    }

    console.log(`Processing STT request for language: ${language}`);

    // Authentification
    const token = await authenticate();

    // Transcription
    const transcription = await speechToText(audio, language, token);

    return new Response(
      JSON.stringify({
        success: true,
        transcription,
        language,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('STT Error:', error);
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
