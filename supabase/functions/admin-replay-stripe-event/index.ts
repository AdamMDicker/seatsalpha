import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const log = (step: string, details?: unknown) => {
  try {
    console.log(`[ADMIN-REPLAY] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
  } catch {
    console.log(`[ADMIN-REPLAY] ${step}`);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // --- Authenticate caller ---
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // --- Verify admin role server-side ---
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) {
      log("Non-admin replay attempt", { userId });
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Parse body ---
    const { stripe_event_id, force } = await req.json().catch(() => ({}));
    if (!stripe_event_id || typeof stripe_event_id !== "string") {
      return new Response(JSON.stringify({ error: "stripe_event_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const trimmedId = stripe_event_id.trim();
    if (!trimmedId.startsWith("evt_")) {
      return new Response(
        JSON.stringify({ error: "Invalid Stripe event id (must start with 'evt_')" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    log("Replay requested", { stripe_event_id: trimmedId, userId, force: !!force });

    // --- Fetch the Stripe event ---
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let event: Stripe.Event;
    try {
      event = await stripe.events.retrieve(trimmedId);
    } catch (err) {
      log("Failed to retrieve Stripe event", { error: String(err) });
      return new Response(
        JSON.stringify({ error: `Stripe event not found: ${String(err)}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (event.type !== "checkout.session.completed") {
      return new Response(
        JSON.stringify({
          error: `Only checkout.session.completed events can be replayed. This event is "${event.type}".`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- Idempotency check (allow override with `force`) ---
    const { data: existingOrder } = await adminClient
      .from("orders")
      .select("id, created_at")
      .eq("stripe_event_id", trimmedId)
      .maybeSingle();

    if (existingOrder && !force) {
      return new Response(
        JSON.stringify({
          ok: false,
          already_processed: true,
          order_id: existingOrder.id,
          message:
            "An order already exists for this event. Pass force=true to clear stripe_event_id and replay anyway.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (existingOrder && force) {
      // Detach the old stripe_event_id so the webhook idempotency check passes again.
      await adminClient
        .from("orders")
        .update({ stripe_event_id: `${trimmedId}_replay_${Date.now()}` })
        .eq("id", existingOrder.id);
      log("Force replay: detached previous order", { orderId: existingOrder.id });
    }

    // --- Re-invoke the stripe-webhook with a properly signed payload ---
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.stringify(event);
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;

    // Compute HMAC-SHA256 signature using Web Crypto
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(signedPayload));
    const sigHex = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const stripeSignature = `t=${timestamp},v1=${sigHex}`;

    const webhookUrl = `${supabaseUrl}/functions/v1/stripe-webhook`;
    const replayResp = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": stripeSignature,
      },
      body: payload,
    });
    const replayText = await replayResp.text();
    log("Replay completed", { status: replayResp.status, body: replayText.slice(0, 500) });

    let replayBody: unknown = replayText;
    try {
      replayBody = JSON.parse(replayText);
    } catch { /* keep raw */ }

    return new Response(
      JSON.stringify({
        ok: replayResp.ok,
        status: replayResp.status,
        event_type: event.type,
        event_id: event.id,
        replay_response: replayBody,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    log("Unhandled error", { error: String(err) });
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
