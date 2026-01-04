import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Singleton pattern: Create client once at module level
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  url?: string;
}

interface RequestBody {
  user_ids?: string[];
  role?: string;
  notification: PushPayload;
  type?: string;
}

// Send a single push notification using simple fetch
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const payloadString = JSON.stringify(payload);
    
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TTL": "86400",
        "Urgency": "high",
      },
      body: payloadString,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Push failed:", response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("Push error:", error);
    return { success: false, error };
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { user_ids, role, notification, type = "general" } = body;

    console.log("[send-push-notification] Sending push notification:", { user_ids, role, type, notification });

    // Build query for subscriptions
    let subscriptionUserIds = user_ids;

    if (!user_ids && role) {
      // Get users with specific role
      const { data: roleUsers } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", role);
      
      if (!roleUsers || roleUsers.length === 0) {
        return new Response(
          JSON.stringify({ success: true, sent: 0, message: "No users with specified role" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      subscriptionUserIds = roleUsers.map((r: { user_id: string }) => r.user_id);
    }

    // Fetch subscriptions
    let query = supabase.from("push_subscriptions").select("*");
    if (subscriptionUserIds && subscriptionUserIds.length > 0) {
      query = query.in("user_id", subscriptionUserIds);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      throw subError;
    }

    console.log(`[send-push-notification] Found ${subscriptions?.length || 0} subscriptions`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send notifications in parallel
    const results = await Promise.all(
      subscriptions.map(async (sub: { id: string; user_id: string; endpoint: string; p256dh: string; auth: string }) => {
        const result = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          notification
        );

        // Log and cleanup in parallel
        await Promise.all([
          supabase.from("notification_logs").insert({
            user_id: sub.user_id,
            title: notification.title,
            body: notification.body,
            type,
            data: notification.data,
            delivered: result.success,
            error: result.error,
          }),
          // Remove invalid subscriptions (410 Gone)
          (!result.success && result.error?.includes("410"))
            ? supabase.from("push_subscriptions").delete().eq("id", sub.id)
            : Promise.resolve()
        ]);

        return result;
      })
    );

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`[send-push-notification] Push results: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ success: true, sent, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("[send-push-notification] Error:", error);
    return new Response(
      JSON.stringify({ error }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
