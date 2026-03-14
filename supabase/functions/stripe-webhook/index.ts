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

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = `noreply@${SENDER_DOMAIN}`;

// --- Email HTML builders ---

function buyerEmailHtml(meta: {
  eventTitle: string;
  venue: string;
  eventDate: string;
  tier: string;
  quantity: string;
  totalAmount: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#d6193d,#b81535);padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🎟️ Order Confirmed</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Thank you for your purchase on seats.ca</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <h2 style="margin:0 0 20px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    ${meta.eventDate ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;width:120px;">Date</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.eventDate}</td></tr>` : ""}
    ${meta.venue ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Venue</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.venue}</td></tr>` : ""}
    ${meta.tier ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Seats</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.tier}</td></tr>` : ""}
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Quantity</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.quantity}</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fa;border-radius:8px;">
    <tr><td style="padding:16px;">
      <table width="100%"><tr>
        <td style="color:#71717a;font-size:14px;">Total Paid</td>
        <td align="right" style="color:#18181b;font-size:22px;font-weight:800;">$${meta.totalAmount} CAD</td>
      </tr></table>
    </td></tr>
  </table>
  <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    Your tickets will be delivered to your email before the event. If you have any questions, contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a>.
  </p>
</td></tr>
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} seats.ca — All rights reserved.</p>
  <p style="margin:4px 0 0;color:#a1a1aa;font-size:11px;">All sales are final. Please review our <a href="https://seats.ca/terms" style="color:#d6193d;text-decoration:none;">Terms of Service</a>.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function sellerEmailHtml(meta: {
  eventTitle: string;
  venue: string;
  eventDate: string;
  section: string;
  rowName: string;
  salePrice: string;
  buyerEmail: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">💰 Ticket Sold!</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Great news — one of your listings has been purchased</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <h2 style="margin:0 0 20px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    ${meta.eventDate ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;width:120px;">Date</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.eventDate}</td></tr>` : ""}
    ${meta.venue ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Venue</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.venue}</td></tr>` : ""}
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Section</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.section}${meta.rowName ? ` · Row ${meta.rowName}` : ""}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Buyer</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.buyerEmail}</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-radius:8px;">
    <tr><td style="padding:16px;">
      <table width="100%"><tr>
        <td style="color:#047857;font-size:14px;">Sale Price</td>
        <td align="right" style="color:#047857;font-size:22px;font-weight:800;">$${meta.salePrice} CAD</td>
      </tr></table>
    </td></tr>
  </table>
  <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    Please ensure the tickets are delivered promptly. Contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a> with any questions.
  </p>
</td></tr>
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} seats.ca — All rights reserved.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// --- Helper to enqueue an email ---
async function enqueueEmail(to: string, subject: string, html: string, label: string) {
  const messageId = crypto.randomUUID();
  const { error } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to,
      from: FROM_EMAIL,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      purpose: "transactional",
      label,
      queued_at: new Date().toISOString(),
    },
  });
  if (error) {
    console.error(`Failed to enqueue ${label} email to ${to}:`, error);
  } else {
    console.log(`Enqueued ${label} email to ${to} (${messageId})`);
  }
}

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

    // --- BUYER NOTIFICATION + EMAIL ---
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

      // In-app notification
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

      // Email confirmation
      if (customerEmail) {
        await enqueueEmail(
          customerEmail,
          `Order Confirmed — ${eventTitle}`,
          buyerEmailHtml({ eventTitle, venue, eventDate, tier, quantity, totalAmount }),
          "buyer-confirmation"
        );
      }
    }

    // --- SELLER NOTIFICATION + EMAIL ---
    if (meta.ticket_id) {
      const { data: ticket } = await supabase
        .from("tickets")
        .select("seller_id, section, row_name, seat_number, price, event_id")
        .eq("id", meta.ticket_id)
        .single();

      if (ticket?.seller_id) {
        // seller_id on tickets stores the reseller's user_id, not the reseller table id
        const { data: reseller } = await supabase
          .from("resellers")
          .select("user_id, business_name, email")
          .eq("user_id", ticket.seller_id)
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

          // In-app notification
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

          // Email notification to seller
          const sellerEmail = reseller.email;
          if (sellerEmail) {
            // Look up seller's auth email if reseller email not set
            await enqueueEmail(
              sellerEmail,
              `Ticket Sold — ${eventTitle}`,
              sellerEmailHtml({
                eventTitle,
                venue,
                eventDate,
                section: ticket.section,
                rowName: ticket.row_name || "",
                salePrice: ticket.price.toFixed(2),
                buyerEmail: customerEmail,
              }),
              "seller-notification"
            );
          } else {
            // Fallback: get email from auth user
            const { data: sellerAuthUsers } = await supabase.auth.admin.listUsers();
            const sellerUser = sellerAuthUsers?.users?.find((u) => u.id === reseller.user_id);
            if (sellerUser?.email) {
              await enqueueEmail(
                sellerUser.email,
                `Ticket Sold — ${eventTitle}`,
                sellerEmailHtml({
                  eventTitle,
                  venue,
                  eventDate,
                  section: ticket.section,
                  rowName: ticket.row_name || "",
                  salePrice: ticket.price.toFixed(2),
                  buyerEmail: customerEmail,
                }),
                "seller-notification"
              );
            }
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
