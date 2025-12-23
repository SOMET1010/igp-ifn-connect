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
    console.log('[STT] Using cached authentication token');
    return cachedToken.token;
  }

  const apiUrl = Deno.env.get('LAFRICAMOBILE_API_URL');
  const login = Deno.env.get('LAFRICAMOBILE_LOGIN');
  const password = Deno.env.get('LAFRICAMOBILE_PASSWORD');

  console.log('[STT] Checking environment variables...');
  console.log('[STT] API URL configured:', !!apiUrl);
  console.log('[STT] Login configured:', !!login);
  console.log('[STT] Password configured:', !!password);

  if (!apiUrl || !login || !password) {
    const missing = [];
    if (!apiUrl) missing.push('LAFRICAMOBILE_API_URL');
    if (!login) missing.push('LAFRICAMOBILE_LOGIN');
    if (!password) missing.push('LAFRICAMOBILE_PASSWORD');
    throw new Error(`Configuration manquante: ${missing.join(', ')}`);
  }

  console.log('[STT] Authenticating with LAFRICAMOBILE API...');
  console.log('[STT] Auth URL:', `${apiUrl}/login`);
  
  try {
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

    console.log('[STT] Auth response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[STT] Authentication failed:', response.status, errorText);
      throw new Error(`Échec authentification LAFRICAMOBILE: ${response.status}`);
    }

    const data = await response.json();
    console.log('[STT] Authentication successful, token received');
    
    // Cache le token avec son expiration
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + ((data.expires_in || 3600) * 1000),
    };

    return data.access_token;
  } catch (error) {
    console.error('[STT] Authentication error:', error);
    throw new Error(`Erreur d'authentification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

async function speechToText(audioBase64: string, language: string, token: string): Promise<string> {
  const apiUrl = Deno.env.get('LAFRICAMOBILE_API_URL');
  
  // Mapper la langue vers le code LAFRICAMOBILE
  const lafricaLanguage = LANGUAGE_MAP[language] || language;
  
  console.log(`[STT] Starting speech-to-text conversion`);
  console.log(`[STT] Language: ${language} -> ${lafricaLanguage}`);
  console.log(`[STT] Audio base64 length: ${audioBase64.length} characters`);

  try {
    // Décoder le Base64
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    console.log(`[STT] Audio decoded: ${bytes.length} bytes`);

    // Créer le FormData avec le fichier audio
    const formData = new FormData();
    const audioBlob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');

    const sttUrl = `${apiUrl}/stt/?language=${lafricaLanguage}`;
    console.log(`[STT] Calling STT API: ${sttUrl}`);

    const response = await fetch(sttUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    console.log(`[STT] STT API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[STT] STT API error response:', errorText);
      throw new Error(`Échec de transcription: ${response.status}`);
    }

    const data = await response.json();
    console.log('[STT] STT API response:', JSON.stringify(data));
    
    const transcription = data.transcription || data.text || '';
    console.log(`[STT] Transcription result: "${transcription}"`);
    
    return transcription;
  } catch (error) {
    console.error('[STT] Speech-to-text error:', error);
    throw new Error(`Erreur de transcription: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`[STT][${requestId}] Incoming request: ${req.method}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log(`[STT][${requestId}] Handling CORS preflight`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parser le body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error(`[STT][${requestId}] Failed to parse request body:`, parseError);
      throw new Error('Corps de requête invalide (JSON attendu)');
    }

    const { audio, language } = body;

    console.log(`[STT][${requestId}] Request params - language: ${language}, audio length: ${audio?.length || 0}`);

    // Validation
    if (!audio) {
      throw new Error('Données audio manquantes');
    }

    if (typeof audio !== 'string') {
      throw new Error('Format audio invalide (base64 string attendu)');
    }

    if (audio.length < 100) {
      throw new Error('Audio trop court');
    }

    if (!language) {
      throw new Error('Langue non spécifiée');
    }

    // Vérifier que la langue est supportée
    if (!LANGUAGE_MAP[language]) {
      const supported = Object.keys(LANGUAGE_MAP).join(', ');
      throw new Error(`Langue '${language}' non supportée. Supportées: ${supported}`);
    }

    console.log(`[STT][${requestId}] Processing STT request for language: ${language}`);

    // Authentification
    console.log(`[STT][${requestId}] Authenticating...`);
    const token = await authenticate();
    console.log(`[STT][${requestId}] Authentication successful`);

    // Transcription
    console.log(`[STT][${requestId}] Starting transcription...`);
    const transcription = await speechToText(audio, language, token);
    console.log(`[STT][${requestId}] Transcription complete: "${transcription}"`);

    return new Response(
      JSON.stringify({
        success: true,
        transcription,
        language,
        requestId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`[STT][${requestId}] Error:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        requestId,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
