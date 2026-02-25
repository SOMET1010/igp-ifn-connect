import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Voice OTP Callback - Appel vocal pour lire le code OTP
 * 
 * Cette fonction génère un audio TTS du code OTP et peut être étendue
 * pour déclencher un vrai appel téléphonique via L'AfricaMobile ou autre.
 * 
 * Pour le MVP: Génère l'audio TTS et le renvoie en base64
 * Pour la prod: Intégrer L'AfricaMobile Voice API pour appels réels
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp, language = 'fr' } = await req.json();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'phone et otp requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[voice-otp-callback] Generating voice OTP for ${phone}`);

    // Formater le code pour une lecture claire
    const spokenDigits = otp.split('').join(', ');
    const voiceMessage = language === 'fr'
      ? `Bonjour ! Ton code de vérification JÙLABA est : ${spokenDigits}. Je répète : ${spokenDigits}. Ce code est valable 5 minutes.`
      : `I ko ! A code bɛ : ${spokenDigits}. N bɛ a fɔ tugun : ${spokenDigits}.`;

    // Générer l'audio via ElevenLabs
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (!ELEVENLABS_API_KEY) {
      console.error('[voice-otp-callback] ELEVENLABS_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: true, 
          method: 'fallback',
          message: voiceMessage,
          note: 'TTS non disponible, utilisez le message texte'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Voix ivoirienne/africaine recommandée
    const voiceId = 'pFZP5JQG7iQjIQuC4Bku'; // Lily - voix chaude

    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: voiceMessage,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.3,
            use_speaker_boost: true,
            speed: 0.85, // Légèrement plus lent pour clarté
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('[voice-otp-callback] ElevenLabs error:', errorText);
      return new Response(
        JSON.stringify({ 
          success: true,
          method: 'fallback',
          message: voiceMessage,
          error: 'TTS generation failed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    
    // Encoder en base64 pour transport - utilisation directe du buffer
    const { encode: base64Encode } = await import("https://deno.land/std@0.168.0/encoding/base64.ts");
    const audioBase64 = base64Encode(audioBuffer);

    console.log(`[voice-otp-callback] Audio generated successfully (${audioBuffer.byteLength} bytes)`);

    // TODO Production: Ici on pourrait appeler L'AfricaMobile Voice API
    // pour déclencher un vrai appel téléphonique au numéro
    // const callResult = await triggerVoiceCall(phone, audioBuffer);

    return new Response(
      JSON.stringify({
        success: true,
        method: 'tts',
        audio: audioBase64,
        contentType: 'audio/mpeg',
        message: voiceMessage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const error = err as Error;
    console.error('[voice-otp-callback] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
