// One-click end-to-end purchase test orchestrator.
//
// Actions (POST { action: "..." }):
//   - "start"   → returns a Stripe Checkout URL for a real $0.50 charge,
//                 tagged with metadata.test_run=true. Admin opens in a new
//                 tab and completes payment with a real card.
//   - "poll"    → checks for the resulting order (by test_run metadata),
//                 returns { orderId, transferId } when found.
//   - "trigger" → invokes every downstream transactional email path against
//                 the test order so all templates emit a row to
//                 email_send_log. Used by the assert step.
//   - "assert"  → reads email_send_log for the buyer/seller test addresses
//                 over the last 30 minutes and returns a per-template
//                 pass/fail summary.
//
// Admin-only: caller must hold the 'admin' role.

import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Templates we expect to emit during a full E2E run.
// Each has a `trigger` describing what server call produces it.
const EXPECTED_TEMPLATES: Array<{ name: string; trigger: string }> = [
  { name: "buyer-confirmation",        trigger: "stripe-webhook" },
  { name: "seller-notification",       trigger: "stripe-webhook" },
  { name: "buyer-transfer-confirmation", trigger: "notify-buyer-transfer" },
  { name: "seller-transfer-confirmed",   trigger: "notify-buyer-transfer" },
  { name: "seller-transfer-disputed",    trigger: "notify-buyer-transfer" },
  { name: "transfer-relay-forward",      trigger: "resolve-transfer-email (test preview)" },
  { name: "buyer-transfer-fallback",     trigger: "transfer-fallback-reminder" },
  { name: "seller-relay-stalled",        trigger: "transfer-relay-stalled-reminder" },
  { name: "seller-proof-reminder",       trigger: "seller-proof-reminder" },
  { name: "seller-application",          trigger: "send-transactional-email" },
];

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

    // --- Auth: require admin ---
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

    const body = await req.json().catch(() => ({}));
    const action: string = body.action || "start";

    // ── Trace ID ──────────────────────────────────────────────────
    // Every E2E run is tagged with a single traceId. The client passes
    // it on every action call; we echo it back in responses and stamp
    // every console.log so an admin can grep edge-function logs and
    // the analytics_query database for the exact run.
    const traceId: string =
      typeof body.traceId === "string" && body.traceId.length > 0
        ? body.traceId
        : crypto.randomUUID();
    const trace = (msg: string) => console.log(`[e2e-trace:${traceId}] [${action}] ${msg}`);
    trace(`begin action=${action}`);

    // --- ACTION: start ---
    if (action === "start") {
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      // Pick the cheapest active Blue Jays ticket with remaining inventory
      // for a future event. Falls back to any active future ticket.
      const { data: futureEvents } = await supabase
        .from("events")
        .select("id, title, venue, event_date")
        .gt("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(20);
      if (!futureEvents || futureEvents.length === 0) {
        return jsonResponse({ error: "No future events to test against" }, 400);
      }
      const eventIds = futureEvents.map((e) => e.id);
      const { data: tickets } = await supabase
        .from("tickets")
        .select("id, event_id, price, section, row_name, quantity, quantity_sold")
        .in("event_id", eventIds)
        .eq("is_active", true)
        .order("price", { ascending: true })
        .limit(50);
      const availableTicket = (tickets ?? []).find(
        (t) => (t.quantity ?? 1) - (t.quantity_sold ?? 0) > 0
      );
      if (!availableTicket) {
        return jsonResponse({ error: "No active tickets with inventory" }, 400);
      }
      const evt = futureEvents.find((e) => e.id === availableTicket.event_id)!;

      const buyerEmail = body.buyerEmail || userData.user.email!;
      const tier = `Section ${availableTicket.section}${availableTicket.row_name ? `, Row ${availableTicket.row_name}` : ""}`;
      const ticketAmount = 0.5; // $0.50 CAD test charge
      const origin = req.headers.get("origin") || "https://seats.ca";

      // Single one-time test charge — bypass the membership subscription
      // path so the test does not re-enroll the admin in a yearly plan.
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: buyerEmail,
        line_items: [
          {
            price_data: {
              currency: "cad",
              product_data: {
                name: `[E2E TEST] ${evt.title}`,
                description: `${tier} · ${evt.venue}`,
              },
              unit_amount: 50, // 50 cents
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/admin?e2e=success`,
        cancel_url: `${origin}/admin?e2e=canceled`,
        metadata: {
          test_run: "true",
          trace_id: traceId,
          event_title: evt.title,
          ticket_quantity: "1",
          ticket_tier: tier,
          venue: evt.venue,
          event_date: evt.event_date,
          ticket_id: availableTicket.id,
          service_fee: "0",
          ticket_unit_price: "0.50",
          membership_amount: "0",
        },
        payment_intent_data: {
          metadata: { test_run: "true", trace_id: traceId },
        },
      });

      trace(`stripe session created id=${session.id} ticket=${availableTicket.id}`);
      return jsonResponse({
        traceId,
        url: session.url,
        sessionId: session.id,
        ticketId: availableTicket.id,
        eventTitle: evt.title,
        buyerEmail,
        startedAt: new Date().toISOString(),
      });
    }

    // --- ACTION: poll ---
    // Find the most recent test order for this admin (created in last 30 min).
    if (action === "poll") {
      const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: orders } = await supabase
        .from("orders")
        .select("id, user_id, status, created_at, stripe_event_id, total_amount")
        .gte("created_at", since)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);

      // Match the $0.50 test charge.
      const order = (orders ?? []).find(
        (o) => Math.abs(Number(o.total_amount) - 0.5) < 0.01
      );
      if (!order) return jsonResponse({ ready: false });

      const { data: transfer } = await supabase
        .from("order_transfers")
        .select("id, ticket_id, seller_id, transfer_email_alias")
        .eq("order_id", order.id)
        .maybeSingle();

      return jsonResponse({
        ready: true,
        orderId: order.id,
        transferId: transfer?.id ?? null,
        transferAlias: transfer?.transfer_email_alias ?? null,
        ticketId: transfer?.ticket_id ?? null,
        sellerId: transfer?.seller_id ?? null,
      });
    }

    // --- ACTION: trigger ---
    // Fire each downstream email path so every template gets a row in
    // email_send_log. Each call is best-effort and logged.
    if (action === "trigger") {
      const { orderId, transferId, ticketId, sellerId, buyerEmail } = body;
      if (!orderId || !transferId) {
        return jsonResponse({ error: "Missing orderId/transferId" }, 400);
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      };

      const triggerLog: Array<{ template: string; ok: boolean; detail?: string }> = [];
      async function call(label: string, fn: string, payload: unknown) {
        try {
          const r = await fetch(`${supabaseUrl}/functions/v1/${fn}`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          });
          const text = await r.text();
          triggerLog.push({ template: label, ok: r.ok, detail: r.ok ? undefined : text.slice(0, 200) });
        } catch (err) {
          triggerLog.push({ template: label, ok: false, detail: String(err).slice(0, 200) });
        }
      }

      // 1. Transfer confirmation (buyer + seller confirmed)
      await call("notify-buyer-transfer (confirm)", "notify-buyer-transfer", {
        transfer_id: transferId,
        action: "confirm",
      });

      // 2. Transfer disputed
      await call("notify-buyer-transfer (dispute)", "notify-buyer-transfer", {
        transfer_id: transferId,
        action: "dispute",
      });
      // Restore confirmed state so subsequent reminder paths trigger.
      await supabase
        .from("order_transfers")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", transferId);

      // 3. Transfer-relay forward (test preview mode → emits transfer-relay-forward log)
      await call("resolve-transfer-email (preview)", "resolve-transfer-email", {
        test_preview: true,
        recipient_email: buyerEmail,
      });

      // 4. Buyer fallback reminder — backdate confirmed_at, then run cron handler
      await supabase
        .from("order_transfers")
        .update({
          confirmed_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          forward_sent_at: null,
          fallback_sent_at: null,
        })
        .eq("id", transferId);
      await call("transfer-fallback-reminder", "transfer-fallback-reminder", {});

      // 5. Seller relay stalled
      await supabase
        .from("order_transfers")
        .update({
          confirmed_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
          inbound_email_id: null,
          accept_link: null,
          seller_relay_reminder_sent_at: null,
        })
        .eq("id", transferId);
      await call("transfer-relay-stalled-reminder", "transfer-relay-stalled-reminder", {});

      // 6. Seller proof reminder — set accept_link_extracted_at >30min ago,
      // clear seller_reminder_sent_at, and ensure transfer_image_url is null
      // so the cron picks up our test row.
      await supabase
        .from("order_transfers")
        .update({
          accept_link_extracted_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          seller_reminder_sent_at: null,
          admin_escalation_sent_at: null,
          transfer_image_url: null,
          status: "pending",
        })
        .eq("id", transferId);
      await call("seller-proof-reminder", "seller-proof-reminder", {});

      // 7. Seller application email (synthetic)
      await call("send-transactional-email (seller_application)", "send-transactional-email", {
        type: "seller_application",
        to: buyerEmail,
        meta: {
          businessName: "[E2E TEST] Sample Business",
          firstName: "Test",
          lastName: "Runner",
          email: buyerEmail,
          phone: "+1 555 000 0000",
          isRegisteredCompany: "No",
          corporationNumber: "",
          taxCollectionNumber: "",
          status: "pending",
          sports: "MLB",
          resellerId: "00000000-0000-0000-0000-000000000000",
        },
      });

      return jsonResponse({ triggered: triggerLog });
    }

    // --- ACTION: assert ---
    // Looks at email_send_log over the last hour and classifies each
    // expected template as passed / failed / missing. "missing" means no
    // row exists yet (queue dispatcher may still be draining); "failed"
    // means a row exists but the send errored (dlq / failed / bounced).
    if (action === "assert") {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: rows } = await supabase
        .from("email_send_log")
        .select("template_name, recipient_email, status, error_message, created_at, message_id")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(500);

      const PASS_STATUSES = new Set(["sent", "pending"]);
      const FAIL_STATUSES = new Set(["dlq", "failed", "bounced", "complained", "suppressed"]);

      const summary = EXPECTED_TEMPLATES.map((tpl) => {
        const matches = (rows ?? []).filter((r) => r.template_name === tpl.name);
        const latest = matches[0];
        const status = latest?.status ?? "missing";
        const passed = !!latest && PASS_STATUSES.has(status);
        let reason: "passed" | "missing" | "failed" = "passed";
        let hint: string | null = null;
        if (!latest) {
          reason = "missing";
          hint = `No email_send_log row yet for ${tpl.name}. Trigger: ${tpl.trigger}.`;
        } else if (FAIL_STATUSES.has(status)) {
          reason = "failed";
          hint = latest.error_message
            ? `Send failed: ${latest.error_message.slice(0, 200)}`
            : `Send marked ${status} with no error message.`;
        }
        return {
          template: tpl.name,
          trigger: tpl.trigger,
          status,
          passed,
          reason,
          hint,
          recipient: latest?.recipient_email ?? null,
          error: latest?.error_message ?? null,
          loggedAt: latest?.created_at ?? null,
          // Full set of log rows found for this template (most recent first)
          logRows: matches.map((m) => ({
            recipient: m.recipient_email,
            status: m.status,
            messageId: m.message_id,
            loggedAt: m.created_at,
            error: m.error_message,
          })),
          rowCount: matches.length,
        };
      });

      const passCount = summary.filter((s) => s.passed).length;
      const missingCount = summary.filter((s) => s.reason === "missing").length;
      const failedCount = summary.filter((s) => s.reason === "failed").length;
      return jsonResponse({
        totalExpected: summary.length,
        passCount,
        failCount: summary.length - passCount,
        missingCount,
        failedCount,
        summary,
      });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (err) {
    console.error("[run-purchase-test] ERROR:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500
    );
  }
});
