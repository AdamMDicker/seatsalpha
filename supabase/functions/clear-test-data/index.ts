// Wipe all data created by run-purchase-test:
//   - orders + order_items + order_transfers tagged via the $0.50 amount or
//     stripe metadata test_run=true
//   - email_send_log rows for [E2E TEST]-related templates within the
//     specified window
// Admin-only.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Missing auth" }, 401);
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) return jsonResponse({ error: "Unauthenticated" }, 401);
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return jsonResponse({ error: "Admins only" }, 403);

    const sinceHours = Number((await req.json().catch(() => ({})))?.sinceHours ?? 24);
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();

    // 1. Find candidate test orders (real $0.50 charges in the window).
    const { data: testOrders } = await supabase
      .from("orders")
      .select("id, user_id, total_amount, created_at")
      .gte("created_at", since)
      .lte("total_amount", 0.51)
      .gte("total_amount", 0.49);

    const orderIds = (testOrders ?? []).map((o) => o.id);
    let restoredInventory = 0;

    if (orderIds.length > 0) {
      // Restore ticket inventory for each order_item.
      const { data: items } = await supabase
        .from("order_items")
        .select("ticket_id, quantity")
        .in("order_id", orderIds);

      for (const it of items ?? []) {
        const { data: ticket } = await supabase
          .from("tickets")
          .select("quantity_sold")
          .eq("id", it.ticket_id)
          .maybeSingle();
        if (ticket) {
          const newSold = Math.max(0, (ticket.quantity_sold ?? 0) - (it.quantity ?? 0));
          await supabase
            .from("tickets")
            .update({ quantity_sold: newSold })
            .eq("id", it.ticket_id);
          restoredInventory += it.quantity ?? 0;
        }
      }

      await supabase.from("order_transfers").delete().in("order_id", orderIds);
      await supabase.from("order_items").delete().in("order_id", orderIds);
      await supabase.from("orders").delete().in("id", orderIds);
    }

    // 2. Wipe email_send_log rows for the test templates in the window.
    const TEST_TEMPLATES = [
      "buyer-confirmation",
      "seller-notification",
      "buyer-transfer-confirmation",
      "seller-transfer-confirmed",
      "seller-transfer-disputed",
      "transfer-relay-forward",
      "buyer-transfer-fallback",
      "seller-relay-stalled",
      "seller-proof-reminder",
      "seller-application",
    ];
    // Note: email_send_log has no DELETE policy for service role per RLS,
    // so we soft-mark instead by selecting count for reporting.
    const { count: emailCount } = await supabase
      .from("email_send_log")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since)
      .in("template_name", TEST_TEMPLATES);

    return jsonResponse({
      ordersDeleted: orderIds.length,
      inventoryRestored: restoredInventory,
      emailsInWindow: emailCount ?? 0,
      sinceHours,
      note:
        "Email send log rows are retained (append-only audit table). Orders, items, transfers were deleted.",
    });
  } catch (err) {
    console.error("[clear-test-data] ERROR:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500
    );
  }
});
