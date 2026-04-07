import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[SELLER-PREAUTH] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    if (!userData.user) throw new Error("Not authenticated");

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin access required");

    const { reseller_id, amount_cents = 50000 } = await req.json(); // default $500
    if (!reseller_id) throw new Error("reseller_id required");

    logStep("Pre-auth requested", { reseller_id, amount_cents });

    // Get reseller's stripe_customer_id
    const { data: reseller } = await supabase
      .from("resellers")
      .select("stripe_customer_id, user_id, business_name")
      .eq("id", reseller_id)
      .single();

    if (!reseller?.stripe_customer_id) {
      throw new Error("Reseller has no payment method on file");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get the customer's default payment method
    const customer = await stripe.customers.retrieve(reseller.stripe_customer_id);
    if (customer.deleted) throw new Error("Stripe customer deleted");

    const paymentMethodId =
      (customer as Stripe.Customer).invoice_settings?.default_payment_method as string | null;

    if (!paymentMethodId) {
      // Try to get from subscriptions
      const subs = await stripe.subscriptions.list({
        customer: reseller.stripe_customer_id,
        limit: 1,
      });
      if (subs.data.length === 0 || !subs.data[0].default_payment_method) {
        throw new Error("No payment method found for this seller");
      }
    }

    // Create a pre-auth hold (manual capture)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: "cad",
      customer: reseller.stripe_customer_id,
      capture_method: "manual",
      confirm: true,
      payment_method: paymentMethodId || undefined,
      description: `Pre-authorization hold for seller: ${reseller.business_name}`,
      metadata: {
        reseller_id,
        type: "complaint_hold",
      },
      off_session: true,
    });

    logStep("Pre-auth hold created", {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: amount_cents,
    });

    // Notify the seller
    await supabase.from("notifications").insert({
      user_id: reseller.user_id,
      type: "seller",
      title: "Payment Hold Placed",
      body: `A $${(amount_cents / 100).toFixed(2)} CAD hold has been placed on your card due to a complaint. Please contact support for details.`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        payment_intent_id: paymentIntent.id,
        status: paymentIntent.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
