import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SELLER_WEEKLY_PRICE_ID_KEY = "seller_weekly_price_id";

const logStep = (step: string, details?: unknown) => {
  console.log(`[CREATE-SELLER-CHECKOUT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
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
      .select("id, status, agreement_accepted_at, is_suspended, stripe_customer_id")
      .eq("user_id", user.id)
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (rErr || !reseller) throw new Error("Not an approved reseller");
    if (!reseller.agreement_accepted_at) throw new Error("Agreement not signed");
    if (reseller.is_suspended) throw new Error("Account is suspended");
    logStep("Reseller verified", { resellerId: reseller.id });

    // Check if already has active subscription
    const { data: existingSub } = await supabaseClient
      .from("seller_subscriptions")
      .select("status")
      .eq("reseller_id", reseller.id)
      .single();

    if (existingSub?.status === "active") {
      throw new Error("Already has active subscription");
    }

    // Parse request body for optional discount code
    let discountCode: string | null = null;
    try {
      const body = await req.json();
      discountCode = body.discount_code?.trim()?.toUpperCase() || null;
    } catch { /* no body */ }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get or create the weekly price
    let priceId: string | null = null;

    // Check site_settings for cached price ID
    const { data: setting } = await supabaseClient
      .from("site_settings")
      .select("value")
      .eq("key", SELLER_WEEKLY_PRICE_ID_KEY)
      .single();

    if (setting?.value) {
      priceId = setting.value;
      logStep("Using cached price ID", { priceId });
    } else {
      // Create product + price in Stripe
      const product = await stripe.products.create({
        name: "Seller Membership",
        description: "Weekly seller membership fee for seats.ca marketplace",
      });
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 100, // $1.00
        currency: "cad",
        recurring: { interval: "week" },
      });
      priceId = price.id;
      logStep("Created Stripe price", { priceId, productId: product.id });

      // Cache it
      await supabaseClient.from("site_settings").upsert({
        key: SELLER_WEEKLY_PRICE_ID_KEY,
        value: priceId,
      });
    }

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
      // Store on reseller record
      await supabaseClient
        .from("resellers")
        .update({ stripe_customer_id: customerId })
        .eq("id", reseller.id);
      logStep("Stored Stripe customer", { customerId });
    }

    // Validate discount code if provided
    let stripeCouponId: string | undefined;
    if (discountCode) {
      const { data: code } = await supabaseClient
        .from("seller_discount_codes")
        .select("id, code, is_active")
        .eq("code", discountCode)
        .eq("is_active", true)
        .single();

      if (!code) throw new Error("Invalid or expired discount code");

      // Create a 100% off forever coupon in Stripe (idempotent by code name)
      try {
        const coupon = await stripe.coupons.create({
          id: `SELLER_WAIVER_${discountCode}`,
          percent_off: 100,
          duration: "forever",
          name: `Seller Fee Waiver - ${discountCode}`,
        });
        stripeCouponId = coupon.id;
      } catch {
        // Coupon might already exist
        stripeCouponId = `SELLER_WAIVER_${discountCode}`;
      }
      logStep("Discount code validated", { discountCode, stripeCouponId });
    }

    const origin = req.headers.get("origin") || "https://seats.ca";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/reseller?subscription=success`,
      cancel_url: `${origin}/reseller?subscription=canceled`,
      metadata: {
        reseller_id: reseller.id,
        user_id: user.id,
        discount_code: discountCode || "",
      },
      subscription_data: {
        description: "Seats.ca Seller Weekly Membership",
      },
    };

    if (stripeCouponId) {
      sessionParams.discounts = [{ coupon: stripeCouponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
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
