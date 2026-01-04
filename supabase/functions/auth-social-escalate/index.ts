import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EscalateRequest {
  merchant_id?: string;
  phone_e164?: string;
  method_preferred: 'AGENT' | 'COOP';
  reason?: string;
  lang?: string;
}

interface EscalateResponse {
  ticket_id: string;
  validation_code: string;
  message_tts: string;
  expires_at: string;
}

// Génère un code de validation à 6 chiffres
function generateValidationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateTtsMessage(lang: string, persona: string, code: string): string {
  const messages: Record<string, Record<string, string>> = {
    TANTIE: {
      fr: `J'ai prévenu quelqu'un pour t'aider. Ton code est ${code.split('').join(' ')}. Garde-le bien.`,
      dioula: `N ye mɔgɔ weele k'i dɛmɛ. I ka code ye ${code.split('').join(' ')}. A mara.`,
    },
    JEUNE: {
      fr: `On a appelé quelqu'un. Ton code c'est ${code.split('').join(' ')}. Oublie pas.`,
      dioula: `N ye mɔgɔ wele. I ka code ye ${code.split('').join(' ')}. A mara.`,
    },
  };

  const personaMessages = messages[persona] || messages.TANTIE;
  return personaMessages[lang] || personaMessages.fr;
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

    const body: EscalateRequest = await req.json();
    const { merchant_id, phone_e164, method_preferred, reason, lang = 'fr' } = body;

    console.log('[auth-social-escalate] Processing:', { merchant_id, phone_e164, method_preferred });

    // Trouver le merchant_id si non fourni
    let effectiveMerchantId = merchant_id;
    let persona = 'TANTIE';

    if (!effectiveMerchantId && phone_e164) {
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id, persona')
        .eq('phone', phone_e164)
        .single();
      
      if (merchant) {
        effectiveMerchantId = merchant.id;
        persona = merchant.persona || 'TANTIE';
      }
    } else if (effectiveMerchantId) {
      const { data: merchant } = await supabase
        .from('merchants')
        .select('persona')
        .eq('id', effectiveMerchantId)
        .single();
      
      if (merchant) {
        persona = merchant.persona || 'TANTIE';
      }
    }

    if (!effectiveMerchantId) {
      console.error('[auth-social-escalate] No merchant found');
      return new Response(
        JSON.stringify({ error: 'Merchant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Générer le code de validation
    const validationCode = generateValidationCode();
    
    // Date d'expiration (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Créer le ticket de validation
    const { data: validation, error: validationError } = await supabase
      .from('trust_validations')
      .insert({
        merchant_id: effectiveMerchantId,
        validation_code: validationCode,
        validation_type: method_preferred.toLowerCase(),
        method: method_preferred,
        reason: reason || 'Low trust score',
        requested_by_phone: phone_e164,
        result: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();

    if (validationError) {
      console.error('[auth-social-escalate] Error creating validation:', validationError);
      throw validationError;
    }

    console.log('[auth-social-escalate] Created validation:', validation.id);

    // Créer un événement de risque
    await supabase.from('risk_events').insert({
      merchant_id: effectiveMerchantId,
      event_type: 'ESCALATION',
      severity: 'MEDIUM',
      details: {
        method: method_preferred,
        reason,
        validation_id: validation.id,
      },
    });

    // Notifier les agents si méthode AGENT
    if (method_preferred === 'AGENT') {
      // Récupérer les agents actifs
      const { data: agents } = await supabase
        .from('agents')
        .select('user_id')
        .eq('is_active', true)
        .limit(10);

      if (agents && agents.length > 0) {
        // Créer des notifications pour les agents
        const notifications = agents.map(agent => ({
          user_id: agent.user_id,
          type: 'warning',
          category: 'validation',
          title: 'Validation requise',
          message: `Un marchand a besoin de validation. Code: ${validationCode}`,
          icon: '🔐',
          action_url: '/agent/validations',
          metadata: {
            validation_id: validation.id,
            merchant_id: effectiveMerchantId,
          },
        }));

        await supabase.from('notifications').insert(notifications);
        console.log('[auth-social-escalate] Notified', agents.length, 'agents');
      }
    }

    // Logger dans auth_context_logs
    await supabase.from('auth_context_logs').insert({
      merchant_id: effectiveMerchantId,
      phone: phone_e164 || '',
      decision: 'ESCALATE',
      trust_score: 0,
      reason_codes: ['ESCALATED_TO_' + method_preferred],
      outcome: 'pending',
      hour_bucket: new Date().getHours(),
    });

    const response: EscalateResponse = {
      ticket_id: validation.id,
      validation_code: validationCode,
      message_tts: generateTtsMessage(lang, persona, validationCode),
      expires_at: expiresAt.toISOString(),
    };

    console.log('[auth-social-escalate] Response:', { ticket_id: response.ticket_id });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[auth-social-escalate] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
