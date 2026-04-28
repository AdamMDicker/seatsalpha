import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Hardcoded promo price ID — $99.99 CAD one-time (regular $199.99, 50% off)
const SIGNUP_FEE_PRICE_ID = "price_1TRE2dBgGwQ8YCQeC7oD4S6s";

const logStep = (step: string, details?: unknown) => {
  console.log(`[CREATE-SELLER-SIGNUP-FEE] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("Not authenticated");
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Verify user is an approved reseller with signed agreement
    const { data: reseller, error: rErr } = await supabaseClient
      .from("resellers")
      .select("id, status, agreement_accepted_at, is_suspended, signup_fee_paid_at, stripe_customer_id")
      .eq("user_id", user.id)
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (rErr || !reseller) throw new Error("Not an approved reseller");
    if (!reseller.agreement_accepted_at) throw new Error("Agreement not signed");
    if (reseller.is_suspended) throw new Error("Account is suspended");
    if (reseller.signup_fee_paid_at) throw new Error("Sign-up fee already paid");
    logStep("Reseller verified", { resellerId: reseller.id });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const priceId = SIGNUP_FEE_PRICE_ID;
    logStep("Using hardcoded signup fee price ID", { priceId });

    // Get or create Stripe customer
    let customerId = reseller.stripe_customer_id;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: user.email });
        customerId = customer.id;
      }
      await supabaseClient
        .from("resellers")
        .update({ stripe_customer_id: customerId })
        .eq("id", reseller.id);
      logStep("Stored Stripe customer", { customerId });
    }

    const origin = req.headers.get("origin") || "https://seats.ca";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/reseller?signup_fee=success`,
      cancel_url: `${origin}/reseller?signup_fee=canceled`,
      metadata: {
        reseller_id: reseller.id,
        user_id: user.id,
        type: "seller_signup_fee",
      },
      payment_intent_data: {
        statement_descriptor_suffix: "SELLER SIGNUP",
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
