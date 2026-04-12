import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const SENDER_DOMAIN = "seats.ca";
const FROM_EMAIL = `noreply@${SENDER_DOMAIN}`;
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png";

// --- Date formatting helper ---
function formatEventDateET(raw: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
    return `${day}, ${month} ${date}, ${year} · ${hours}:${minutes} ${ampm} ET`;
  } catch {
    return raw;
  }
}

function shortDateForSubject(raw: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const estOffset = -5 * 60;
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const est = new Date(utc + estOffset * 60000);
    return `${months[est.getMonth()]} ${est.getDate()}`;
  } catch {
    return "";
  }
}

// --- Email HTML builders ---

function buyerEmailHtml(meta: {
  eventTitle: string;
  venue: string;
  eventDate: string;
  formattedDate: string;
  tier: string;
  quantity: string;
  ticketSubtotal: string;
  hstAmount: string;
  membershipAmount: string;
  totalAmount: string;
}): string {
  const hasHst = meta.hstAmount && parseFloat(meta.hstAmount) > 0;
  const hasMembership = meta.membershipAmount && parseFloat(meta.membershipAmount) > 0;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="padding:28px 40px 0;text-align:center;">
  <img src="${LOGO_URL}" alt="seats.ca" width="300" height="300" style="display:block;margin:0 auto;width:300px;height:300px;" />
</td></tr>
<tr><td style="background:linear-gradient(135deg,#d6193d,#b81535);padding:28px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🎟️ Order Confirmed</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Thank you for your purchase on seats.ca</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <h2 style="margin:0 0 20px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    ${meta.formattedDate ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;width:120px;">Date</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.formattedDate}</td></tr>` : ""}
    ${meta.venue ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Venue</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.venue}</td></tr>` : ""}
    ${meta.tier ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Seats</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.tier}</td></tr>` : ""}
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Quantity</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.quantity}</td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fa;border-radius:8px;">
    <tr><td style="padding:16px;">
      <table width="100%">
        <tr>
          <td style="color:#71717a;font-size:13px;padding:4px 0;">Tickets</td>
          <td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.ticketSubtotal} CAD</td>
        </tr>
        ${hasHst ? `<tr>
          <td style="color:#71717a;font-size:13px;padding:4px 0;">LCC (13%)</td>
          <td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.hstAmount} CAD</td>
        </tr>` : ""}
        ${hasMembership ? `<tr>
          <td style="color:#71717a;font-size:13px;padding:4px 0;">Annual Membership</td>
          <td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.membershipAmount} CAD</td>
        </tr>` : ""}
        <tr>
          <td style="color:#71717a;font-size:14px;padding:8px 0 0;border-top:1px solid #e0e0e0;">Total Paid</td>
          <td align="right" style="color:#18181b;font-size:22px;font-weight:800;padding:8px 0 0;border-top:1px solid #e0e0e0;">$${meta.totalAmount} CAD</td>
        </tr>
      </table>
    </td></tr>
  </table>
  <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    Your tickets will be delivered to your email 48 hours before the event. If you have any questions, contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a>.
  </p>
</td></tr>
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} seats.ca — Canada's No-Fee Ticket Platform</p>
  <p style="margin:4px 0 0;color:#a1a1aa;font-size:11px;">All sales are final. Please review our <a href="https://seats.ca/terms" style="color:#d6193d;text-decoration:none;">Terms of Service</a>.</p>
</td></tr>
<tr><td style="padding:16px 40px;text-align:center;background:#FEF9E7;border-top:1px solid #D4AC0D;">
  <p style="margin:0;color:#7C6F1B;font-size:11px;line-height:1.5;">⚠️ If you don't see future emails from us, check your <strong>Spam</strong> or <strong>Junk</strong> folder and mark <strong>noreply@seats.ca</strong> as a safe sender.</p>
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
  formattedDate: string;
  section: string;
  rowName: string;
  salePrice: string;
  quantity: string;
  orderRef: string;
  transferEmail?: string;
}): string {
  const qty = parseInt(meta.quantity) || 1;
  const pricePerTicket = parseFloat(meta.salePrice) || 0;
  const totalSale = (qty * pricePerTicket).toFixed(2);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="padding:28px 40px 0;text-align:center;">
  <img src="${LOGO_URL}" alt="seats.ca" width="300" height="300" style="display:block;margin:0 auto;width:300px;height:300px;" />
</td></tr>
<tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:28px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">💰 Ticket Sold!</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Great news — one of your listings has been purchased</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <h2 style="margin:0 0 20px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    ${meta.formattedDate ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;width:120px;">Date</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.formattedDate}</td></tr>` : ""}
    ${meta.venue ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Venue</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.venue}</td></tr>` : ""}
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Section</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.section}${meta.rowName ? ` · Row ${meta.rowName}` : ""}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Quantity</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.quantity}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Order Ref</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.orderRef}</td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-radius:8px;">
    <tr><td style="padding:16px;">
      <table width="100%">
        <tr>
          <td style="color:#047857;font-size:13px;padding:4px 0;">Price Per Ticket</td>
          <td align="right" style="color:#047857;font-size:14px;font-weight:600;padding:4px 0;">$${meta.salePrice} CAD</td>
        </tr>
        <tr>
          <td style="color:#047857;font-size:14px;padding:8px 0 0;border-top:1px solid #a7f3d0;">Total Sale (${meta.quantity} ticket${qty > 1 ? "s" : ""})</td>
          <td align="right" style="color:#047857;font-size:22px;font-weight:800;padding:8px 0 0;border-top:1px solid #a7f3d0;">$${totalSale} CAD</td>
        </tr>
      </table>
    </td></tr>
  </table>

  ${meta.transferEmail ? `
  <!-- Transfer Email -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#eff6ff;border-radius:8px;border:1px solid #93c5fd;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:700;">📧 Transfer Email Address</p>
      <p style="margin:0;color:#1e3a8a;font-size:16px;font-weight:700;font-family:'Courier New',monospace;background:#dbeafe;padding:10px 14px;border-radius:6px;letter-spacing:0.5px;">${meta.transferEmail}</p>
      <p style="margin:8px 0 0;color:#3b82f6;font-size:12px;line-height:1.5;">Transfer your tickets to this email address on Ticketmaster (or your ticket platform).</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;background:#dbeafe;border-radius:6px;">
        <tr><td style="padding:10px 14px;">
          <p style="margin:0 0 4px;color:#1e40af;font-size:12px;font-weight:700;">👤 Recipient Name (for Ticketmaster)</p>
          <p style="margin:0;color:#1e3a8a;font-size:15px;font-weight:700;">First Name: <span style="font-family:'Courier New',monospace;">Seats</span> &nbsp;|&nbsp; Last Name: <span style="font-family:'Courier New',monospace;">${meta.orderRef}</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  ` : ""}

  <!-- Step-by-step transfer guide -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#fef3c7;border-radius:8px;border:1px solid #fbbf24;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 12px;color:#92400e;font-size:14px;font-weight:700;">📤 How to Complete Your Transfer</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color:#92400e;font-size:12px;line-height:2;padding:0;">
          <strong>1.</strong> Log in to your <a href="https://seats.ca/reseller-dashboard?tab=transfers" style="color:#d6193d;text-decoration:none;font-weight:600;">Seats.ca Seller Portal</a><br>
          <strong>2.</strong> Go to the <strong>Transfers</strong> tab<br>
          <strong>3.</strong> Locate this sale (Order Ref: ${meta.orderRef})<br>
          <strong>4.</strong> Transfer your tickets to the email shown above via Ticketmaster (or your platform)<br>
          <strong>5.</strong> Take a screenshot of the completed transfer<br>
          <strong>6.</strong> Upload the screenshot to confirm delivery
        </td></tr>
      </table>
    </td></tr>
  </table>

  <!-- CTA Button -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
    <tr><td align="center">
      <a href="https://seats.ca/reseller-dashboard?tab=transfers" style="display:inline-block;background:linear-gradient(135deg,#059669,#047857);color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">View Transfer in Seller Portal →</a>
    </td></tr>
  </table>

  <p style="margin:24px 0 0;color:#18181b;font-size:13px;line-height:1.6;font-weight:600;">
    Tickets must be delivered within, at least, 48 hours before the event.
  </p>

  <!-- Penalty & payment terms -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#fef2f2;border-radius:8px;border:1px solid #fca5a5;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 10px;color:#991b1b;font-size:12px;line-height:1.5;">
        ⚠️ Please ensure that your ticket transfer is for the noted event and seats. Ticket transfer errors are subject to Seats.ca Terms and Conditions.
      </p>
      <p style="margin:0;color:#991b1b;font-size:12px;line-height:1.5;">
        💳 Seller payments are contingent on properly transferred tickets and occur two weeks after the event. In the event of any ticket transfer errors, Seats.ca reserves the right to withhold payment to facilitate any buyer issues/complaints.
      </p>
    </td></tr>
  </table>

  <p style="margin:16px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    Questions? Contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a>.
  </p>
</td></tr>
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} seats.ca — Canada's No-Fee Ticket Platform</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// --- Helper to enqueue an email ---
async function enqueueEmail(to: string, subject: string, html: string, label: string, opts?: { fromName?: string; replyTo?: string }) {
  const messageId = crypto.randomUUID();
  const text = subject;
  const displayName = opts?.fromName || "seats.ca";
  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: label,
    recipient_email: to,
    status: "pending",
  });
  const { error } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to,
      from: `${displayName} <${FROM_EMAIL}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label,
      queued_at: new Date().toISOString(),
      ...(opts?.replyTo ? { reply_to: opts.replyTo } : {}),
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

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500 });
  }
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};
    const customerEmail = session.customer_email || session.customer_details?.email || "";

    // Handle seller signup fee payment
    if (meta.type === "seller_signup_fee" && meta.reseller_id) {
      await supabase
        .from("resellers")
        .update({ signup_fee_paid_at: new Date().toISOString() })
        .eq("id", meta.reseller_id);

      if (meta.user_id) {
        await supabase.from("notifications").insert({
          user_id: meta.user_id,
          type: "seller",
          title: "Sign-Up Fee Paid",
          body: "Your $100 seller sign-up fee has been processed. You can now set up your weekly membership.",
        });
      }
      console.log(`Seller signup fee paid for reseller ${meta.reseller_id}`);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

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

    // Format the date
    const formattedDate = formatEventDateET(eventDate);
    const shortDate = shortDateForSubject(eventDate);
    const subjectSuffix = shortDate ? ` · ${shortDate}` : "";

    // Parse breakdown amounts from metadata
    const serviceFeeAmount = meta.service_fee ? parseFloat(meta.service_fee).toFixed(2) : "0.00";
    const membershipAmount = meta.membership_amount ? parseFloat(meta.membership_amount).toFixed(2) : "0.00";
    const ticketUnitPrice = meta.ticket_unit_price ? parseFloat(meta.ticket_unit_price) : 0;
    const ticketSubtotal = ticketUnitPrice > 0
      ? (ticketUnitPrice * parseInt(quantity)).toFixed(2)
      : (parseFloat(totalAmount) - parseFloat(serviceFeeAmount) - parseFloat(membershipAmount)).toFixed(2);

    // Find buyer by email (efficient single-user lookup)
    let buyer: { id: string; email: string } | null = null;
    if (customerEmail) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, email")
        .eq("email", customerEmail)
        .maybeSingle();
      if (profileData) {
        buyer = { id: profileData.user_id, email: profileData.email || customerEmail };
      }
    }

    // --- CREATE ORDER RECORD ---
    let orderId: string | null = null;
    if (buyer) {
      const feesAmount = parseFloat(serviceFeeAmount) || 0;
      const isFeeWaived = feesAmount === 0;
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: buyer.id,
          total_amount: parseFloat(totalAmount),
          fees_amount: feesAmount,
          is_fee_waived: isFeeWaived,
          status: "completed",
        })
        .select("id")
        .single();

      if (orderError) {
        console.error("Failed to create order:", orderError);
      } else {
        orderId = orderData.id;
        console.log(`Created order ${orderId} for user ${buyer.id}`);

        // Create order item if we have a ticket_id
        if (meta.ticket_id) {
          const { error: itemError } = await supabase
            .from("order_items")
            .insert({
              order_id: orderId,
              ticket_id: meta.ticket_id,
              quantity: parseInt(quantity) || 1,
              unit_price: ticketUnitPrice || parseFloat(totalAmount),
            });
          if (itemError) {
            console.error("Failed to create order item:", itemError);
          }

          // Create pending order_transfer for seller to upload proof
          // For admin-listed tickets (seller_id is null), assign to admin user
          const { data: ticketForTransfer } = await supabase
            .from("tickets")
            .select("seller_id")
            .eq("id", meta.ticket_id)
            .single();

          if (orderId) {
            const ADMIN_USER_ID = "8904900d-db33-4f03-bdb1-ca4d5b6dfa8f";
            const effectiveSellerId = ticketForTransfer?.seller_id || ADMIN_USER_ID;
            // Ticketmaster requires letters only — no digits allowed in email addresses
            const letters = "abcdefghijklmnopqrstuvwxyz";
            let aliasRef = "";
            for (let i = 0; i < 10; i++) {
              aliasRef += letters[Math.floor(Math.random() * 26)];
            }
            const transferEmailAlias = `order-${aliasRef}@inbound.seats.ca`;

            await supabase.from("order_transfers").insert({
              order_id: orderId,
              ticket_id: meta.ticket_id,
              seller_id: effectiveSellerId,
              status: "pending",
              transfer_email_alias: transferEmailAlias,
            });
            console.log(`Created pending order_transfer for order ${orderId}, seller: ${effectiveSellerId}, alias: ${transferEmailAlias}`);
          }
        }
      }
    }

    // --- BUYER NOTIFICATION + EMAIL ---
    if (buyer) {
      const buyerBody = [
        `Thank you for your purchase! Your order has been confirmed.`,
        ``,
        `Event: ${eventTitle}`,
        venue ? `Venue: ${venue}` : null,
        formattedDate ? `Date: ${formattedDate}` : null,
        tier ? `Seats: ${tier}` : null,
        `Quantity: ${quantity}`,
        `Total: $${totalAmount} CAD`,
        ``,
        `Your tickets will be delivered to your email 48 hours before the event.`,
        ``,
        `Thank you for choosing seats.ca!`,
      ].filter(Boolean).join("\n");

      // In-app notification
      await supabase.from("notifications").insert({
        user_id: buyer.id,
        type: "purchase_buyer",
        title: `Order Confirmed — ${eventTitle}${subjectSuffix}`,
        body: buyerBody,
        metadata: {
          event_title: eventTitle,
          tier,
          quantity,
          venue,
          event_date: eventDate,
          total_amount: totalAmount,
          order_id: orderId,
        },
      });

      // Email confirmation
      if (customerEmail) {
        await enqueueEmail(
          customerEmail,
          `Order Confirmed — ${eventTitle}${subjectSuffix}`,
          buyerEmailHtml({
            eventTitle,
            venue,
            eventDate,
            formattedDate,
            tier,
            quantity,
            ticketSubtotal,
            hstAmount: serviceFeeAmount,
            membershipAmount,
            totalAmount,
          }),
          "buyer-confirmation"
        );
      }
    }

    // --- SELLER NOTIFICATION + EMAIL ---
    const ADMIN_EMAIL = "lmksportsconsulting@gmail.com";

    // Always send seller notification to admin, even without ticket_id
    let sellerNotificationSent = false;

    if (meta.ticket_id) {
      const { data: ticket } = await supabase
        .from("tickets")
        .select("seller_id, section, row_name, seat_number, price, event_id, quantity_sold")
        .eq("id", meta.ticket_id)
        .single();

      if (ticket) {
        // Increment quantity_sold to prevent overselling
        const purchasedQty = parseInt(quantity) || 1;
        const newQtySold = (ticket.quantity_sold || 0) + purchasedQty;
        await supabase
          .from("tickets")
          .update({ quantity_sold: newQtySold })
          .eq("id", meta.ticket_id);
        console.log(`Updated quantity_sold for ticket ${meta.ticket_id}: ${ticket.quantity_sold} → ${newQtySold}`);
        const sectionInfo = ticket.section;
        const rowInfo = ticket.row_name || "";
        const salePrice = ticket.price.toFixed(2);

        // Retrieve the actual transfer email alias from order_transfers (letters-only)
        const { data: transferRow } = await supabase
          .from("order_transfers")
          .select("transfer_email_alias")
          .eq("order_id", orderId)
          .eq("ticket_id", meta.ticket_id)
          .maybeSingle();

        const transferEmailForSeller = transferRow?.transfer_email_alias || undefined;
        // Extract the letters-only alias portion for order ref (e.g. "KXBMTQRWJF" from "order-kxbmtqrwjf@inbound.seats.ca")
        const aliasLetters = transferEmailForSeller
          ? transferEmailForSeller.replace("order-", "").replace("@inbound.seats.ca", "").toUpperCase()
          : orderId ? orderId.slice(0, 8).toUpperCase() : "N/A";
        const orderRefShort = aliasLetters;

        const sellerHtml = sellerEmailHtml({
          eventTitle,
          venue,
          eventDate,
          formattedDate,
          section: sectionInfo,
          rowName: rowInfo,
          salePrice,
          quantity,
          orderRef: orderRefShort,
          transferEmail: transferEmailForSeller,
        });

        const sellerBody = [
          `Great news! Your tickets have been sold.`,
          ``,
          `Event: ${eventTitle}`,
          venue ? `Venue: ${venue}` : null,
          formattedDate ? `Date: ${formattedDate}` : null,
          `Section: ${sectionInfo}`,
          rowInfo ? `Row: ${rowInfo}` : null,
          `Quantity: ${quantity}`,
          `Price Per Ticket: $${salePrice} CAD`,
          `Total Sale: $${(parseInt(quantity) || 1) * parseFloat(salePrice)} CAD`,
          `Order Ref: ${orderRefShort}`,
          ``,
          `Tickets must be delivered within, at least, 48 hours before the event.`,
        ].filter(Boolean).join("\n");

        // Always notify admin
        await enqueueEmail(
          ADMIN_EMAIL,
          `Ticket Sold — ${eventTitle}${subjectSuffix}`,
          sellerHtml,
          "seller-notification",
          { fromName: "LMK Sports Consulting", replyTo: "Lmksportsconsulting@gmail.com" }
        );
        sellerNotificationSent = true;

        if (ticket.seller_id) {
          const { data: reseller } = await supabase
            .from("resellers")
            .select("user_id, business_name, email")
            .eq("user_id", ticket.seller_id)
            .single();

          if (reseller) {
            // In-app notification to reseller
            await supabase.from("notifications").insert({
              user_id: reseller.user_id,
              type: "purchase_seller",
              title: `Ticket Sold — ${eventTitle}${subjectSuffix}`,
              body: sellerBody,
              metadata: {
                event_title: eventTitle,
                tier: `Section ${sectionInfo}${rowInfo ? ` Row ${rowInfo}` : ""}`,
                venue,
                event_date: eventDate,
                total_amount: salePrice,
                order_ref: orderRefShort,
                order_id: orderId,
              },
            });

            // Also email reseller if different from admin
            const resellerEmail = reseller.email;
            if (resellerEmail && resellerEmail !== ADMIN_EMAIL) {
              await enqueueEmail(
                resellerEmail,
                `Ticket Sold — ${eventTitle}${subjectSuffix}`,
                sellerHtml,
                "seller-notification",
                { fromName: "LMK Sports Consulting", replyTo: "Lmksportsconsulting@gmail.com" }
              );
            }
          }
        }
      }
    }

    // Fallback: if no ticket_id or ticket not found, still notify admin
    if (!sellerNotificationSent) {
      const fallbackOrderRef = orderId ? orderId.slice(0, 8).toUpperCase() : "N/A";
      const fallbackAliasRef = orderId ? orderId.replace(/-/g, "").slice(0, 8).toLowerCase() : "";
      const fallbackTransferEmail = fallbackAliasRef ? `order-${fallbackAliasRef}@inbound.seats.ca` : undefined;
      const fallbackHtml = sellerEmailHtml({
        eventTitle,
        venue,
        eventDate,
        formattedDate,
        section: tier.replace("Section ", "").split(",")[0] || "N/A",
        rowName: "",
        salePrice: totalAmount,
        quantity,
        orderRef: fallbackOrderRef,
        transferEmail: fallbackTransferEmail,
      });
      await enqueueEmail(
        ADMIN_EMAIL,
        `Ticket Sold — ${eventTitle}${subjectSuffix}`,
        fallbackHtml,
        "seller-notification",
        { fromName: "LMK Sports Consulting", replyTo: "Lmksportsconsulting@gmail.com" }
      );
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
