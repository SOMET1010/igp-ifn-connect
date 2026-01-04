import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApproveRequest {
  ticket_id: string;
  agent_id: string;
  decision: 'APPROVED' | 'REJECTED';
  notes?: string;
}

interface ApproveResponse {
  session_created: boolean;
  merchant_id?: string;
  message: string;
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

    const body: ApproveRequest = await req.json();
    const { ticket_id, agent_id, decision, notes } = body;

    console.log('[auth-validation-approve] Processing:', { ticket_id, agent_id, decision });

    // Récupérer le ticket de validation
    const { data: validation, error: validationError } = await supabase
      .from('trust_validations')
      .select('id, merchant_id, result, expires_at')
      .eq('id', ticket_id)
      .single();

    if (validationError || !validation) {
      console.error('[auth-validation-approve] Validation not found:', validationError);
      return new Response(
        JSON.stringify({ 
          session_created: false, 
          message: 'Ticket de validation non trouvé' 
        } as ApproveResponse),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si le ticket n'est pas expiré
    if (new Date(validation.expires_at) < new Date()) {
      console.log('[auth-validation-approve] Ticket expired');
      return new Response(
        JSON.stringify({ 
          session_created: false, 
          message: 'Le ticket de validation a expiré' 
        } as ApproveResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si le ticket n'est pas déjà traité
    if (validation.result !== 'pending') {
      console.log('[auth-validation-approve] Ticket already processed:', validation.result);
      return new Response(
        JSON.stringify({ 
          session_created: false, 
          message: `Ce ticket a déjà été ${validation.result === 'approved' ? 'approuvé' : 'rejeté'}` 
        } as ApproveResponse),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mettre à jour le ticket
    const { error: updateError } = await supabase
      .from('trust_validations')
      .update({
        result: decision.toLowerCase(),
        validated_by: agent_id,
        validated_at: new Date().toISOString(),
        notes,
        validator_role: 'agent',
      })
      .eq('id', ticket_id);

    if (updateError) {
      console.error('[auth-validation-approve] Error updating validation:', updateError);
      throw updateError;
    }

    // Enregistrer l'action de l'agent
    await supabase.from('agent_actions').insert({
      agent_id,
      action_type: 'VALIDATE_LOGIN',
      target_merchant_id: validation.merchant_id,
      validation_id: ticket_id,
      outcome: decision,
      details: { notes },
    });

    // Si approuvé, notifier le marchand
    if (decision === 'APPROVED') {
      // Récupérer le user_id du marchand
      const { data: merchant } = await supabase
        .from('merchants')
        .select('user_id, full_name')
        .eq('id', validation.merchant_id)
        .single();

      if (merchant?.user_id) {
        await supabase.from('notifications').insert({
          user_id: merchant.user_id,
          type: 'success',
          category: 'auth',
          title: 'Connexion validée',
          message: 'Votre identité a été confirmée. Vous pouvez maintenant accéder à votre compte.',
          icon: '✅',
        });
      }

      console.log('[auth-validation-approve] Merchant approved:', validation.merchant_id);
    }

    // Mettre à jour les logs d'authentification en attente
    await supabase
      .from('auth_context_logs')
      .update({
        outcome: decision === 'APPROVED' ? 'success' : 'failed',
      })
      .eq('merchant_id', validation.merchant_id)
      .eq('outcome', 'pending');

    const response: ApproveResponse = {
      session_created: decision === 'APPROVED',
      merchant_id: validation.merchant_id,
      message: decision === 'APPROVED' 
        ? 'Validation approuvée. Le marchand peut se connecter.' 
        : 'Validation rejetée.',
    };

    console.log('[auth-validation-approve] Response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[auth-validation-approve] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
