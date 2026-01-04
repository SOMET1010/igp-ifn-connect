import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnswerRequest {
  merchant_id: string;
  challenge_key: string;
  answer_spoken: string;
  device_fingerprint: string;
  context: {
    lat?: number;
    lng?: number;
    hour?: number;
  };
  lang?: string;
}

interface AnswerResponse {
  next_step: 'DIRECT' | 'ESCALATE' | 'RETRY';
  trust_score: number;
  message_tts: string;
  session_token?: string;
}

// Normalise une réponse pour comparaison
function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9\s]/g, '') // Garder que alphanumérique
    .trim()
    .replace(/\s+/g, ' ');
}

// Calcul de similarité (Levenshtein simplifié)
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = (a: string, b: string): number => {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  };
  
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

// Hash simple pour comparaison (en prod, utiliser bcrypt côté DB)
async function hashAnswer(answer: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(answer + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateTtsMessage(step: string, lang: string, persona: string): string {
  const messages: Record<string, Record<string, Record<string, string>>> = {
    TANTIE: {
      fr: {
        DIRECT: "Ah mon enfant! C'est bien toi! Bonne arrivée, entre chez toi.",
        ESCALATE: "Je ne suis pas sûre que c'est toi. Je vais appeler quelqu'un pour t'aider.",
        RETRY: "Je n'ai pas bien compris ta réponse. Répète s'il te plaît.",
      },
      dioula: {
        DIRECT: "N dén! A ye i ye! I ni wula, donna!",
        ESCALATE: "N hakili la, a tɛ i ye. N bɛ mɔgɔ wele.",
        RETRY: "N ma a mɛn. A fɔ tugu.",
      },
    },
    JEUNE: {
      fr: {
        DIRECT: "C'est carré mon gars! Tu es connecté!",
        ESCALATE: "Y'a un souci là. On va appeler quelqu'un.",
        RETRY: "J'ai pas capté. Répète.",
      },
      dioula: {
        DIRECT: "A ka di! I donna!",
        ESCALATE: "Wahala bɛ yen. N bɛ mɔgɔ wele.",
        RETRY: "N ma a mɛn. A fɔ tugu.",
      },
    },
  };

  const personaMessages = messages[persona] || messages.TANTIE;
  const langMessages = personaMessages[lang] || personaMessages.fr;
  return langMessages[step] || langMessages.RETRY;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: AnswerRequest = await req.json();
    const { merchant_id, challenge_key, answer_spoken, device_fingerprint, context, lang = 'fr' } = body;

    console.log('[auth-social-answer] Processing:', { merchant_id, challenge_key, answer_spoken });

    // Récupérer le marchand et sa persona
    const { data: merchant } = await supabase
      .from('merchants')
      .select('full_name, persona')
      .eq('id', merchant_id)
      .single();

    const persona = merchant?.persona || 'TANTIE';

    // Récupérer la réponse hashée stockée
    const { data: storedAnswer, error: answerError } = await supabase
      .from('social_answers_hashed')
      .select('answer_hash, answer_salt')
      .eq('merchant_id', merchant_id)
      .eq('challenge_key', challenge_key)
      .single();

    if (!storedAnswer || answerError) {
      console.log('[auth-social-answer] No stored answer found, escalating');
      
      // Logger l'échec
      await supabase.from('auth_context_logs').insert({
        merchant_id,
        phone: '',
        device_fingerprint,
        decision: 'ESCALATE',
        trust_score: 0,
        reason_codes: ['NO_ANSWER_STORED'],
        outcome: 'failed',
        hour_bucket: context.hour ?? new Date().getHours(),
      });

      return new Response(
        JSON.stringify({
          next_step: 'ESCALATE',
          trust_score: 0,
          message_tts: generateTtsMessage('ESCALATE', lang, persona),
        } as AnswerResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normaliser et hasher la réponse parlée
    const normalizedSpoken = normalizeAnswer(answer_spoken);
    const hashedSpoken = await hashAnswer(normalizedSpoken, storedAnswer.answer_salt);

    // Comparer les hash
    const hashMatch = hashedSpoken === storedAnswer.answer_hash;
    
    // Si pas de match exact, essayer la similarité avec la réponse normalisée du salt
    // (Le salt contient la réponse normalisée pour migration depuis l'ancienne table)
    let similarityScore = 0;
    if (!hashMatch && storedAnswer.answer_salt !== 'default_salt') {
      similarityScore = similarity(normalizedSpoken, storedAnswer.answer_salt);
    }

    const isMatch = hashMatch || similarityScore >= 0.8;
    const trustScore = isMatch ? 80 : 20;

    console.log('[auth-social-answer] Match result:', { hashMatch, similarityScore, isMatch, trustScore });

    // Logger le résultat
    await supabase.from('auth_context_logs').insert({
      merchant_id,
      phone: '',
      device_fingerprint,
      latitude: context.lat,
      longitude: context.lng,
      decision: isMatch ? 'DIRECT' : 'ESCALATE',
      trust_score: trustScore,
      reason_codes: isMatch ? [] : ['WRONG_ANSWER'],
      outcome: isMatch ? 'success' : 'failed',
      hour_bucket: context.hour ?? new Date().getHours(),
    });

    // Si match, enregistrer le device comme connu
    if (isMatch) {
      await supabase.from('trusted_devices').upsert({
        merchant_id,
        device_fingerprint,
        last_seen_at: new Date().toISOString(),
      }, {
        onConflict: 'merchant_id,device_fingerprint',
      });
    }

    const response: AnswerResponse = {
      next_step: isMatch ? 'DIRECT' : 'ESCALATE',
      trust_score: trustScore,
      message_tts: generateTtsMessage(isMatch ? 'DIRECT' : 'ESCALATE', lang, persona),
    };

    console.log('[auth-social-answer] Response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[auth-social-answer] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
