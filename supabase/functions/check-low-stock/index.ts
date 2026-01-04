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

serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body to check if checking merchant or cooperative
    let checkType = "all";
    try {
      const body = await req.json();
      checkType = body.type || "all";
    } catch {
      // Default to all if no body
    }

    console.log(`[check-low-stock] Checking low stock for: ${checkType}`);

    let merchantNotified = 0;
    let cooperativeNotified = 0;
    let merchantLowStockCount = 0;
    let cooperativeLowStockCount = 0;

    // Run merchant and cooperative checks in parallel when checking "all"
    const checkPromises: Promise<void>[] = [];

    // Check merchant stocks with optimized JOIN query
    if (checkType === "all" || checkType === "merchant") {
      checkPromises.push((async () => {
        // Optimized query using JOINs instead of multiple sequential queries
        const { data: lowMerchantStocks, error: merchantStocksError } = await supabase
          .from("merchant_stocks")
          .select(`
            id, quantity, min_threshold, merchant_id, product_id,
            merchant:merchants!inner(id, full_name, user_id),
            product:products!inner(id, name)
          `)
          .lt('quantity', 10); // Filter low stock server-side

        if (merchantStocksError) {
          console.error("[check-low-stock] Error fetching merchant stocks:", merchantStocksError);
          return;
        }

        // Further filter by individual min_threshold
        const filteredStocks = lowMerchantStocks?.filter(
          (stock) => stock.quantity < (stock.min_threshold || 5)
        ) || [];

        merchantLowStockCount = filteredStocks.length;
        console.log(`[check-low-stock] Found ${merchantLowStockCount} low merchant stock items (${Date.now() - startTime}ms)`);

        if (filteredStocks.length === 0) return;

        // Group by merchant user_id
        const merchantAlerts = new Map<string, { user_id: string; name: string; items: string[] }>();

        for (const stock of filteredStocks) {
          // Handle the joined data - Supabase returns single objects for !inner joins
          const merchantData = stock.merchant as unknown as { id: string; full_name: string; user_id: string } | null;
          const productData = stock.product as unknown as { id: string; name: string } | null;

          if (merchantData?.user_id && productData) {
            if (!merchantAlerts.has(merchantData.user_id)) {
              merchantAlerts.set(merchantData.user_id, {
                user_id: merchantData.user_id,
                name: merchantData.full_name,
                items: [],
              });
            }
            merchantAlerts.get(merchantData.user_id)!.items.push(
              `${productData.name}: ${stock.quantity}/${stock.min_threshold || 5}`
            );
          }
        }

        // Get all subscriptions for these users in one query
        const userIds = Array.from(merchantAlerts.keys());
        if (userIds.length === 0) return;

        const { data: allSubscriptions } = await supabase
          .from("push_subscriptions")
          .select("*")
          .in("user_id", userIds);

        if (!allSubscriptions || allSubscriptions.length === 0) return;

        // Group subscriptions by user
        const subsByUser = new Map<string, typeof allSubscriptions>();
        for (const sub of allSubscriptions) {
          if (!subsByUser.has(sub.user_id)) {
            subsByUser.set(sub.user_id, []);
          }
          subsByUser.get(sub.user_id)!.push(sub);
        }

        // Send notifications in parallel
        const sendPromises: Promise<void>[] = [];
        
        for (const [userId, alert] of merchantAlerts) {
          const subscriptions = subsByUser.get(userId);
          if (!subscriptions || subscriptions.length === 0) continue;

          const itemsList = alert.items.slice(0, 3).join(", ");
          const moreItems = alert.items.length > 3 ? ` +${alert.items.length - 3} autres` : "";

          const notification = {
            title: "⚠️ Alerte stock bas",
            body: `${itemsList}${moreItems}`,
            data: { type: "low_stock", url: "/marchand/stock" },
          };

          for (const sub of subscriptions) {
            sendPromises.push((async () => {
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
                console.error(`[check-low-stock] Error sending push:`, err);
              }
            })());
          }
        }

        await Promise.all(sendPromises);
      })());
    }

    // Check cooperative stocks with optimized JOIN query
    if (checkType === "all" || checkType === "cooperative") {
      checkPromises.push((async () => {
        // Optimized query using JOINs
        const { data: lowCoopStocks, error: coopStocksError } = await supabase
          .from("stocks")
          .select(`
            id, quantity, cooperative_id, product_id,
            cooperative:cooperatives!inner(id, name, user_id),
            product:products!inner(id, name)
          `)
          .lt('quantity', 10); // Filter low stock server-side

        if (coopStocksError) {
          console.error("[check-low-stock] Error fetching cooperative stocks:", coopStocksError);
          return;
        }

        cooperativeLowStockCount = lowCoopStocks?.length || 0;
        console.log(`[check-low-stock] Found ${cooperativeLowStockCount} low cooperative stock items (${Date.now() - startTime}ms)`);

        if (!lowCoopStocks || lowCoopStocks.length === 0) return;

        // Group by cooperative user_id
        const coopAlerts = new Map<string, { user_id: string; name: string; items: string[] }>();

        for (const stock of lowCoopStocks) {
          // Handle the joined data - Supabase returns single objects for !inner joins
          const coopData = stock.cooperative as unknown as { id: string; name: string; user_id: string } | null;
          const productData = stock.product as unknown as { id: string; name: string } | null;

          if (coopData?.user_id && productData) {
            if (!coopAlerts.has(coopData.user_id)) {
              coopAlerts.set(coopData.user_id, {
                user_id: coopData.user_id,
                name: coopData.name,
                items: [],
              });
            }
            coopAlerts.get(coopData.user_id)!.items.push(`${productData.name}: ${stock.quantity} unités`);
          }
        }

        // Get all subscriptions for these users in one query
        const userIds = Array.from(coopAlerts.keys());
        if (userIds.length === 0) return;

        const { data: allSubscriptions } = await supabase
          .from("push_subscriptions")
          .select("*")
          .in("user_id", userIds);

        if (!allSubscriptions || allSubscriptions.length === 0) return;

        // Group subscriptions by user
        const subsByUser = new Map<string, typeof allSubscriptions>();
        for (const sub of allSubscriptions) {
          if (!subsByUser.has(sub.user_id)) {
            subsByUser.set(sub.user_id, []);
          }
          subsByUser.get(sub.user_id)!.push(sub);
        }

        // Send notifications in parallel
        const sendPromises: Promise<void>[] = [];

        for (const [userId, alert] of coopAlerts) {
          const subscriptions = subsByUser.get(userId);
          if (!subscriptions || subscriptions.length === 0) continue;

          const itemsList = alert.items.slice(0, 3).join(", ");
          const moreItems = alert.items.length > 3 ? ` +${alert.items.length - 3} autres` : "";

          const notification = {
            title: "🌾 Alerte stock coopérative",
            body: `${itemsList}${moreItems}`,
            data: { type: "low_stock_coop", url: "/cooperative/stock" },
          };

          for (const sub of subscriptions) {
            sendPromises.push((async () => {
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
                console.error(`[check-low-stock] Error sending push:`, err);
              }
            })());
          }
        }

        await Promise.all(sendPromises);
      })());
    }

    // Wait for all checks to complete
    await Promise.all(checkPromises);

    const totalTime = Date.now() - startTime;
    console.log(`[check-low-stock] Completed in ${totalTime}ms - Notified: ${merchantNotified} merchants, ${cooperativeNotified} cooperatives`);

    return new Response(
      JSON.stringify({
        success: true,
        executionTime: totalTime,
        merchant: { lowStockCount: merchantLowStockCount, notified: merchantNotified },
        cooperative: { lowStockCount: cooperativeLowStockCount, notified: cooperativeNotified },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("[check-low-stock] Error:", error);
    return new Response(
      JSON.stringify({ error }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
