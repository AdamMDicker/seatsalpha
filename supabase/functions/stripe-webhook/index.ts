import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event: Stripe.Event;
  try {
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};
    const customerEmail = session.customer_email || session.customer_details?.email || "";

    // Only process ticket purchases (not membership-only)
    if (!meta.event_title) {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const eventTitle = meta.event_title || "Event";
    const tier = meta.ticket_tier || "";
    const quantity = meta.ticket_quantity || "1";
    const venue = meta.venue || "";
    const eventDate = meta.event_date || "";
    const totalAmount = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";

    // Find buyer by email
    const { data: buyerUsers } = await supabase.auth.admin.listUsers();
    const buyer = buyerUsers?.users?.find((u) => u.email === customerEmail);

    // --- BUYER NOTIFICATION ---
    if (buyer) {
      const buyerBody = [
        `Thank you for your purchase! Your order has been confirmed.`,
        ``,
        `Event: ${eventTitle}`,
        venue ? `Venue: ${venue}` : null,
        eventDate ? `Date: ${eventDate}` : null,
        tier ? `Seats: ${tier}` : null,
        `Quantity: ${quantity}`,
        `Total: $${totalAmount} CAD`,
        ``,
        `Your tickets will be delivered to your email before the event. If you have any questions, please contact us at support@seats.ca.`,
        ``,
        `Thank you for choosing seats.ca!`,
      ].filter(Boolean).join("\n");

      await supabase.from("notifications").insert({
        user_id: buyer.id,
        type: "purchase_buyer",
        title: `Order Confirmed — ${eventTitle}`,
        body: buyerBody,
        metadata: {
          event_title: eventTitle,
          tier,
          quantity,
          venue,
          event_date: eventDate,
          total_amount: totalAmount,
        },
      });
    }

    // --- SELLER NOTIFICATION ---
    // Find the ticket and its seller
    if (meta.ticket_id) {
      const { data: ticket } = await supabase
        .from("tickets")
        .select("seller_id, section, row_name, seat_number, price, event_id")
        .eq("id", meta.ticket_id)
        .single();

      if (ticket?.seller_id) {
        // Find the reseller's user_id
        const { data: reseller } = await supabase
          .from("resellers")
          .select("user_id, business_name")
          .eq("id", ticket.seller_id)
          .single();

        if (reseller) {
          const sellerBody = [
            `Great news! One of your tickets has been sold.`,
            ``,
            `Event: ${eventTitle}`,
            venue ? `Venue: ${venue}` : null,
            eventDate ? `Date: ${eventDate}` : null,
            `Section: ${ticket.section}`,
            ticket.row_name ? `Row: ${ticket.row_name}` : null,
            `Sale Price: $${ticket.price.toFixed(2)} CAD`,
            `Buyer: ${customerEmail}`,
            ``,
            `Please ensure the tickets are delivered promptly. Thank you for selling on seats.ca!`,
          ].filter(Boolean).join("\n");

          await supabase.from("notifications").insert({
            user_id: reseller.user_id,
            type: "purchase_seller",
            title: `Ticket Sold — ${eventTitle}`,
            body: sellerBody,
            metadata: {
              event_title: eventTitle,
              tier: `Section ${ticket.section}${ticket.row_name ? ` Row ${ticket.row_name}` : ""}`,
              venue,
              event_date: eventDate,
              total_amount: ticket.price.toFixed(2),
              buyer_email: customerEmail,
            },
          });
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
