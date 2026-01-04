import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConfirmPhoneRequest {
  normalized_phone_e164: string;
  yes_no: boolean;
  lang?: string;
  persona?: string;
}

interface ConfirmPhoneResponse {
  next_step: 'DIRECT' | 'ASK_SOCIAL_Q' | 'ESCALATE' | 'REGISTER' | 'RETRY';
  message_tts: string;
  merchant_id?: string;
  challenge_key?: string;
  challenge_question?: string;
}

// Messages TTS selon le persona
function generateTtsMessage(
  step: string,
  lang: string,
  persona: string,
  challengeQuestion?: string
): string {
  const messages: Record<string, Record<string, Record<string, string>>> = {
    TANTIE: {
      fr: {
        RETRY: "Je n'ai pas bien compris. Redis-moi ton numéro s'il te plaît.",
        REGISTER: "Je ne te connais pas encore mon enfant. Tu veux t'inscrire?",
        ASK_SOCIAL_Q: challengeQuestion || "Dis-moi, quel est le nom de ton marché?",
        DIRECT: "C'est bon mon enfant, je t'ai reconnu! Entre chez toi.",
        ESCALATE: "Je vais demander à quelqu'un de t'aider. Patiente un peu.",
      },
      dioula: {
        RETRY: "N ma a mɛn. I numéro fɔ tugu.",
        REGISTER: "N tɛ i dɔn. I b'a fɛ k'i tɔgɔ sɛbɛn?",
        ASK_SOCIAL_Q: challengeQuestion || "I ka mara tɔgɔ ye mun ye?",
        DIRECT: "A ka di! N y'i dɔn! Donna!",
        ESCALATE: "N bɛ mɔgɔ wele k'i dɛmɛ.",
      },
    },
    JEUNE: {
      fr: {
        RETRY: "J'ai pas capté. Répète ton numéro.",
        REGISTER: "Je te connais pas encore. Tu veux t'inscrire?",
        ASK_SOCIAL_Q: challengeQuestion || "Réponds vite fait: c'est quoi le nom de ton marché?",
        DIRECT: "C'est carré! Tu es connecté!",
        ESCALATE: "Y'a un souci. On va appeler quelqu'un.",
      },
      dioula: {
        RETRY: "N ma a mɛn. A fɔ tugu.",
        REGISTER: "N tɛ i dɔn. I b'a fɛ k'i tɔgɔ sɛbɛn?",
        ASK_SOCIAL_Q: challengeQuestion || "I ka mara tɔgɔ ye mun ye?",
        DIRECT: "A ka di! I donna!",
        ESCALATE: "Wahala bɛ yen. N bɛ mɔgɔ wele.",
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

    const body: ConfirmPhoneRequest = await req.json();
    const { normalized_phone_e164, yes_no, lang = 'fr', persona = 'TANTIE' } = body;

    console.log('[auth-social-confirm-phone] Processing:', { normalized_phone_e164, yes_no });

    // Si l'utilisateur dit NON, on recommence
    if (!yes_no) {
      return new Response(
        JSON.stringify({
          next_step: 'RETRY',
          message_tts: generateTtsMessage('RETRY', lang, persona),
        } as ConfirmPhoneResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Chercher le marchand
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, full_name, persona, preferred_lang')
      .eq('phone', normalized_phone_e164)
      .single();

    if (!merchant || merchantError) {
      console.log('[auth-social-confirm-phone] Merchant not found');
      return new Response(
        JSON.stringify({
          next_step: 'REGISTER',
          message_tts: generateTtsMessage('REGISTER', lang, persona),
        } as ConfirmPhoneResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer une question de sécurité aléatoire
    const { data: securityQuestions } = await supabase
      .from('social_answers_hashed')
      .select('challenge_key')
      .eq('merchant_id', merchant.id);

    let challengeKey = 'MARKET_NAME';
    let challengeQuestion = "Quel est le nom de ton marché?";

    if (securityQuestions && securityQuestions.length > 0) {
      // Choisir une question aléatoire
      const randomQ = securityQuestions[Math.floor(Math.random() * securityQuestions.length)];
      challengeKey = randomQ.challenge_key;
      
      // Mapper la clé vers la question
      const questionMap: Record<string, Record<string, string>> = {
        MARKET_NAME: {
          fr: "Quel est le nom de ton marché?",
          dioula: "I ka mara tɔgɔ ye mun ye?",
        },
        MOTHER_FIRSTNAME: {
          fr: "Quel est le prénom de ta mère?",
          dioula: "I ba tɔgɔ ye mun ye?",
        },
        WHAT_YOU_SELL: {
          fr: "Qu'est-ce que tu vends?",
          dioula: "I bɛ mun feere?",
        },
        NICKNAME: {
          fr: "Comment on t'appelle au marché?",
          dioula: "U b'i wele cogodi mara la?",
        },
      };
      
      challengeQuestion = questionMap[challengeKey]?.[lang] || questionMap[challengeKey]?.fr || challengeQuestion;
    }

    const effectivePersona = merchant.persona || persona;

    const response: ConfirmPhoneResponse = {
      next_step: 'ASK_SOCIAL_Q',
      message_tts: generateTtsMessage('ASK_SOCIAL_Q', lang, effectivePersona, challengeQuestion),
      merchant_id: merchant.id,
      challenge_key: challengeKey,
      challenge_question: challengeQuestion,
    };

    console.log('[auth-social-confirm-phone] Response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[auth-social-confirm-phone] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
