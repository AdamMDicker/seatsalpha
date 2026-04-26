import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    const { eventTitle, totalAmount, quantity, tier, uberAdded, hotelAdded, flightAdded, serviceFee, venue, eventDate, ticketId } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Format date for Stripe display (human-readable EST)
    let formattedEventDate = "";
    if (eventDate) {
      try {
        const d = new Date(eventDate);
        if (!isNaN(d.getTime())) {
          // Manual formatting for Deno compatibility
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          // Convert to EST/EDT (UTC-5 / UTC-4)
          const estOffset = -5 * 60;
          const utc = d.getTime() + d.getTimezoneOffset() * 60000;
          const est = new Date(utc + estOffset * 60000);
          const day = days[est.getDay()];
          const month = months[est.getMonth()];
          const date = est.getDate();
          const year = est.getFullYear();
          let hours = est.getHours();
          const minutes = est.getMinutes().toString().padStart(2, "0");
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12 || 12;
          formattedEventDate = `${day}, ${month} ${date}, ${year} · ${hours}:${minutes} ${ampm} ET`;
        }
      } catch { /* fallback: leave empty */ }
    }

    // Build description with game details for Stripe dashboard/receipts
    const descriptionParts = [
      tier,
      venue ? `at ${venue}` : null,
      formattedEventDate || null,
    ].filter(Boolean).join(" · ");

    // Use per-ticket price so Stripe receipt shows correct quantity
    const perTicketPrice = quantity > 0 ? Math.round((totalAmount / quantity) * 100) : Math.round(totalAmount * 100);

    const lineItems: any[] = [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: eventTitle,
            description: descriptionParts || undefined,
          },
          unit_amount: perTicketPrice,
        },
        quantity: quantity || 1,
      },
    ];

    // Add service fee line item for non-members
    if (serviceFee && serviceFee > 0) {
      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
             name: "LCC (13%)",
           },
          unit_amount: Math.round(serviceFee * 100),
        },
        quantity: 1,
      });
    }

    // Build a short statement descriptor suffix (max 22 chars)
    const city = venue ? venue.split(",").pop()?.trim()?.slice(0, 10) : "";
    const stmtSuffix = city ? `${city} Tickets` : "SEATS.CA TICKETS";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      payment_intent_data: {
        description: `${eventTitle} — ${descriptionParts}`,
        statement_descriptor_suffix: stmtSuffix.slice(0, 22),
      },
      success_url: `${req.headers.get("origin")}/payment-success?venue=${encodeURIComponent(venue || "")}&event=${encodeURIComponent(eventTitle || "")}&tier=${encodeURIComponent(tier || "")}&date=${encodeURIComponent(eventDate || "")}&qty=${encodeURIComponent(String(quantity || 1))}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
      metadata: {
        event_title: eventTitle,
        ticket_quantity: String(quantity),
        ticket_tier: tier,
        uber_added: String(uberAdded || false),
        hotel_added: String(hotelAdded || false),
        flight_added: String(flightAdded || false),
        ticket_id: ticketId || "",
        venue: venue || "",
        event_date: eventDate || "",
        service_fee: serviceFee ? String(serviceFee) : "0",
        ticket_unit_price: String(totalAmount / (quantity || 1)),
        membership_amount: "0",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("create-payment error:", error.message, error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
