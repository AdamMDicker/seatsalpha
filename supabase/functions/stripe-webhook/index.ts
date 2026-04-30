import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

// --- Structured logger ---
const logStep = (step: string, details?: unknown) => {
  try {
    console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
  } catch {
    console.log(`[STRIPE-WEBHOOK] ${step}`);
  }
};

// --- Best-effort wrapper: never let side effects bubble ---
async function safe<T>(label: string, fn: () => Promise<T> | PromiseLike<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[STRIPE-WEBHOOK] best-effort failure (${label}):`, err);
    return null;
  }
}

// --- Webhook audit logging ---
async function logWebhookEvent(args: {
  stripeEventId: string;
  eventType: string;
  status: string;
  processingMs?: number;
  errorMessage?: string;
  payloadSummary?: Record<string, unknown>;
}) {
  try {
    await supabase.from("stripe_webhook_events").upsert(
      {
        stripe_event_id: args.stripeEventId,
        event_type: args.eventType,
        source: "buyer",
        status: args.status,
        processing_ms: args.processingMs ?? null,
        error_message: args.errorMessage ?? null,
        payload_summary: args.payloadSummary ?? null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "stripe_event_id,source" },
    );
  } catch (err) {
    console.error("[STRIPE-WEBHOOK] failed to log audit event:", err);
  }
}

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = "noreply@seats.ca";
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo-horizontal.png";

// --- Date formatting helper (uses Intl for correct EST/EDT handling) ---
function formatEventDateET(raw: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Toronto",
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const parts = fmt.formatToParts(d);
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    return `${get("weekday")}, ${get("month")} ${get("day")}, ${get("year")} · ${get("hour")}:${get("minute")} ${get("dayPeriod")} ET`;
  } catch {
    return raw;
  }
}

function shortDateForSubject(raw: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Toronto",
      month: "short",
      day: "numeric",
    });
    return fmt.format(d);
  } catch {
    return "";
  }
}

const HERO_BANNER_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/email-hero-banner.png";

// --- Premium email wrapper ---
function premiumWrapper(opts: { accentColor: string; title: string; subtitle: string; body: string }): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="padding:0;"><img src="${HERO_BANNER_URL}" alt="Compare Every Seat. Skip Every Fee." width="600" style="display:block;width:100%;height:auto;" /></td></tr><tr><td style="height:3px;background:linear-gradient(90deg,${opts.accentColor},${opts.accentColor}80,${opts.accentColor});"></td></tr><tr><td style="padding:28px 40px 0;"><h1 style="margin:0;color:#18181b;font-size:24px;font-weight:700;letter-spacing:-0.5px;">${opts.title}</h1><p style="margin:6px 0 0;color:#71717a;font-size:14px;">${opts.subtitle}</p></td></tr><tr><td style="padding:20px 40px 32px;">${opts.body}</td></tr><tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;text-align:center;"><p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} seats.ca · Canada's No-Fee Ticket Platform</p><p style="margin:6px 0 0;color:#a1a1aa;font-size:11px;">Tip: Add noreply@seats.ca to your contacts to avoid missing emails.</p></td></tr></table></td></tr></table></body></html>`;
}

function buyerEmailHtml(meta: { eventTitle: string; venue: string; eventDate: string; formattedDate: string; tier: string; quantity: string; ticketSubtotal: string; hstAmount: string; membershipAmount: string; totalAmount: string; }): string {
  const hasHst = meta.hstAmount && parseFloat(meta.hstAmount) > 0;
  const hasMembership = meta.membershipAmount && parseFloat(meta.membershipAmount) > 0;
  const body = `<h2 style="margin:0 0 20px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;">${meta.formattedDate ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;width:110px;">Date</td><td style="padding:10px 14px;color:#18181b;font-size:14px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.formattedDate}</td></tr>` : ""}${meta.venue ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Venue</td><td style="padding:10px 14px;color:#18181b;font-size:14px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.venue}</td></tr>` : ""}${meta.tier ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Seats</td><td style="padding:10px 14px;color:#18181b;font-size:14px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.tier}</td></tr>` : ""}<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;">Quantity</td><td style="padding:10px 14px;color:#18181b;font-size:14px;font-weight:600;">${meta.quantity}</td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fa;border-radius:10px;border:1px solid #e4e4e7;"><tr><td style="padding:16px;"><table width="100%"><tr><td style="color:#71717a;font-size:13px;padding:4px 0;">Tickets</td><td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.ticketSubtotal} CAD</td></tr>${hasHst ? `<tr><td style="color:#71717a;font-size:13px;padding:4px 0;">LCC (13%)</td><td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.hstAmount} CAD</td></tr>` : ""}${hasMembership ? `<tr><td style="color:#71717a;font-size:13px;padding:4px 0;">Annual Membership</td><td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.membershipAmount} CAD</td></tr>` : ""}<tr><td style="color:#18181b;font-size:14px;padding:10px 0 0;border-top:1px solid #e0e0e0;font-weight:600;">Total Paid</td><td align="right" style="color:#C41E3A;font-size:22px;font-weight:800;padding:10px 0 0;border-top:1px solid #e0e0e0;">$${meta.totalAmount} CAD</td></tr></table></td></tr></table><p style="margin:20px 0 0;color:#71717a;font-size:13px;line-height:1.6;">Your tickets will be delivered to your email 48 hours before the event. Questions? <a href="mailto:support@seats.ca" style="color:#C41E3A;text-decoration:none;">support@seats.ca</a>.</p><p style="margin:12px 0 0;color:#a1a1aa;font-size:11px;">All sales are final. <a href="https://seats.ca/terms" style="color:#C41E3A;text-decoration:none;">Terms of Service</a>.</p>`;
  return premiumWrapper({ accentColor: "#C41E3A", title: "🎟️ Order Confirmed", subtitle: "Thank you for your purchase on seats.ca", body });
}

function sellerEmailHtml(meta: { eventTitle: string; venue: string; eventDate: string; formattedDate: string; section: string; rowName: string; salePrice: string; quantity: string; orderRef: string; transferEmail?: string; }): string {
  const totalSale = (parseInt(meta.quantity) || 1) * parseFloat(meta.salePrice);
  const transferBlock = meta.transferEmail
    ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Transfer To</td><td style="padding:10px 14px;color:#18181b;font-size:14px;font-weight:600;border-bottom:1px solid #f0f0f0;word-break:break-all;">${meta.transferEmail}</td></tr>`
    : "";
  const body = `<h2 style="margin:0 0 20px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;">${meta.formattedDate ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;width:110px;">Date</td><td style="padding:10px 14px;color:#18181b;font-size:14px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.formattedDate}</td></tr>` : ""}${meta.venue ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Venue</td><td style="padding:10px 14px;color:#18181b;font-size:14px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.venue}</td></tr>` : ""}<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Section</td><td style="padding:10px 14px;color:#18181b;font-size:14px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.section}${meta.rowName ? `, Row ${meta.rowName}` : ""}</td></tr><tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Quantity</td><td style="padding:10px 14px;color:#18181b;font-size:14px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.quantity}</td></tr>${transferBlock}<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;">Order Ref</td><td style="padding:10px 14px;color:#18181b;font-size:14px;font-weight:600;">${meta.orderRef}</td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fa;border-radius:10px;border:1px solid #e4e4e7;"><tr><td style="padding:16px;"><table width="100%"><tr><td style="color:#71717a;font-size:13px;padding:4px 0;">Price Per Ticket</td><td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.salePrice} CAD</td></tr><tr><td style="color:#18181b;font-size:14px;padding:10px 0 0;border-top:1px solid #e0e0e0;font-weight:600;">Total Sale</td><td align="right" style="color:#16a34a;font-size:22px;font-weight:800;padding:10px 0 0;border-top:1px solid #e0e0e0;">$${totalSale.toFixed(2)} CAD</td></tr></table></td></tr></table><div style="margin:20px 0 0;padding:16px;background:#fef9e7;border:1px solid #d4ac0d;border-radius:10px;"><p style="margin:0;color:#92400e;font-size:13px;font-weight:600;">⚠️ Action Required</p><p style="margin:6px 0 0;color:#92400e;font-size:13px;line-height:1.5;">Please transfer the tickets via Ticketmaster to the email address shown above. Tickets must be delivered at least 48 hours before the event.</p></div>`;
  return premiumWrapper({ accentColor: "#16a34a", title: "💰 Ticket Sold!", subtitle: "A buyer has purchased your tickets on seats.ca", body });
}


// --- Helper to enqueue an email ---
async function enqueueEmail(to: string, subject: string, html: string, label: string, opts?: { fromName?: string; replyTo?: string }) {
  const messageId = crypto.randomUUID();
  const unsubToken = crypto.randomUUID();
  const text = subject;
  const displayName = opts?.fromName || "seats.ca";

  // Insert unsubscribe token for compliance
  await supabase.from("email_unsubscribe_tokens").insert({
    email: to,
    token: unsubToken,
  });

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
      idempotency_key: messageId,
      unsubscribe_token: unsubToken,
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
    logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500 });
  }
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    logStep("Signature verification failed", { error: String(err) });
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  const startedAt = Date.now();
  logStep("Event received", { type: event.type, id: event.id });

  // Record receipt immediately so even crashes are visible in the audit table.
  await logWebhookEvent({
    stripeEventId: event.id,
    eventType: event.type,
    status: "received",
    payloadSummary: { livemode: event.livemode, api_version: event.api_version },
  });

  // Fast-ack any event type we don't process — prevents Stripe retries on irrelevant events
  if (event.type !== "checkout.session.completed") {
    logStep("Unhandled event type, acknowledging", { type: event.type });
    await logWebhookEvent({
      stripeEventId: event.id,
      eventType: event.type,
      status: "ignored",
      processingMs: Date.now() - startedAt,
    });
    return new Response(JSON.stringify({ received: true, ignored: true }), { status: 200 });
  }

  // Wrap entire processing in try/catch. We always return 200 once the signature
  // is valid — internal failures are logged but never trigger a Stripe retry.
  try {
    const stripeEventId = event.id;

    // --- IDEMPOTENCY CHECK ---
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_event_id", stripeEventId)
      .maybeSingle();

    if (existingOrder) {
      logStep("Duplicate event, skipping", { stripeEventId, orderId: existingOrder.id });
      await logWebhookEvent({
        stripeEventId,
        eventType: event.type,
        status: "duplicate",
        processingMs: Date.now() - startedAt,
        payloadSummary: { order_id: existingOrder.id },
      });
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata || {};
    let customerEmail = session.customer_email || session.customer_details?.email || "";

    // Fallback: for returning customers, Stripe may not populate email fields on the session.
    // Retrieve the customer object directly to get their email.
    if (!customerEmail && session.customer) {
      try {
        const customerId = typeof session.customer === "string" ? session.customer : session.customer.id;
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted && customer.email) {
          customerEmail = customer.email;
          logStep("Resolved customer email via Stripe API fallback", { customerId, email: customerEmail });
        }
      } catch (err) {
        logStep("WARNING: Failed to retrieve customer email from Stripe", { error: String(err) });
      }
    }

    // --- Seller signup fee path ---
    if (meta.type === "seller_signup_fee" && meta.reseller_id) {
      await safe("update reseller signup_fee_paid_at", () =>
        supabase
          .from("resellers")
          .update({ signup_fee_paid_at: new Date().toISOString() })
          .eq("id", meta.reseller_id)
      );

      if (meta.user_id) {
        await safe("notify seller signup fee paid", () =>
          supabase.from("notifications").insert({
            user_id: meta.user_id,
            type: "seller",
            title: "Sign-Up Fee Paid",
            body: "Your seller sign-up fee has been processed. You can now set up your weekly membership.",
          })
        );
      }
      logStep("Seller signup fee processed", { resellerId: meta.reseller_id });
      await logWebhookEvent({
        stripeEventId: event.id,
        eventType: event.type,
        status: "processed",
        processingMs: Date.now() - startedAt,
        payloadSummary: { kind: "seller_signup_fee", reseller_id: meta.reseller_id },
      });
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // --- Skip non-ticket sessions (membership-only, etc.) ---
    if (!meta.event_title) {
      logStep("Non-ticket session, acknowledging", { sessionId: session.id });
      await logWebhookEvent({
        stripeEventId: event.id,
        eventType: event.type,
        status: "skipped",
        processingMs: Date.now() - startedAt,
        payloadSummary: { reason: "non-ticket", session_id: session.id },
      });
      return new Response(JSON.stringify({ received: true, skipped: "non-ticket" }), { status: 200 });
    }

    const eventTitle = meta.event_title || "Event";
    const tier = meta.ticket_tier || "";
    const quantity = meta.ticket_quantity || "1";
    const venue = meta.venue || "";
    const eventDate = meta.event_date || "";
    const totalAmount = session.amount_total ? (session.amount_total / 100).toFixed(2) : "0.00";

    const formattedDate = formatEventDateET(eventDate);
    const shortDate = shortDateForSubject(eventDate);
    const subjectSuffix = shortDate ? ` · ${shortDate}` : "";

    const serviceFeeAmount = meta.service_fee ? parseFloat(meta.service_fee).toFixed(2) : "0.00";
    const membershipAmount = meta.membership_amount ? parseFloat(meta.membership_amount).toFixed(2) : "0.00";
    const ticketUnitPrice = meta.ticket_unit_price ? parseFloat(meta.ticket_unit_price) : 0;
    const ticketSubtotal = ticketUnitPrice > 0
      ? (ticketUnitPrice * parseInt(quantity)).toFixed(2)
      : (parseFloat(totalAmount) - parseFloat(serviceFeeAmount) - parseFloat(membershipAmount)).toFixed(2);

    // --- Find buyer profile ---
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

    // ============================================================
    // MUST-SUCCEED PATH: order, order_item, order_transfer, ticket inventory.
    // Each step logs errors but never throws.
    // ============================================================
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
          stripe_event_id: stripeEventId,
        })
        .select("id")
        .single();

      if (orderError) {
        logStep("ERROR: failed to create order", { error: orderError.message });
      } else {
        orderId = orderData.id;
        logStep("Order created", { orderId, userId: buyer.id });

        if (meta.ticket_id) {
          const { error: itemError } = await supabase
            .from("order_items")
            .insert({
              order_id: orderId,
              ticket_id: meta.ticket_id,
              quantity: parseInt(quantity) || 1,
              unit_price: ticketUnitPrice || parseFloat(totalAmount),
            });
          if (itemError) logStep("ERROR: failed to create order_item", { error: itemError.message });

          const { data: ticketForTransfer } = await supabase
            .from("tickets")
            .select("seller_id")
            .eq("id", meta.ticket_id)
            .maybeSingle();

          const { data: adminSetting } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "admin_fulfillment_user_id")
            .maybeSingle();
          const ADMIN_USER_ID = adminSetting?.value || "c0768913-3e54-476a-b4b2-8a0051b087ed";
          const effectiveSellerId = ticketForTransfer?.seller_id || ADMIN_USER_ID;

          // Ticketmaster requires letters only — no digits in the inbound alias
          const letters = "abcdefghijklmnopqrstuvwxyz";
          let aliasRef = "";
          for (let i = 0; i < 10; i++) {
            aliasRef += letters[Math.floor(Math.random() * 26)];
          }
          const transferEmailAlias = `order-${aliasRef}@inbound.seats.ca`;

          const { error: transferErr } = await supabase.from("order_transfers").insert({
            order_id: orderId,
            ticket_id: meta.ticket_id,
            seller_id: effectiveSellerId,
            status: "pending",
            expected_quantity: parseInt(quantity) || 1,
            transfer_email_alias: transferEmailAlias,
          });
          if (transferErr) {
            logStep("ERROR: failed to create order_transfer", { error: transferErr.message });
          } else {
            logStep("Order transfer created", { orderId, sellerId: effectiveSellerId, alias: transferEmailAlias });
          }

          // --- Seller membership-referral bonus ($20) ---
          // When a buyer adds the membership upgrade at checkout AND the ticket
          // belongs to a real seller (not the platform/admin fulfillment user),
          // credit that seller $20.
          const membershipPaid = parseFloat(meta.membership_amount || "0") > 0;
          const realSellerId = ticketForTransfer?.seller_id;
          if (membershipPaid && realSellerId && realSellerId !== ADMIN_USER_ID) {
            const { error: creditErr } = await supabase.from("seller_credits").insert({
              seller_id: realSellerId,
              order_id: orderId,
              amount: 20,
              reason: "membership_referral",
              status: "pending",
            });
            if (creditErr) {
              logStep("ERROR: failed to insert seller_credit", { error: creditErr.message });
            } else {
              logStep("Seller membership-referral credit created", { sellerId: realSellerId, orderId });
            }
          }
        }
      }
    } else {
      logStep("No buyer profile matched, skipping order creation", { customerEmail });
    }

    // ============================================================
    // BEST-EFFORT PATH: notifications + emails. Failures are swallowed.
    // ============================================================

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

      await safe("buyer in-app notification", () =>
        supabase.from("notifications").insert({
          user_id: buyer!.id,
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
        })
      );

      if (customerEmail) {
        await safe("buyer confirmation email", () =>
          enqueueEmail(
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
            "buyer-confirmation",
          )
        );
      }
    }

    // --- SELLER NOTIFICATION + EMAIL ---
    const ADMIN_EMAIL = "lmksportsconsulting@gmail.com";
    let sellerNotificationSent = false;

    if (meta.ticket_id) {
      const { data: ticket } = await supabase
        .from("tickets")
        .select("seller_id, section, row_name, seat_number, price, event_id, quantity_sold")
        .eq("id", meta.ticket_id)
        .maybeSingle();

      if (ticket) {
        const purchasedQty = parseInt(quantity) || 1;
        const newQtySold = (ticket.quantity_sold || 0) + purchasedQty;
        const { error: invErr } = await supabase
          .from("tickets")
          .update({ quantity_sold: newQtySold })
          .eq("id", meta.ticket_id);
        if (invErr) {
          logStep("ERROR: failed to update ticket quantity_sold", { error: invErr.message, ticketId: meta.ticket_id });
        } else {
          logStep("Inventory updated", { ticketId: meta.ticket_id, from: ticket.quantity_sold, to: newQtySold });
        }

        const sectionInfo = ticket.section;
        const rowInfo = ticket.row_name || "";
        const salePrice = (ticket.price ?? 0).toFixed(2);

        const { data: transferRow } = await supabase
          .from("order_transfers")
          .select("transfer_email_alias")
          .eq("order_id", orderId ?? "")
          .eq("ticket_id", meta.ticket_id)
          .maybeSingle();

        const transferEmailForSeller = transferRow?.transfer_email_alias || undefined;
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

        // Determine the actual seller email:
        // - If ticket has a seller_id → email that reseller ONLY
        // - If ticket has no seller_id (admin-listed) → email LMK (admin) as fallback seller
        let actualSellerEmail: string | null = null;
        let actualSellerUserId: string | null = null;
        let actualSellerBusinessName: string | null = null;

        if (ticket.seller_id) {
          const { data: reseller } = await supabase
            .from("resellers")
            .select("user_id, business_name, email")
            .eq("user_id", ticket.seller_id)
            .maybeSingle();
          if (reseller) {
            actualSellerEmail = reseller.email ?? null;
            actualSellerUserId = reseller.user_id;
            actualSellerBusinessName = reseller.business_name;
          }
        } else {
          actualSellerEmail = ADMIN_EMAIL;
        }

        if (actualSellerEmail) {
          await safe("seller email", () =>
            enqueueEmail(
              actualSellerEmail!,
              `Ticket Sold — ${eventTitle}${subjectSuffix}`,
              sellerHtml,
              "seller-notification",
              { fromName: "LMK Sports Consulting", replyTo: "Lmksportsconsulting@gmail.com" },
            )
          );
          sellerNotificationSent = true;
        }

        if (actualSellerUserId) {
          await safe("reseller in-app notification", () =>
            supabase.from("notifications").insert({
              user_id: actualSellerUserId,
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
            })
          );
        }
      } else {
        logStep("Ticket not found, falling back to admin email", { ticketId: meta.ticket_id });
      }
    }

    if (!sellerNotificationSent) {
      const { data: fallbackTransferRow } = orderId
        ? await supabase
            .from("order_transfers")
            .select("transfer_email_alias")
            .eq("order_id", orderId)
            .maybeSingle()
        : { data: null };
      const fallbackTransferEmail = fallbackTransferRow?.transfer_email_alias || undefined;
      const fallbackAliasLetters = fallbackTransferEmail
        ? fallbackTransferEmail.replace("order-", "").replace("@inbound.seats.ca", "").toUpperCase()
        : orderId ? orderId.slice(0, 8).toUpperCase() : "N/A";
      const fallbackOrderRef = fallbackAliasLetters;
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
      await safe("fallback admin seller email", () =>
        enqueueEmail(
          ADMIN_EMAIL,
          `Ticket Sold — ${eventTitle}${subjectSuffix}`,
          fallbackHtml,
          "seller-notification",
          { fromName: "LMK Sports Consulting", replyTo: "Lmksportsconsulting@gmail.com" },
        )
      );
    }

    await logWebhookEvent({
      stripeEventId: event.id,
      eventType: event.type,
      status: "processed",
      processingMs: Date.now() - startedAt,
      payloadSummary: { order_id: orderId, kind: "ticket_purchase" },
    });
    return new Response(JSON.stringify({ received: true, orderId }), { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logStep("FATAL processing error (acknowledged to Stripe)", {
      eventId: event.id,
      eventType: event.type,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
    });
    await logWebhookEvent({
      stripeEventId: event.id,
      eventType: event.type,
      status: "processing_error",
      processingMs: Date.now() - startedAt,
      errorMessage,
    });
    return new Response(JSON.stringify({ received: true, processing_error: true }), { status: 200 });
  }
});
