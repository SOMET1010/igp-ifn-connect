import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  phone: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone }: SendOTPRequest = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Numéro de téléphone requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\s/g, "");
    console.log(`[send-otp-sms] Sending OTP to ${cleanPhone}`);

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete any existing OTPs for this phone
    await supabase
      .from("otp_codes")
      .delete()
      .eq("phone", cleanPhone);

    // Store new OTP
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        phone: cleanPhone,
        code: code,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

    if (insertError) {
      console.error("[send-otp-sms] Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'enregistrement du code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if we're in test mode
    const isTestMode = Deno.env.get("OTP_TEST_MODE") === "true";

    if (isTestMode) {
      console.log(`[send-otp-sms] TEST MODE - OTP: ${code}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          testMode: true,
          testCode: code, // Only returned in test mode!
          message: "Code envoyé (mode test)" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Production mode: Send SMS via Brevo
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    
    if (!brevoApiKey) {
      console.error("[send-otp-sms] BREVO_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service SMS non configuré" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const smsResponse = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "transactional",
        sender: "IFN-CI",
        recipient: cleanPhone,
        content: `Votre code IFN : ${code}. Valide 5 minutes.`,
      }),
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error("[send-otp-sms] Brevo error:", errorText);
      return new Response(
        JSON.stringify({ error: "Échec de l'envoi du SMS" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-otp-sms] SMS sent successfully to ${cleanPhone}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        testMode: false,
        message: "Code envoyé par SMS" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[send-otp-sms] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
