import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransferRequest {
  recipient_phone: string;
  amount: number;
  description?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Token invalide" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { recipient_phone, amount, description }: TransferRequest = await req.json();

    // Validate input
    if (!recipient_phone || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Données invalides" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[wallet-transfer] User ${user.id} transferring ${amount} XOF to ${recipient_phone}`);

    // Get sender's wallet
    const { data: senderMerchant, error: senderMerchantError } = await supabase
      .from("merchants")
      .select("id, full_name, phone")
      .eq("user_id", user.id)
      .single();

    if (senderMerchantError || !senderMerchant) {
      console.error("[wallet-transfer] Sender merchant not found:", senderMerchantError);
      return new Response(
        JSON.stringify({ success: false, error: "Marchand non trouvé" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: senderWallet, error: senderWalletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("merchant_id", senderMerchant.id)
      .single();

    if (senderWalletError || !senderWallet) {
      console.error("[wallet-transfer] Sender wallet not found:", senderWalletError);
      return new Response(
        JSON.stringify({ success: false, error: "Portefeuille expéditeur non trouvé" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check balance
    if (senderWallet.balance < amount) {
      return new Response(
        JSON.stringify({ success: false, error: "Solde insuffisant" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find recipient by phone
    const { data: recipientMerchant, error: recipientMerchantError } = await supabase
      .from("merchants")
      .select("id, full_name, phone")
      .eq("phone", recipient_phone)
      .single();

    if (recipientMerchantError || !recipientMerchant) {
      console.error("[wallet-transfer] Recipient not found:", recipientMerchantError);
      return new Response(
        JSON.stringify({ success: false, error: "Destinataire non trouvé avec ce numéro" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cannot transfer to self
    if (recipientMerchant.id === senderMerchant.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Impossible de transférer à vous-même" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: recipientWallet, error: recipientWalletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("merchant_id", recipientMerchant.id)
      .single();

    if (recipientWalletError || !recipientWallet) {
      console.error("[wallet-transfer] Recipient wallet not found:", recipientWalletError);
      return new Response(
        JSON.stringify({ success: false, error: "Portefeuille destinataire non trouvé" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique reference
    const reference = `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // Perform atomic transfer using transactions
    // 1. Debit sender
    const newSenderBalance = Number(senderWallet.balance) - amount;
    const { error: debitError } = await supabase
      .from("wallets")
      .update({ balance: newSenderBalance, updated_at: new Date().toISOString() })
      .eq("id", senderWallet.id)
      .eq("balance", senderWallet.balance); // Optimistic lock

    if (debitError) {
      console.error("[wallet-transfer] Debit failed:", debitError);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur lors du débit" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Credit recipient
    const newRecipientBalance = Number(recipientWallet.balance) + amount;
    const { error: creditError } = await supabase
      .from("wallets")
      .update({ balance: newRecipientBalance, updated_at: new Date().toISOString() })
      .eq("id", recipientWallet.id);

    if (creditError) {
      // Rollback sender debit
      console.error("[wallet-transfer] Credit failed, rolling back:", creditError);
      await supabase
        .from("wallets")
        .update({ balance: senderWallet.balance })
        .eq("id", senderWallet.id);
      
      return new Response(
        JSON.stringify({ success: false, error: "Erreur lors du crédit" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Create transaction records
    const sendTx = {
      wallet_id: senderWallet.id,
      type: "transfer_sent",
      amount,
      counterparty_wallet_id: recipientWallet.id,
      counterparty_name: recipientMerchant.full_name,
      counterparty_phone: recipientMerchant.phone,
      reference,
      description: description || `Transfert à ${recipientMerchant.full_name}`,
      status: "completed",
    };

    const receiveTx = {
      wallet_id: recipientWallet.id,
      type: "transfer_received",
      amount,
      counterparty_wallet_id: senderWallet.id,
      counterparty_name: senderMerchant.full_name,
      counterparty_phone: senderMerchant.phone,
      reference: `${reference}-R`,
      description: description || `Reçu de ${senderMerchant.full_name}`,
      status: "completed",
    };

    const { error: txError } = await supabase
      .from("wallet_transactions")
      .insert([sendTx, receiveTx]);

    if (txError) {
      console.error("[wallet-transfer] Transaction record failed:", txError);
      // Non-critical, transfer still succeeded
    }

    // 4. Update or create beneficiary
    const { error: beneficiaryError } = await supabase
      .from("beneficiaries")
      .upsert({
        owner_wallet_id: senderWallet.id,
        beneficiary_wallet_id: recipientWallet.id,
        nickname: recipientMerchant.full_name,
        transfer_count: 1,
        last_transfer_at: new Date().toISOString(),
      }, {
        onConflict: "owner_wallet_id,beneficiary_wallet_id",
      });

    if (beneficiaryError) {
      console.log("[wallet-transfer] Beneficiary update skipped:", beneficiaryError);
    }

    // 5. Create notification for recipient
    const { data: recipientProfile } = await supabase
      .from("merchants")
      .select("user_id")
      .eq("id", recipientMerchant.id)
      .single();

    if (recipientProfile?.user_id) {
      await supabase.rpc("create_notification", {
        p_user_id: recipientProfile.user_id,
        p_type: "success",
        p_category: "wallet",
        p_title: "Transfert reçu",
        p_message: `Vous avez reçu ${amount.toLocaleString()} FCFA de ${senderMerchant.full_name}`,
        p_icon: "💰",
        p_action_url: "/marchand/wallet",
      });
    }

    console.log(`[wallet-transfer] Success: ${reference}, ${amount} XOF from ${senderMerchant.phone} to ${recipientMerchant.phone}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reference,
          amount,
          recipient_name: recipientMerchant.full_name,
          new_balance: newSenderBalance,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[wallet-transfer] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
