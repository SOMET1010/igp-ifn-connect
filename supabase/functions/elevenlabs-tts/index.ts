import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Voix par défaut : Tantie Sagesse (PWiCgOlgDsq0Da8bhS6a)
    const { text, voiceId = "PWiCgOlgDsq0Da8bhS6a", modelId = "eleven_multilingual_v2" } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    console.log(`TTS request: ${text.substring(0, 50)}... (voice: ${voiceId})`);

    // IMPORTANT: output_format doit être un query param (pas dans le body)
    const OUTPUT_FORMAT = 'mp3_44100_128';
    const FALLBACK_VOICE_ID = 'LZZ0J6eX2D30k2TKgBOR';

    const callElevenLabs = async (voice: string) => {
      return await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=${OUTPUT_FORMAT}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            // Voice settings optimisées pour accent ivoirien
            voice_settings: {
              stability: 0.45,
              similarity_boost: 0.85,
              style: 0.4,
              use_speaker_boost: true,
            },
          }),
        }
      );
    };

    let response = await callElevenLabs(voiceId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);

      let parsed: any = null;
      try {
        parsed = JSON.parse(errorText);
      } catch {
        // ignore
      }

      const status = parsed?.detail?.status;
      const canFallback =
        voiceId === 'PWiCgOlgDsq0Da8bhS6a' &&
        (status === 'voice_not_fine_tuned' || status === 'voice_not_found');

      if (canFallback) {
        console.warn(
          `Voice ${voiceId} not usable (${status}), retry with fallback voice ${FALLBACK_VOICE_ID}`
        );
        response = await callElevenLabs(FALLBACK_VOICE_ID);

        if (!response.ok) {
          const retryErrorText = await response.text();
          console.error('ElevenLabs API error (fallback):', response.status, retryErrorText);
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }
      } else {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
    }

    const audioBuffer = await response.arrayBuffer();
    console.log(`Audio generated: ${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in elevenlabs-tts:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
