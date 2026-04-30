import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !data?.user?.email) throw new Error("User not authenticated");
    const user = data.user;

    // Parse optional ticket info from body
    let ticketInfo = null;
    try {
      const body = await req.json();
      if (body && body.ticketAmount) {
        ticketInfo = body;
      }
    } catch {
      // No body or invalid JSON — membership-only checkout
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Build line items: always include membership subscription
    const lineItems: any[] = [
      {
        price: "price_1TRE2cBgGwQ8YCQeKeM8skAM",
        quantity: 1,
      },
    ];

    // If ticket info provided, add ticket as a one-time line item
    const ticketQty = ticketInfo?.quantity || 1;
    if (ticketInfo) {
      // Format date for display
      let formattedEventDate = "";
      if (ticketInfo.eventDate) {
        try {
          const d = new Date(ticketInfo.eventDate);
          if (!isNaN(d.getTime())) {
            const fmt = new Intl.DateTimeFormat("en-US", {
              timeZone: "America/Toronto",
              weekday: "short", month: "short", day: "numeric", year: "numeric",
              hour: "numeric", minute: "2-digit", hour12: true,
            });
            const parts = fmt.formatToParts(d);
            const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
            formattedEventDate = `${get("weekday")}, ${get("month")} ${get("day")}, ${get("year")} · ${get("hour")}:${get("minute")} ${get("dayPeriod")} ET`;
          }
        } catch { /* fallback */ }
      }

      const descParts = [
        ticketInfo.tier,
        ticketInfo.venue ? `at ${ticketInfo.venue}` : null,
        formattedEventDate || null,
      ].filter(Boolean).join(" · ");

      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: ticketInfo.eventTitle || "Event Ticket",
            description: descParts || undefined,
          },
          unit_amount: Math.round((ticketInfo.ticketAmount / ticketQty) * 100),
        },
        quantity: ticketQty,
      });
    }

    const successUrl = ticketInfo?.venue
      ? `${req.headers.get("origin")}/payment-success?venue=${encodeURIComponent(ticketInfo.venue)}&event=${encodeURIComponent(ticketInfo.eventTitle || "")}&tier=${encodeURIComponent(ticketInfo.tier || "")}&date=${encodeURIComponent(ticketInfo.eventDate || "")}&qty=${encodeURIComponent(String(ticketQty))}`
      : `${req.headers.get("origin")}/membership?success=true`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "subscription",
      success_url: successUrl,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
      subscription_data: {
        description: ticketInfo ? "Seats.ca Membership + Ticket" : "Seats.ca Annual Membership",
      },
      ...(ticketInfo ? {
        metadata: {
          event_title: ticketInfo.eventTitle || "",
          ticket_quantity: String(ticketQty),
          ticket_tier: ticketInfo.tier || "",
          venue: ticketInfo.venue || "",
          event_date: ticketInfo.eventDate || "",
          ticket_id: ticketInfo.ticketId || "",
          service_fee: "0",
          ticket_unit_price: String(ticketInfo.ticketAmount / ticketQty),
          membership_amount: "59.99",
        },
      } : {}),
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("create-checkout error:", (error instanceof Error ? error.message : String(error)), error);
    return new Response(JSON.stringify({ error: (error instanceof Error ? error.message : String(error)) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
