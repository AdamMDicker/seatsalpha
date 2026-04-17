// Cron-driven function that nudges sellers when a transfer was AI-verified
// (status = "confirmed") but no Ticketmaster transfer email ever arrived at
// the inbound alias 24+ hours later. This means the seller never actually
// hit "Send" in Ticketmaster (or used the wrong recipient email), so the
// buyer is stuck waiting for an Accept email that will never arrive.
//
// Trigger conditions (per order_transfers row):
//   - status = "confirmed"
//   - confirmed_at >= 24h ago
//   - inbound_email_id IS NULL  (no TM email ever hit our relay)
//   - accept_link IS NULL
//   - seller_relay_reminder_sent_at IS NULL  (don't double-send)

import { createClient } from "npm:@supabase/supabase-js@2";

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = "noreply@seats.ca";
const HERO_BANNER_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/email-hero-banner.png";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: transfers, error } = await supabase
      .from("order_transfers")
      .select("id, order_id, ticket_id, seller_id, transfer_email_alias, confirmed_at")
      .eq("status", "confirmed")
      .is("inbound_email_id", null)
      .is("accept_link", null)
      .is("seller_relay_reminder_sent_at", null)
      .not("confirmed_at", "is", null)
      .lt("confirmed_at", twentyFourHoursAgo);

    if (error) {
      console.error("Query error:", error);
      return jsonResponse({ error: error.message }, 500);
    }

    if (!transfers || transfers.length === 0) {
      return jsonResponse({ reminders_sent: 0 });
    }

    let sent = 0;

    for (const t of transfers) {
      try {
        // Get seller email
        if (!t.seller_id) continue;
        const { data: sellerProfile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", t.seller_id)
          .single();

        if (!sellerProfile?.email) {
          console.warn(`No email for seller ${t.seller_id} on transfer ${t.id}`);
          continue;
        }

        // Get event + ticket context
        let eventTitle = "Your Sale";
        let eventDateStr = "";
        let section = "";
        let row = "";
        let quantity = 1;

        const { data: ticket } = await supabase
          .from("tickets")
          .select("event_id, section, row_name")
          .eq("id", t.ticket_id)
          .single();

        if (ticket) {
          section = ticket.section ?? "";
          row = ticket.row_name ?? "";
          if (ticket.event_id) {
            const { data: event } = await supabase
              .from("events")
              .select("title, event_date")
              .eq("id", ticket.event_id)
              .single();
            if (event) {
              eventTitle = event.title;
              eventDateStr = formatEventDateET(event.event_date);
            }
          }
        }

        const { data: orderItem } = await supabase
          .from("order_items")
          .select("quantity")
          .eq("order_id", t.order_id)
          .eq("ticket_id", t.ticket_id)
          .maybeSingle();
        if (orderItem?.quantity) quantity = orderItem.quantity;

        const relayAlias = t.transfer_email_alias ?? "";
        const messageId = crypto.randomUUID();
        const unsubToken = crypto.randomUUID();
        const subject = `⚠️ Action Required — Re-send your Ticketmaster transfer for ${eventTitle}`;
        const html = sellerRelayStalledHtml({
          eventTitle,
          eventDateStr,
          section,
          row,
          quantity,
          relayAlias,
          sellerName: sellerProfile.full_name ?? "",
        });

        await supabase.from("email_unsubscribe_tokens").insert({
          email: sellerProfile.email,
          token: unsubToken,
        });

        await supabase.from("email_send_log").insert({
          message_id: messageId,
          template_name: "seller-relay-stalled",
          recipient_email: sellerProfile.email,
          status: "pending",
        });

        await supabase.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: sellerProfile.email,
            from: `seats.ca <${FROM_EMAIL}>`,
            sender_domain: SENDER_DOMAIN,
            subject,
            html,
            text: `Action required: Your transfer for ${eventTitle} was verified, but Ticketmaster never sent the transfer email to ${relayAlias}. Please open Ticketmaster and re-send the transfer to that exact email address so the buyer can receive their tickets.`,
            purpose: "transactional",
            idempotency_key: messageId,
            unsubscribe_token: unsubToken,
            label: "seller-relay-stalled",
            queued_at: new Date().toISOString(),
          },
        });

        // In-app notification for the seller
        await supabase.from("notifications").insert({
          user_id: t.seller_id,
          type: "transfer_relay_stalled",
          title: `Re-send Ticketmaster transfer — ${eventTitle}`,
          body: `Your verified transfer for ${eventTitle} hasn't been received by our system yet. Please open Ticketmaster and re-send the transfer to ${relayAlias}.`,
          metadata: { event_title: eventTitle, transfer_id: t.id, relay_alias: relayAlias },
        });

        await supabase
          .from("order_transfers")
          .update({ seller_relay_reminder_sent_at: new Date().toISOString() })
          .eq("id", t.id);

        sent++;
      } catch (err) {
        console.error(`Error processing relay-stalled reminder for ${t.id}:`, err);
      }
    }

    console.log(`Relay-stalled reminder: sent ${sent} of ${transfers.length}`);
    return jsonResponse({ reminders_sent: sent });
  } catch (err) {
    console.error("transfer-relay-stalled-reminder error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500
    );
  }
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function formatEventDateET(raw: string): string {
  try {
    const d = new Date(raw);
    return d.toLocaleString("en-US", {
      timeZone: "America/Toronto",
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " ET";
  } catch {
    return raw;
  }
}

function sellerRelayStalledHtml(opts: {
  eventTitle: string;
  eventDateStr: string;
  section: string;
  row: string;
  quantity: number;
  relayAlias: string;
  sellerName: string;
}): string {
  const greet = opts.sellerName ? `Hi ${opts.sellerName.split(" ")[0]},` : "Hi there,";
  const body = `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">⚠️ Action Required: Re-send Your Transfer</h1>
<p style="margin:0 0 20px;font-size:14px;color:#C41E3A;font-weight:600;font-family:'Space Grotesk',Arial,sans-serif;">Your buyer is still waiting for their tickets</p>

<p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
  ${greet}
</p>
<p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
  We verified your proof screenshot for the sale below, but <strong>Ticketmaster's transfer email never arrived at our relay address</strong> in the last 24 hours. That means the buyer hasn't received their accept link yet.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
  <tr><td style="padding:16px;background:#fafafa;">
    <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;">${opts.eventTitle}</p>
    ${opts.eventDateStr ? `<p style="margin:0 0 6px;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">${opts.eventDateStr}</p>` : ""}
    <p style="margin:0;font-size:13px;color:#52525b;font-family:'Space Grotesk',Arial,sans-serif;">Section <strong>${opts.section}</strong> · Row <strong>${opts.row}</strong> · Qty <strong>${opts.quantity}</strong></p>
  </td></tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border-left:4px solid #f59e0b;background:#fef3c7;">
  <tr><td style="padding:16px 20px;">
    <p style="margin:0 0 8px;color:#92400e;font-size:14px;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">📋 What To Do Right Now</p>
    <ol style="margin:0;padding-left:20px;color:#92400e;font-size:13px;line-height:1.8;font-family:'Space Grotesk',Arial,sans-serif;">
      <li>Open <strong>Ticketmaster</strong> (app or website) and go to <strong>My Tickets</strong></li>
      <li>Find the order for <strong>${opts.eventTitle}</strong></li>
      <li>Tap <strong>Transfer</strong> and re-send the tickets to this exact email address:</li>
    </ol>
    <p style="margin:12px 0 0;padding:10px 12px;background:#ffffff;border:1px dashed #d97706;border-radius:8px;color:#18181b;font-family:'Courier New',monospace;font-size:14px;font-weight:700;text-align:center;word-break:break-all;">${opts.relayAlias}</p>
    <p style="margin:10px 0 0;color:#92400e;font-size:12px;font-family:'Space Grotesk',Arial,sans-serif;">⚠️ Use the email address exactly as shown — that's how we route the buyer's accept link safely.</p>
  </td></tr>
</table>

<p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
  Once Ticketmaster sends the transfer to that address, our system will automatically forward the accept link to your buyer. <strong>No further action is needed on the seats.ca portal.</strong>
</p>

<p style="margin:0;color:#a1a1aa;font-size:13px;font-family:'Space Grotesk',Arial,sans-serif;">
  Need help? Reply to this email or contact <a href="mailto:support@seats.ca" style="color:#C41E3A;text-decoration:none;font-weight:600;">support@seats.ca</a>.
</p>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="padding:0;"><img src="${HERO_BANNER_URL}" alt="seats.ca" width="560" style="display:block;width:100%;height:auto;" /></td></tr><tr><td style="height:3px;background:linear-gradient(90deg,#C41E3A,#d6193d,#C41E3A);"></td></tr><tr><td style="padding:32px 40px;">${body}</td></tr><tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;text-align:center;"><p style="margin:0;color:#a1a1aa;font-size:11px;font-family:'Space Grotesk',Arial,sans-serif;">© ${new Date().getFullYear()} seats.ca · Canada's No-Fee Ticket Platform</p></td></tr></table></td></tr></table></body></html>`;
}
