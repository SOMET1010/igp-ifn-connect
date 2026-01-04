import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StartRequest {
  lang: string;
  device_fingerprint: string;
  phone_spoken: string;
  context: {
    lat?: number;
    lng?: number;
    hour?: number;
  };
}

interface StartResponse {
  merchant_found: boolean;
  normalized_phone_e164: string;
  next_step: 'DIRECT' | 'ASK_CONFIRM_PHONE' | 'ASK_SOCIAL_Q' | 'ESCALATE' | 'REGISTER';
  message_tts: string;
  trust_score: number;
  merchant_id?: string;
  merchant_name?: string;
  persona?: string;
  reason_codes: string[];
}

// Normalise un numéro de téléphone vers E.164
function normalizePhoneE164(phoneSpoken: string): string {
  // Retirer tous les caractères non-numériques
  const digits = phoneSpoken.replace(/\D/g, '');
  
  // Si le numéro commence par 0, remplacer par +225 (Côte d'Ivoire)
  if (digits.startsWith('0')) {
    return '+225' + digits.substring(1);
  }
  
  // Si le numéro commence par 225, ajouter +
  if (digits.startsWith('225')) {
    return '+' + digits;
  }
  
  // Si 10 chiffres sans préfixe, c'est un numéro ivoirien
  if (digits.length === 10) {
    return '+225' + digits;
  }
  
  // Sinon retourner tel quel avec +
  return '+' + digits;
}

// Génère le message TTS selon le persona et l'étape
function generateTtsMessage(
  step: string,
  lang: string,
  persona: string,
  merchantName?: string
): string {
  const messages: Record<string, Record<string, Record<string, string>>> = {
    TANTIE: {
      fr: {
        DIRECT: `Ah ${merchantName || 'mon enfant'}! Bonne arrivée! Tu es bien chez toi.`,
        ASK_CONFIRM_PHONE: `J'ai entendu ton numéro. C'est bien ça? Dis oui ou non.`,
        ASK_SOCIAL_Q: `${merchantName || 'Mon enfant'}, je dois te poser une petite question pour être sûre que c'est toi.`,
        ESCALATE: `${merchantName || 'Mon enfant'}, je vais demander à quelqu'un de t'aider. Un moment s'il te plaît.`,
        REGISTER: `Je ne te connais pas encore. Tu veux t'inscrire?`,
      },
      dioula: {
        DIRECT: `${merchantName || 'N dén'}! I ni wula! A ka di!`,
        ASK_CONFIRM_PHONE: `N y'i numéro mɛn. A ye ten wa? A fɔ ɔwɔ walima ayi.`,
        ASK_SOCIAL_Q: `${merchantName || 'N dén'}, n bɛ i ɲininka dɔ kɛ.`,
        ESCALATE: `${merchantName || 'N dén'}, n bɛ mɔgɔ wele k'i dɛmɛ.`,
        REGISTER: `N tɛ i dɔn. I b'a fɛ k'i tɔgɔ sɛbɛn?`,
      },
    },
    JEUNE: {
      fr: {
        DIRECT: `Yo ${merchantName || 'mon gars'}! C'est carré, tu es connecté!`,
        ASK_CONFIRM_PHONE: `J'ai capté ton numéro. C'est bon ou bien?`,
        ASK_SOCIAL_Q: `${merchantName || 'Mon gars'}, faut répondre à une question vite fait.`,
        ESCALATE: `${merchantName || 'Mon gars'}, y'a un souci. On va appeler quelqu'un.`,
        REGISTER: `Je te connais pas encore. Tu veux t'inscrire dans le système?`,
      },
      dioula: {
        DIRECT: `${merchantName || 'N teri'}! A ka di! I donna!`,
        ASK_CONFIRM_PHONE: `N y'i numéro mɛn. A ye ten wa?`,
        ASK_SOCIAL_Q: `${merchantName || 'N teri'}, ɲininkali kelen bɛ yen.`,
        ESCALATE: `${merchantName || 'N teri'}, wahala bɛ yen. N bɛ mɔgɔ wele.`,
        REGISTER: `N tɛ i dɔn. I b'a fɛ k'i tɔgɔ sɛbɛn?`,
      },
    },
  };

  const personaMessages = messages[persona] || messages.TANTIE;
  const langMessages = personaMessages[lang] || personaMessages.fr;
  return langMessages[step] || langMessages.ASK_CONFIRM_PHONE;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: StartRequest = await req.json();
    const { lang = 'fr', device_fingerprint, phone_spoken, context } = body;

    console.log('[auth-social-start] Processing:', { phone_spoken, device_fingerprint, context });

    // 1. Normaliser le téléphone
    const normalizedPhone = normalizePhoneE164(phone_spoken);
    console.log('[auth-social-start] Normalized phone:', normalizedPhone);

    // 2. Chercher le marchand
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, full_name, phone, persona, preferred_lang, market_id')
      .eq('phone', normalizedPhone)
      .single();

    const merchantFound = !!merchant && !merchantError;
    let trustScore = 50; // Score de base
    const reasonCodes: string[] = [];
    let nextStep: StartResponse['next_step'] = 'REGISTER';
    const persona = merchant?.persona || 'TANTIE';

    if (merchantFound && merchant) {
      console.log('[auth-social-start] Merchant found:', merchant.id);

      // 3. Vérifier si le device est connu
      const { data: trustedDevice } = await supabase
        .from('trusted_devices')
        .select('id, is_revoked, last_seen_at')
        .eq('merchant_id', merchant.id)
        .eq('device_fingerprint', device_fingerprint)
        .eq('is_revoked', false)
        .single();

      if (trustedDevice) {
        trustScore += 25;
        console.log('[auth-social-start] Known device, +25 score');
      } else {
        trustScore -= 25;
        reasonCodes.push('NEW_DEVICE');
        console.log('[auth-social-start] New device, -25 score');
      }

      // 4. Vérifier la localisation (si fournie)
      if (context.lat && context.lng && merchant.market_id) {
        const { data: market } = await supabase
          .from('markets')
          .select('latitude, longitude')
          .eq('id', merchant.market_id)
          .single();

        if (market?.latitude && market?.longitude) {
          const distance = Math.sqrt(
            Math.pow((context.lat - market.latitude) * 111320, 2) +
            Math.pow((context.lng - market.longitude) * 111320 * Math.cos(context.lat * Math.PI / 180), 2)
          );
          
          if (distance <= 500) {
            trustScore += 15;
            console.log('[auth-social-start] Location match, +15 score');
          } else if (distance > 5000) {
            trustScore -= 20;
            reasonCodes.push('UNUSUAL_LOCATION');
            console.log('[auth-social-start] Unusual location, -20 score');
          }
        }
      }

      // 5. Vérifier l'heure
      const hour = context.hour ?? new Date().getHours();
      if (hour >= 6 && hour <= 20) {
        trustScore += 10;
        console.log('[auth-social-start] Usual hours, +10 score');
      } else {
        reasonCodes.push('UNUSUAL_TIME');
        console.log('[auth-social-start] Unusual time');
      }

      // 6. Vérifier l'historique d'échecs récents
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: failedCount } = await supabase
        .from('auth_context_logs')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)
        .eq('outcome', 'failed')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (failedCount && failedCount >= 3) {
        trustScore -= 25;
        reasonCodes.push('MANY_FAILS');
        console.log('[auth-social-start] Many recent failures, -25 score');
      } else if (failedCount === 0) {
        trustScore += 10;
        console.log('[auth-social-start] Clean history, +10 score');
      }

      // 7. Déterminer next_step selon le score
      trustScore = Math.max(0, Math.min(100, trustScore));
      
      if (trustScore >= 70) {
        nextStep = 'DIRECT';
      } else if (trustScore >= 40) {
        nextStep = 'ASK_SOCIAL_Q';
      } else {
        nextStep = 'ESCALATE';
      }

      console.log('[auth-social-start] Final score:', trustScore, 'Next step:', nextStep);
    }

    // 8. Logger la décision
    const hourBucket = context.hour ?? new Date().getHours();
    await supabase.from('auth_context_logs').insert({
      merchant_id: merchant?.id || null,
      phone: normalizedPhone,
      device_fingerprint,
      latitude: context.lat,
      longitude: context.lng,
      trust_score: trustScore,
      decision: nextStep,
      hour_bucket: hourBucket,
      reason_codes: reasonCodes,
      factors: { lang, persona },
      outcome: 'pending',
    });

    // 9. Générer le message TTS
    const messageTts = generateTtsMessage(
      nextStep,
      lang,
      persona,
      merchant?.full_name
    );

    const response: StartResponse = {
      merchant_found: merchantFound,
      normalized_phone_e164: normalizedPhone,
      next_step: nextStep,
      message_tts: messageTts,
      trust_score: trustScore,
      merchant_id: merchant?.id,
      merchant_name: merchant?.full_name,
      persona,
      reason_codes: reasonCodes,
    };

    console.log('[auth-social-start] Response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[auth-social-start] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
