import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[CREATE-SELLER-CONNECT] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
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
    logStep("User authenticated", { userId: user.id });

    // Verify reseller
    const { data: reseller, error: rErr } = await supabaseClient
      .from("resellers")
      .select("id, status, is_suspended, stripe_connect_account_id, business_name, email")
      .eq("user_id", user.id)
      .eq("status", "live")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (rErr || !reseller) throw new Error("Not an approved reseller");
    if (reseller.is_suspended) throw new Error("Account is suspended");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const origin = req.headers.get("origin") || "https://seats.ca";

    // If they already have a Connect account, create a new account link
    if (reseller.stripe_connect_account_id) {
      const accountLink = await stripe.accountLinks.create({
        account: reseller.stripe_connect_account_id,
        refresh_url: `${origin}/reseller?connect=refresh`,
        return_url: `${origin}/reseller?connect=success`,
        type: "account_onboarding",
      });
      logStep("Created account link for existing account", { accountId: reseller.stripe_connect_account_id });
      return new Response(JSON.stringify({ url: accountLink.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Create new Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "CA",
      email: reseller.email || user.email,
      business_type: "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        reseller_id: reseller.id,
        user_id: user.id,
      },
    });

    // Store account ID
    await supabaseClient
      .from("resellers")
      .update({ stripe_connect_account_id: account.id })
      .eq("id", reseller.id);

    logStep("Created Connect account", { accountId: account.id });

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/reseller?connect=refresh`,
      return_url: `${origin}/reseller?connect=success`,
      type: "account_onboarding",
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
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
