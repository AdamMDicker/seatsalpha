// Cron-driven function that nudges sellers / escalates to admins when a
// Ticketmaster transfer has arrived at the inbound alias but no proof
// upload has happened yet.
//
// Stages:
//   1. 30 min after accept_link_extracted_at and no proof → seller reminder
//   2. 2 h after accept_link_extracted_at and no proof   → admin escalation
//
// Uses the existing email queue + notifications table.

import { createClient } from "npm:@supabase/supabase-js@2";

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = "noreply@seats.ca";
const HERO_BANNER_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/email-hero-banner.png";
const ADMIN_EMAIL = "lmkconsulting@gmail.com"; // LMK / fulfillment admin

interface TransferRow {
  id: string;
  order_id: string;
  ticket_id: string;
  seller_id: string | null;
  accept_link_extracted_at: string;
  seller_reminder_sent_at: string | null;
  admin_escalation_sent_at: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const now = Date.now();
  const thirtyMinAgo = new Date(now - 30 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString();

  // Optional manual trigger: POST { transfer_id, force?: boolean } sends the
  // seller reminder for one specific transfer regardless of timing gates.
  let manualTransferId: string | null = null;
  let manualForce = false;
  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body && typeof body.transfer_id === "string") {
        manualTransferId = body.transfer_id;
        manualForce = body.force === true;
      }
    } catch {
      // ignore — empty body means cron invocation
    }
  }

  try {
    if (manualTransferId) {
      const { data: row, error: rowError } = await supabase
        .from("order_transfers")
        .select("id, order_id, ticket_id, seller_id, accept_link_extracted_at, seller_reminder_sent_at, admin_escalation_sent_at")
        .eq("id", manualTransferId)
        .maybeSingle();

      if (rowError || !row) {
        return jsonResponse({ error: rowError?.message ?? "Transfer not found" }, 404);
      }
      if (row.seller_reminder_sent_at && !manualForce) {
        return jsonResponse({ ok: false, reason: "already_sent", seller_reminder_sent_at: row.seller_reminder_sent_at });
      }

      const ctx = await loadContext(supabase, row as TransferRow);
      if (!ctx.sellerEmail) {
        return jsonResponse({ ok: false, reason: "no_seller_email" }, 400);
      }
      await sendSellerReminder(supabase, row as TransferRow, ctx);
      await supabase
        .from("order_transfers")
        .update({ seller_reminder_sent_at: new Date().toISOString() })
        .eq("id", row.id);
      return jsonResponse({ ok: true, sent_to: ctx.sellerEmail, transfer_id: row.id });
    }

    // Pull all transfers where TM email arrived but no proof yet.
    const { data: transfers, error } = await supabase
      .from("order_transfers")
      .select("id, order_id, ticket_id, seller_id, accept_link_extracted_at, seller_reminder_sent_at, admin_escalation_sent_at")
      .is("transfer_image_url", null)
      .not("accept_link_extracted_at", "is", null)
      .in("status", ["pending", "disputed"])
      .lt("accept_link_extracted_at", thirtyMinAgo);

    if (error) {
      console.error("Query error:", error);
      return jsonResponse({ error: error.message }, 500);
    }

    if (!transfers || transfers.length === 0) {
      return jsonResponse({ reminders_sent: 0, escalations_sent: 0 });
    }

    let reminders = 0;
    let escalations = 0;

    for (const t of transfers as TransferRow[]) {
      const extractedAt = new Date(t.accept_link_extracted_at).getTime();
      const ageMs = now - extractedAt;
      const ctx = await loadContext(supabase, t);

      // Stage 2 — admin escalation at 2h
      if (ageMs >= 2 * 60 * 60 * 1000 && !t.admin_escalation_sent_at) {
        try {
          await sendAdminEscalation(supabase, t, ctx);
          await supabase
            .from("order_transfers")
            .update({ admin_escalation_sent_at: new Date().toISOString() })
            .eq("id", t.id);
          escalations++;
        } catch (e) {
          console.error(`Escalation failed for ${t.id}:`, e);
        }
        continue; // don't double-process the same row this run
      }

      // Stage 1 — seller reminder at 30min
      if (!t.seller_reminder_sent_at) {
        try {
          await sendSellerReminder(supabase, t, ctx);
          await supabase
            .from("order_transfers")
            .update({ seller_reminder_sent_at: new Date().toISOString() })
            .eq("id", t.id);
          reminders++;
        } catch (e) {
          console.error(`Reminder failed for ${t.id}:`, e);
        }
      }
    }

    console.log(`seller-proof-reminder: reminders=${reminders} escalations=${escalations}`);
    return jsonResponse({ reminders_sent: reminders, escalations_sent: escalations });
  } catch (err) {
    console.error("Unexpected error:", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Unknown" }, 500);
  }
});

// ---------- helpers ----------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

async function loadContext(supabase: any /* SupabaseClient */, t: TransferRow) {
  // Seller (admin/LMK if seller_id is null)
  let sellerEmail: string | null = null;
  let sellerName = "Seller";
  if (t.seller_id) {
    const { data: reseller } = await supabase
      .from("resellers")
      .select("email, business_name, first_name")
      .eq("user_id", t.seller_id)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", t.seller_id)
      .maybeSingle();

    sellerEmail = reseller?.email ?? profile?.email ?? null;
    sellerName = reseller?.first_name || reseller?.business_name || profile?.full_name || "Seller";
  } else {
    sellerEmail = ADMIN_EMAIL;
    sellerName = "LMK";
  }

  // Event title + section + venue + date
  let eventTitle = "an event";
  let section = "—";
  let rowName = "—";
  let venue = "";
  let eventDate = "";
  const { data: ticket } = await supabase
    .from("tickets")
    .select("event_id, section, row_name")
    .eq("id", t.ticket_id)
    .maybeSingle();
  if (ticket) {
    section = ticket.section ?? "—";
    rowName = ticket.row_name ?? "—";
    if (ticket.event_id) {
      const { data: event } = await supabase
        .from("events")
        .select("title, venue, event_date")
        .eq("id", ticket.event_id)
        .maybeSingle();
      if (event?.title) eventTitle = event.title;
      if (event?.venue) venue = event.venue;
      if (event?.event_date) eventDate = formatEventDateET(event.event_date);
    }
  }

  // Quantity sold for this transfer
  let quantity = 1;
  const { data: orderItem } = await supabase
    .from("order_items")
    .select("quantity")
    .eq("order_id", t.order_id)
    .eq("ticket_id", t.ticket_id)
    .maybeSingle();
  if (orderItem?.quantity) quantity = orderItem.quantity;

  // Buyer email (for admin context only)
  let buyerEmail: string | null = null;
  const { data: order } = await supabase
    .from("orders")
    .select("user_id")
    .eq("id", t.order_id)
    .maybeSingle();
  if (order?.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", order.user_id)
      .maybeSingle();
    buyerEmail = profile?.email ?? null;
  }

  return { sellerEmail, sellerName, eventTitle, section, rowName, venue, eventDate, quantity, buyerEmail, sellerUserId: t.seller_id };
}

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
    let hours = est.getHours();
    const minutes = est.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${days[est.getDay()]}, ${months[est.getMonth()]} ${est.getDate()}, ${est.getFullYear()} · ${hours}:${minutes} ${ampm} ET`;
  } catch {
    return raw;
  }
}

async function enqueueEmail(
  supabase: any /* SupabaseClient */,
  opts: { to: string; subject: string; html: string; text: string; label: string }
) {
  const messageId = crypto.randomUUID();
  const unsubToken = crypto.randomUUID();

  await supabase.from("email_unsubscribe_tokens").insert({ email: opts.to, token: unsubToken });
  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: opts.label,
    recipient_email: opts.to,
    status: "pending",
  });

  await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: opts.to,
      from: `seats.ca <${FROM_EMAIL}>`,
      sender_domain: SENDER_DOMAIN,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      purpose: "transactional",
      idempotency_key: messageId,
      unsubscribe_token: unsubToken,
      label: opts.label,
      queued_at: new Date().toISOString(),
    },
  });
}

async function sendSellerReminder(
  supabase: any /* SupabaseClient */,
  t: TransferRow,
  ctx: Awaited<ReturnType<typeof loadContext>>
) {
  if (!ctx.sellerEmail) return;

  const subject = `Action Required — Upload Transfer Proof for ${ctx.eventTitle}`;
  const body = `
<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">⏰ Upload Your Transfer Proof</h1>
<p style="margin:0 0 20px;font-size:14px;color:#C41E3A;font-weight:600;font-family:'Space Grotesk',Arial,sans-serif;">The buyer is waiting — please act now</p>
<p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">Hi ${ctx.sellerName},</p>
<p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
  We received the Ticketmaster transfer email for the order below over 30 minutes ago, but you haven't uploaded proof of transfer yet. The buyer's accept link is being held until you confirm the transfer.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
  <tr><td style="padding:16px;background:#fafafa;">
    <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;">${ctx.eventTitle}</p>
    ${ctx.eventDate ? `<p style="margin:0 0 4px;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">${ctx.eventDate}</p>` : ""}
    ${ctx.venue ? `<p style="margin:0 0 4px;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">${ctx.venue}</p>` : ""}
  </td></tr>
  <tr><td style="padding:12px 16px;border-top:1px solid #e4e4e7;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:4px 0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">Section</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;font-family:'Space Grotesk',Arial,sans-serif;">${ctx.section}</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">Row</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;font-family:'Space Grotesk',Arial,sans-serif;">${ctx.rowName}</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">Quantity</td><td style="padding:4px 0;font-size:13px;font-weight:700;color:#C41E3A;text-align:right;font-family:'Space Grotesk',Arial,sans-serif;">${ctx.quantity} ticket${ctx.quantity === 1 ? "" : "s"}</td></tr>
    </table>
  </td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-radius:12px;overflow:hidden;border-left:4px solid #f59e0b;background:#fef3c7;">
  <tr><td style="padding:16px 20px;">
    <p style="margin:0 0 8px;color:#92400e;font-size:14px;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">📋 What To Do</p>
    <ol style="margin:0;padding-left:20px;color:#92400e;font-size:13px;line-height:1.8;font-family:'Space Grotesk',Arial,sans-serif;">
      <li>Log into your seller dashboard</li>
      <li>Open the Transfers tab</li>
      <li>Upload your transfer proof screenshot</li>
    </ol>
  </td></tr>
</table>
<table cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;">
  <tr><td bgcolor="#059669" style="border-radius:8px;">
    <a href="https://seats.ca/reseller?tab=transfers" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;font-family:'Space Grotesk',Arial,sans-serif;">Open Seller Dashboard</a>
  </td></tr>
</table>
<p style="margin:0;color:#a1a1aa;font-size:13px;font-family:'Space Grotesk',Arial,sans-serif;">
  If you don't act within 2 hours, this transfer will be escalated to admin for review.
</p>`;

  await enqueueEmail(supabase, {
    to: ctx.sellerEmail,
    subject,
    html: wrapEmail(body),
    text: `The Ticketmaster transfer for "${ctx.eventTitle}" was received but no proof has been uploaded. Please log in to the seller dashboard and upload proof to release the accept link to the buyer.`,
    label: "seller-proof-reminder",
  });

  // In-app notification (only if seller has a user account)
  if (ctx.sellerUserId) {
    await supabase.from("notifications").insert({
        user_id: ctx.sellerUserId,
        type: "transfer_proof_reminder",
        title: `Upload proof — ${ctx.eventTitle}`,
        body: `The Ticketmaster transfer was received over 30 minutes ago. Please upload your proof of transfer to release the accept link to the buyer.`,
        metadata: { transfer_id: t.id, event_title: ctx.eventTitle },
      });
  }
}

async function sendAdminEscalation(
  supabase: any /* SupabaseClient */,
  t: TransferRow,
  ctx: Awaited<ReturnType<typeof loadContext>>
) {
  const subject = `🚨 ESCALATION — Transfer Proof Overdue (${ctx.eventTitle})`;
  const body = `
<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">🚨 Admin Escalation</h1>
<p style="margin:0 0 20px;font-size:14px;color:#C41E3A;font-weight:600;font-family:'Space Grotesk',Arial,sans-serif;">Seller has not uploaded proof after 2+ hours</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
  <tr><td style="padding:16px;background:#fafafa;">
    <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;">${ctx.eventTitle}</p>
    <p style="margin:0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">Section ${ctx.section} · Row ${ctx.rowName} · Qty ${ctx.quantity}</p>
  </td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-radius:12px;overflow:hidden;border-left:4px solid #C41E3A;background:#fef2f2;">
  <tr><td style="padding:16px 20px;font-family:'Space Grotesk',Arial,sans-serif;font-size:13px;color:#7f1d1d;line-height:1.8;">
    <strong>Transfer ID:</strong> ${t.id}<br/>
    <strong>Seller:</strong> ${ctx.sellerName} ${ctx.sellerEmail ? `(${ctx.sellerEmail})` : ""}<br/>
    <strong>Buyer:</strong> ${ctx.buyerEmail ?? "unknown"}<br/>
    <strong>TM email received:</strong> ${new Date(t.accept_link_extracted_at).toUTCString()}
  </td></tr>
</table>
<p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
  The seller was reminded 30 minutes after the Ticketmaster email arrived but has still not uploaded proof. The buyer's accept link is being held. Please review in the admin Transfers panel.
</p>
<table cellpadding="0" cellspacing="0" border="0" style="margin:0;">
  <tr><td bgcolor="#059669" style="border-radius:8px;">
    <a href="https://seats.ca/admin?tab=transfers" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;font-family:'Space Grotesk',Arial,sans-serif;">Open Admin Transfers</a>
  </td></tr>
</table>`;

  await enqueueEmail(supabase, {
    to: ADMIN_EMAIL,
    subject,
    html: wrapEmail(body),
    text: `Escalation: Transfer ${t.id} for "${ctx.eventTitle}" — seller (${ctx.sellerEmail ?? "unknown"}) has not uploaded proof 2+ hours after Ticketmaster transfer arrived. Buyer ${ctx.buyerEmail ?? "unknown"} is waiting. Review in admin Transfers panel.`,
    label: "admin-transfer-escalation",
  });
}

function wrapEmail(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="padding:0;"><img src="${HERO_BANNER_URL}" alt="seats.ca" width="560" style="display:block;width:100%;height:auto;" /></td></tr><tr><td style="height:3px;background:linear-gradient(90deg,#C41E3A,#d6193d,#C41E3A);"></td></tr><tr><td style="padding:32px 40px;">${body}</td></tr><tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;text-align:center;"><p style="margin:0;color:#a1a1aa;font-size:11px;font-family:'Space Grotesk',Arial,sans-serif;">© ${new Date().getFullYear()} seats.ca · Canada's No-Fee Ticket Platform</p></td></tr></table></td></tr></table></body></html>`;
}
