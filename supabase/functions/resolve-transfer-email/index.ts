import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarding-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify shared secret
  const forwardingSecret = Deno.env.get("TRANSFER_FORWARDING_SECRET");
  const providedSecret = req.headers.get("x-forwarding-secret");

  if (!forwardingSecret || providedSecret !== forwardingSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { alias } = await req.json();
  if (!alias || typeof alias !== "string") {
    return new Response(JSON.stringify({ error: "Missing alias parameter" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  // Look up the transfer by alias
  const { data: transfer, error: transferError } = await supabase
    .from("order_transfers")
    .select("order_id")
    .eq("transfer_email_alias", alias)
    .single();

  if (transferError || !transfer) {
    return new Response(JSON.stringify({ error: "Alias not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get buyer from order
  const { data: order } = await supabase
    .from("orders")
    .select("user_id")
    .eq("id", transfer.order_id)
    .single();

  if (!order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get buyer email from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("user_id", order.user_id)
    .single();

  if (!profile?.email) {
    return new Response(JSON.stringify({ error: "Buyer email not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ email: profile.email }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
