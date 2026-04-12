import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "seats.ca";
const FROM_EMAIL = `noreply@${SENDER_DOMAIN}`;
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png";

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

function brandedEmailWrapper(headerBg: string, headerEmoji: string, headerTitle: string, headerSub: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<!-- Logo -->
<tr><td style="padding:28px 40px 0;text-align:center;">
  <img src="${LOGO_URL}" alt="seats.ca" width="300" height="300" style="display:block;margin:0 auto;width:300px;height:300px;" />
</td></tr>
<!-- Gradient header -->
<tr><td style="background:${headerBg};padding:28px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">${headerEmoji} ${headerTitle}</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${headerSub}</p>
</td></tr>
<!-- Body -->
<tr><td style="padding:32px 40px;">
${bodyContent}
</td></tr>
<!-- Footer -->
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} seats.ca — Canada's No-Fee Ticket Platform</p>
</td></tr>
<!-- Spam warning -->
<tr><td style="padding:16px 40px;text-align:center;background:#FEF9E7;border-top:1px solid #D4AC0D;">
  <p style="margin:0;color:#7C6F1B;font-size:11px;line-height:1.5;">⚠️ If you don't see future emails from us, check your <strong>Spam</strong> or <strong>Junk</strong> folder and mark <strong>noreply@seats.ca</strong> as a safe sender.</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

function transferConfirmedHtml(meta: {
  eventTitle: string;
  venue: string;
  eventDate: string;
  section: string;
  rowName: string;
}): string {
  const detailsRows = [
    meta.eventDate ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Date</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.eventDate}</td></tr>` : "",
    meta.venue ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Venue</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.venue}</td></tr>` : "",
    meta.section ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Section</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.section}</td></tr>` : "",
    meta.rowName ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;">Row</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;">${meta.rowName}</td></tr>` : "",
  ].filter(Boolean).join("");

  const bodyContent = `
  <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  ${detailsRows ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">${detailsRows}</table>` : ""}
  <p style="margin:0 0 16px;color:#18181b;font-size:14px;line-height:1.6;">
    The seller has completed the ticket transfer and it has been verified by our team. Please check your Ticketmaster account (or relevant platform) to accept the incoming transfer.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#ecfdf5;border-radius:8px;border:1px solid #a7f3d0;">
    <tr><td style="padding:16px;">
      <p style="margin:0;color:#047857;font-size:14px;font-weight:700;">📋 Next Steps</p>
      <ol style="margin:8px 0 0;padding-left:20px;color:#047857;font-size:13px;line-height:1.8;">
        <li>Log in to your Ticketmaster account (or relevant platform)</li>
        <li>Look for an incoming ticket transfer notification</li>
        <li>Accept the transfer to add the tickets to your account</li>
      </ol>
    </td></tr>
  </table>
  <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    If you have any questions, contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a>.
  </p>`;

  return brandedEmailWrapper(
    "linear-gradient(135deg,#d6193d,#b81535)",
    "🎟️",
    "Your Tickets Have Been Transferred!",
    "Great news — your tickets are on the way",
    bodyContent
  );
}

function transferDisputedSellerHtml(meta: {
  eventTitle: string;
  venue: string;
  eventDate: string;
  section: string;
  rowName: string;
  reason: string;
}): string {
  const detailsRows = [
    meta.eventDate ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Date</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.eventDate}</td></tr>` : "",
    meta.venue ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Venue</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.venue}</td></tr>` : "",
    meta.section ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Section</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.section}</td></tr>` : "",
    meta.rowName ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;">Row</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;">${meta.rowName}</td></tr>` : "",
  ].filter(Boolean).join("");

  const bodyContent = `
  <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  ${detailsRows ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">${detailsRows}</table>` : ""}
  <p style="margin:0 0 16px;color:#18181b;font-size:14px;line-height:1.6;">
    Your transfer proof for the above event has been reviewed and <strong style="color:#d6193d;">disputed</strong> by our team. This means the uploaded screenshot could not be verified as a valid transfer.
  </p>
  ${meta.reason ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
    <p style="margin:0;color:#991b1b;font-size:13px;"><strong>Reason:</strong> ${meta.reason}</p>
  </div>` : ""}
  <p style="margin:16px 0;color:#18181b;font-size:14px;line-height:1.6;"><strong>What to do next:</strong></p>
  <ol style="margin:0 0 16px;padding-left:20px;color:#18181b;font-size:14px;line-height:1.8;">
    <li>Go to your <a href="https://seats.ca/reseller-dashboard?tab=transfers" style="color:#d6193d;text-decoration:none;font-weight:600;">Seller Portal → Transfers</a></li>
    <li>Find the disputed transfer and click to re-upload a clear screenshot</li>
    <li>Ensure the screenshot shows the recipient email, event name, and seat details</li>
  </ol>
  <div style="text-align:center;margin:24px 0;">
    <a href="https://seats.ca/reseller-dashboard?tab=transfers" style="display:inline-block;background:#d6193d;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Go to Seller Portal</a>
  </div>
  <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    If you believe this is an error, please contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a>.
  </p>`;

  return brandedEmailWrapper(
    "linear-gradient(135deg,#d6193d,#b81535)",
    "⚠️",
    "Transfer Disputed",
    "Action required — please re-upload your transfer proof",
    bodyContent
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { transfer_id, action } = body;

    if (!transfer_id) {
      return new Response(JSON.stringify({ error: "Missing transfer_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transferAction = action || "confirm";

    // Get transfer details
    const { data: transfer, error: transferError } = await supabase
      .from("order_transfers")
      .select("*, orders!inner(user_id), tickets!inner(event_id, section, row_name)")
      .eq("id", transfer_id)
      .single();

    if (transferError || !transfer) {
      return new Response(JSON.stringify({ error: "Transfer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get event details
    const { data: event } = await supabase
      .from("events")
      .select("title, venue, event_date")
      .eq("id", transfer.tickets.event_id)
      .single();

    const eventTitle = event?.title || "Your Event";
    const venue = event?.venue || "";
    const eventDate = event?.event_date ? formatEventDateET(event.event_date) : "";
    const section = (transfer.tickets as any)?.section || "";
    const rowName = (transfer.tickets as any)?.row_name || "";

    if (transferAction === "confirm") {
      // --- CONFIRM: Notify buyer ---
      const { data: buyerProfile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", transfer.orders.user_id)
        .single();

      if (!buyerProfile?.email) {
        return new Response(JSON.stringify({ error: "Buyer email not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const messageId = crypto.randomUUID();
      const subject = `Your Tickets Have Been Transferred — ${eventTitle}`;
      const html = transferConfirmedHtml({
        eventTitle,
        venue,
        eventDate,
        section,
        rowName,
      });

      await supabase.from("email_send_log").insert({
        message_id: messageId,
        template_name: "buyer-transfer-confirmation",
        recipient_email: buyerProfile.email,
        status: "pending",
      });

      await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          message_id: messageId,
          to: buyerProfile.email,
          from: `seats.ca <${FROM_EMAIL}>`,
          sender_domain: SENDER_DOMAIN,
          subject,
          html,
          text: subject,
          purpose: "transactional",
          label: "buyer-transfer-confirmation",
          queued_at: new Date().toISOString(),
        },
      });

      // In-app notification for buyer
      await supabase.from("notifications").insert({
        user_id: transfer.orders.user_id,
        type: "transfer_confirmation",
        title: `Tickets Transferred — ${eventTitle}`,
        body: `The seller has transferred your tickets for ${eventTitle}. Check your email for the transfer confirmation.`,
        metadata: { event_title: eventTitle, venue, transfer_id },
      });

    } else if (transferAction === "dispute") {
      // --- DISPUTE: Notify seller ---
      const { data: reseller } = await supabase
        .from("resellers")
        .select("email, first_name, user_id")
        .eq("user_id", transfer.seller_id)
        .maybeSingle();

      if (!reseller?.email) {
        return new Response(JSON.stringify({ error: "Seller email not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const reason = body.reason || "";
      const messageId = crypto.randomUUID();
      const subject = `Transfer Disputed — ${eventTitle}`;
      const html = transferDisputedSellerHtml({ eventTitle, venue, eventDate, section, rowName, reason });

      await supabase.from("email_send_log").insert({
        message_id: messageId,
        template_name: "seller-transfer-disputed",
        recipient_email: reseller.email,
        status: "pending",
      });

      await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          message_id: messageId,
          to: reseller.email,
          from: `seats.ca <${FROM_EMAIL}>`,
          sender_domain: SENDER_DOMAIN,
          subject,
          html,
          text: `Your transfer proof for ${eventTitle} has been disputed. Please re-upload a valid screenshot at https://seats.ca/reseller-dashboard?tab=transfers`,
          purpose: "transactional",
          label: "seller-transfer-disputed",
          queued_at: new Date().toISOString(),
        },
      });

      // In-app notification for seller
      await supabase.from("notifications").insert({
        user_id: reseller.user_id,
        type: "transfer_disputed",
        title: `Transfer Disputed — ${eventTitle}`,
        body: `Your transfer proof for ${eventTitle} has been disputed. Please go to Transfers in your Seller Portal and re-upload a clear screenshot.`,
        metadata: { event_title: eventTitle, venue, transfer_id },
      });
    }

    return new Response(JSON.stringify({ success: true, action: transferAction }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in notify-buyer-transfer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
