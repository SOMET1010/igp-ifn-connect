import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LowStockItem {
  merchant_id: string;
  merchant_name: string;
  user_id: string;
  product_name: string;
  quantity: number;
  min_threshold: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for low stock items...");

    // Get all merchant stocks where quantity is below threshold
    const { data: lowStockItems, error: stockError } = await supabase
      .from("merchant_stocks")
      .select(`
        id,
        quantity,
        min_threshold,
        merchant_id,
        product_id
      `)
      .lt("quantity", supabase.rpc("get_min_threshold_ref"));

    // Alternative approach: get all stocks and filter
    const { data: allStocks, error: allStocksError } = await supabase
      .from("merchant_stocks")
      .select("*");

    if (allStocksError) {
      console.error("Error fetching stocks:", allStocksError);
      throw allStocksError;
    }

    // Filter stocks where quantity < min_threshold
    const lowStocks = allStocks?.filter(
      (stock) => stock.quantity < (stock.min_threshold || 5)
    ) || [];

    console.log(`Found ${lowStocks.length} low stock items`);

    if (lowStocks.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No low stock items found", notified: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get merchant and product details
    const merchantIds = [...new Set(lowStocks.map((s) => s.merchant_id))];
    const productIds = [...new Set(lowStocks.map((s) => s.product_id))];

    const { data: merchants } = await supabase
      .from("merchants")
      .select("id, full_name, user_id")
      .in("id", merchantIds);

    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);

    // Create a map for quick lookup
    const merchantMap = new Map(merchants?.map((m) => [m.id, m]) || []);
    const productMap = new Map(products?.map((p) => [p.id, p]) || []);

    // Group low stock items by merchant
    const merchantAlerts = new Map<string, { user_id: string; merchant_name: string; items: string[] }>();

    for (const stock of lowStocks) {
      const merchant = merchantMap.get(stock.merchant_id);
      const product = productMap.get(stock.product_id);

      if (merchant && merchant.user_id && product) {
        if (!merchantAlerts.has(merchant.user_id)) {
          merchantAlerts.set(merchant.user_id, {
            user_id: merchant.user_id,
            merchant_name: merchant.full_name,
            items: [],
          });
        }
        merchantAlerts.get(merchant.user_id)!.items.push(
          `${product.name}: ${stock.quantity}/${stock.min_threshold || 5}`
        );
      }
    }

    console.log(`Sending alerts to ${merchantAlerts.size} merchants`);

    // Send push notifications to each merchant
    let notifiedCount = 0;

    for (const [userId, alert] of merchantAlerts) {
      // Get push subscriptions for this user
      const { data: subscriptions } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", userId);

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No push subscription for user ${userId}`);
        continue;
      }

      const itemsList = alert.items.slice(0, 3).join(", ");
      const moreItems = alert.items.length > 3 ? ` +${alert.items.length - 3} autres` : "";

      const notification = {
        title: "⚠️ Alerte stock bas",
        body: `${itemsList}${moreItems}`,
        data: {
          type: "low_stock",
          url: "/marchand/stock",
        },
      };

      // Send to all subscriptions for this user
      for (const sub of subscriptions) {
        try {
          const response = await fetch(sub.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "TTL": "86400",
              "Urgency": "normal",
            },
            body: JSON.stringify(notification),
          });

          const delivered = response.ok;

          // Log notification
          await supabase.from("notification_logs").insert({
            user_id: userId,
            title: notification.title,
            body: notification.body,
            type: "low_stock",
            data: notification.data,
            delivered,
            error: delivered ? null : `${response.status}`,
          });

          if (delivered) {
            notifiedCount++;
          }

          // Remove invalid subscriptions
          if (response.status === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
          }
        } catch (err) {
          console.error(`Error sending push to ${sub.endpoint}:`, err);
        }
      }
    }

    console.log(`Successfully notified ${notifiedCount} merchants`);

    return new Response(
      JSON.stringify({
        success: true,
        lowStockCount: lowStocks.length,
        merchantsWithLowStock: merchantAlerts.size,
        notified: notifiedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
