import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  phone: string;
  code: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code }: VerifyOTPRequest = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Téléphone et code requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\s/g, "");
    console.log(`[verify-otp] Verifying OTP for ${cleanPhone}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find valid OTP
    const { data: otpRecord, error: selectError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", cleanPhone)
      .eq("code", code)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (selectError) {
      console.error("[verify-otp] Error querying OTP:", selectError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la vérification" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpRecord) {
      console.log(`[verify-otp] Invalid or expired OTP for ${cleanPhone}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Code invalide ou expiré" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from("otp_codes")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    if (updateError) {
      console.error("[verify-otp] Error updating OTP:", updateError);
    }

    // Clean up old OTPs for this phone
    await supabase
      .from("otp_codes")
      .delete()
      .eq("phone", cleanPhone)
      .neq("id", otpRecord.id);

    console.log(`[verify-otp] OTP verified successfully for ${cleanPhone}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Code vérifié avec succès" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[verify-otp] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
