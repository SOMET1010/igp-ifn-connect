import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body to check if checking merchant or cooperative
    let checkType = "all";
    try {
      const body = await req.json();
      checkType = body.type || "all";
    } catch {
      // Default to all if no body
    }

    console.log(`Checking low stock for: ${checkType}`);

    let merchantNotified = 0;
    let cooperativeNotified = 0;
    let merchantLowStockCount = 0;
    let cooperativeLowStockCount = 0;

    // Check merchant stocks
    if (checkType === "all" || checkType === "merchant") {
      const { data: merchantStocks, error: merchantStocksError } = await supabase
        .from("merchant_stocks")
        .select("*");

      if (merchantStocksError) {
        console.error("Error fetching merchant stocks:", merchantStocksError);
      } else {
        // Filter stocks where quantity < min_threshold
        const lowMerchantStocks = merchantStocks?.filter(
          (stock) => stock.quantity < (stock.min_threshold || 5)
        ) || [];

        merchantLowStockCount = lowMerchantStocks.length;
        console.log(`Found ${merchantLowStockCount} low merchant stock items`);

        if (lowMerchantStocks.length > 0) {
          // Get merchant and product details
          const merchantIds = [...new Set(lowMerchantStocks.map((s) => s.merchant_id))];
          const productIds = [...new Set(lowMerchantStocks.map((s) => s.product_id))];

          const { data: merchants } = await supabase
            .from("merchants")
            .select("id, full_name, user_id")
            .in("id", merchantIds);

          const { data: products } = await supabase
            .from("products")
            .select("id, name")
            .in("id", productIds);

          const merchantMap = new Map(merchants?.map((m) => [m.id, m]) || []);
          const productMap = new Map(products?.map((p) => [p.id, p]) || []);

          // Group by merchant
          const merchantAlerts = new Map<string, { user_id: string; name: string; items: string[] }>();

          for (const stock of lowMerchantStocks) {
            const merchant = merchantMap.get(stock.merchant_id);
            const product = productMap.get(stock.product_id);

            if (merchant && merchant.user_id && product) {
              if (!merchantAlerts.has(merchant.user_id)) {
                merchantAlerts.set(merchant.user_id, {
                  user_id: merchant.user_id,
                  name: merchant.full_name,
                  items: [],
                });
              }
              merchantAlerts.get(merchant.user_id)!.items.push(
                `${product.name}: ${stock.quantity}/${stock.min_threshold || 5}`
              );
            }
          }

          // Send notifications
          for (const [userId, alert] of merchantAlerts) {
            const { data: subscriptions } = await supabase
              .from("push_subscriptions")
              .select("*")
              .eq("user_id", userId);

            if (!subscriptions || subscriptions.length === 0) continue;

            const itemsList = alert.items.slice(0, 3).join(", ");
            const moreItems = alert.items.length > 3 ? ` +${alert.items.length - 3} autres` : "";

            const notification = {
              title: "⚠️ Alerte stock bas",
              body: `${itemsList}${moreItems}`,
              data: { type: "low_stock", url: "/marchand/stock" },
            };

            for (const sub of subscriptions) {
              try {
                const response = await fetch(sub.endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "TTL": "86400", "Urgency": "normal" },
                  body: JSON.stringify(notification),
                });

                if (response.ok) merchantNotified++;

                await supabase.from("notification_logs").insert({
                  user_id: userId,
                  title: notification.title,
                  body: notification.body,
                  type: "low_stock",
                  data: notification.data,
                  delivered: response.ok,
                  error: response.ok ? null : `${response.status}`,
                });

                if (response.status === 410) {
                  await supabase.from("push_subscriptions").delete().eq("id", sub.id);
                }
              } catch (err) {
                console.error(`Error sending push:`, err);
              }
            }
          }
        }
      }
    }

    // Check cooperative stocks
    if (checkType === "all" || checkType === "cooperative") {
      const { data: coopStocks, error: coopStocksError } = await supabase
        .from("stocks")
        .select("*");

      if (coopStocksError) {
        console.error("Error fetching cooperative stocks:", coopStocksError);
      } else {
        // Filter cooperative stocks where quantity < 10 (default threshold for cooperatives)
        const lowCoopStocks = coopStocks?.filter(
          (stock) => stock.quantity < 10
        ) || [];

        cooperativeLowStockCount = lowCoopStocks.length;
        console.log(`Found ${cooperativeLowStockCount} low cooperative stock items`);

        if (lowCoopStocks.length > 0) {
          const cooperativeIds = [...new Set(lowCoopStocks.map((s) => s.cooperative_id))];
          const productIds = [...new Set(lowCoopStocks.map((s) => s.product_id))];

          const { data: cooperatives } = await supabase
            .from("cooperatives")
            .select("id, name, user_id")
            .in("id", cooperativeIds);

          const { data: products } = await supabase
            .from("products")
            .select("id, name")
            .in("id", productIds);

          const coopMap = new Map(cooperatives?.map((c) => [c.id, c]) || []);
          const productMap = new Map(products?.map((p) => [p.id, p]) || []);

          const coopAlerts = new Map<string, { user_id: string; name: string; items: string[] }>();

          for (const stock of lowCoopStocks) {
            const coop = coopMap.get(stock.cooperative_id);
            const product = productMap.get(stock.product_id);

            if (coop && coop.user_id && product) {
              if (!coopAlerts.has(coop.user_id)) {
                coopAlerts.set(coop.user_id, {
                  user_id: coop.user_id,
                  name: coop.name,
                  items: [],
                });
              }
              coopAlerts.get(coop.user_id)!.items.push(
                `${product.name}: ${stock.quantity} unités`
              );
            }
          }

          for (const [userId, alert] of coopAlerts) {
            const { data: subscriptions } = await supabase
              .from("push_subscriptions")
              .select("*")
              .eq("user_id", userId);

            if (!subscriptions || subscriptions.length === 0) continue;

            const itemsList = alert.items.slice(0, 3).join(", ");
            const moreItems = alert.items.length > 3 ? ` +${alert.items.length - 3} autres` : "";

            const notification = {
              title: "🌾 Alerte stock coopérative",
              body: `${itemsList}${moreItems}`,
              data: { type: "low_stock_coop", url: "/cooperative/stock" },
            };

            for (const sub of subscriptions) {
              try {
                const response = await fetch(sub.endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", "TTL": "86400", "Urgency": "normal" },
                  body: JSON.stringify(notification),
                });

                if (response.ok) cooperativeNotified++;

                await supabase.from("notification_logs").insert({
                  user_id: userId,
                  title: notification.title,
                  body: notification.body,
                  type: "low_stock_coop",
                  data: notification.data,
                  delivered: response.ok,
                  error: response.ok ? null : `${response.status}`,
                });

                if (response.status === 410) {
                  await supabase.from("push_subscriptions").delete().eq("id", sub.id);
                }
              } catch (err) {
                console.error(`Error sending push:`, err);
              }
            }
          }
        }
      }
    }

    console.log(`Notified: ${merchantNotified} merchants, ${cooperativeNotified} cooperatives`);

    return new Response(
      JSON.stringify({
        success: true,
        merchant: { lowStockCount: merchantLowStockCount, notified: merchantNotified },
        cooperative: { lowStockCount: cooperativeLowStockCount, notified: cooperativeNotified },
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

