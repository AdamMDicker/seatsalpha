import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = "noreply@seats.ca";
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo-horizontal.png";

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

function premiumWrapper(opts: { accentColor: string; title: string; subtitle: string; body: string }): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:#18181b;padding:28px 40px;text-align:center;">
  <img src="${LOGO_URL}" alt="seats.ca" width="180" style="display:block;margin:0 auto;width:180px;height:auto;" />
</td></tr>
<tr><td style="height:3px;background:linear-gradient(90deg,${opts.accentColor},${opts.accentColor}80,${opts.accentColor});"></td></tr>
<tr><td style="padding:28px 40px 0;">
  <h1 style="margin:0;color:#18181b;font-size:24px;font-weight:700;letter-spacing:-0.5px;">${opts.title}</h1>
  <p style="margin:6px 0 0;color:#71717a;font-size:14px;">${opts.subtitle}</p>
</td></tr>
<tr><td style="padding:20px 40px 32px;">
${opts.body}
</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} seats.ca · Canada's No-Fee Ticket Platform</p>
  <p style="margin:6px 0 0;color:#a1a1aa;font-size:11px;">Tip: Add noreply@seats.ca to your contacts to avoid missing emails.</p>
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
  acceptLink?: string;
}): string {
  const detailsRows = [
    meta.eventDate ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Date</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.eventDate}</td></tr>` : "",
    meta.venue ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Venue</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.venue}</td></tr>` : "",
    meta.section ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Section</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.section}</td></tr>` : "",
    meta.rowName ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;">Row</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;">${meta.rowName}</td></tr>` : "",
  ].filter(Boolean).join("");

  const acceptButton = meta.acceptLink
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr><td align="center">
          <a href="${meta.acceptLink}" style="display:inline-block;background:#C41E3A;color:#ffffff;font-size:16px;font-weight:700;padding:16px 40px;border-radius:50px;text-decoration:none;box-shadow:0 4px 14px rgba(196,30,58,0.3);">Accept Your Tickets →</a>
        </td></tr>
      </table>`
    : "";

  const body = `
  <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  ${detailsRows ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;">${detailsRows}</table>` : ""}
  <p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6;">
    The seller has completed the ticket transfer and it has been verified by our team.
  </p>
  ${acceptButton}
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#ecfdf5;border-radius:10px;border-left:4px solid #059669;">
    <tr><td style="padding:16px;">
      <p style="margin:0;color:#047857;font-size:14px;font-weight:700;">📋 Next Steps</p>
      <ol style="margin:8px 0 0;padding-left:20px;color:#047857;font-size:13px;line-height:1.8;">
        ${meta.acceptLink ? `<li>Click the <strong>"Accept Your Tickets"</strong> button above</li>` : `<li>Look for an incoming ticket transfer notification from Ticketmaster</li>`}
        <li>Accept the transfer to add the tickets to your Ticketmaster account</li>
        <li>Open the Ticketmaster app to view your tickets on game day</li>
      </ol>
    </td></tr>
  </table>
  <p style="margin:20px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    If you have any questions, contact us at <a href="mailto:support@seats.ca" style="color:#C41E3A;text-decoration:none;">support@seats.ca</a>.
  </p>`;

  return premiumWrapper({
    accentColor: "#C41E3A",
    title: "🎟️ Your Tickets Have Been Transferred!",
    subtitle: "Great news — your tickets are on the way",
    body,
  });
}

function transferConfirmedSellerHtml(meta: {
  eventTitle: string;
  venue: string;
  eventDate: string;
  section: string;
  rowName: string;
  orderRef: string;
}): string {
  const detailsRows = [
    meta.eventDate ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Date</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.eventDate}</td></tr>` : "",
    meta.venue ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Venue</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.venue}</td></tr>` : "",
    meta.section ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Section</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.section}</td></tr>` : "",
    meta.rowName ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Row</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.rowName}</td></tr>` : "",
    meta.orderRef ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;">Order Ref</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;">${meta.orderRef}</td></tr>` : "",
  ].filter(Boolean).join("");

  const body = `
  <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  ${detailsRows ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;">${detailsRows}</table>` : ""}
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#ecfdf5;border-radius:10px;border-left:4px solid #059669;">
    <tr><td style="padding:16px;">
      <p style="margin:0;color:#047857;font-size:14px;font-weight:700;">✅ Transfer Verified & Accepted</p>
      <p style="margin:8px 0 0;color:#047857;font-size:13px;line-height:1.6;">
        The buyer has received and accepted the ticket transfer. Your delivery obligation for this order is now complete.
      </p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#f8f8fa;border-radius:10px;border:1px solid #e4e4e7;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 8px;color:#18181b;font-size:14px;font-weight:700;">💳 Payout Reminder</p>
      <p style="margin:0;color:#52525b;font-size:13px;line-height:1.6;">
        Your payout will be processed two weeks after the event date, contingent on no disputes being filed.
      </p>
    </td></tr>
  </table>
  <p style="margin:20px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    Questions? <a href="mailto:support@seats.ca" style="color:#C41E3A;text-decoration:none;">support@seats.ca</a>
  </p>`;

  return premiumWrapper({
    accentColor: "#059669",
    title: "✅ Transfer Complete",
    subtitle: "The buyer has accepted your tickets",
    body,
  });
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
    meta.eventDate ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Date</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.eventDate}</td></tr>` : "",
    meta.venue ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Venue</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.venue}</td></tr>` : "",
    meta.section ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Section</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${meta.section}</td></tr>` : "",
    meta.rowName ? `<tr><td style="padding:10px 14px;color:#71717a;font-size:13px;">Row</td><td style="padding:10px 14px;color:#18181b;font-size:13px;font-weight:600;">${meta.rowName}</td></tr>` : "",
  ].filter(Boolean).join("");

  const body = `
  <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  ${detailsRows ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;">${detailsRows}</table>` : ""}
  <p style="margin:0 0 16px;color:#52525b;font-size:14px;line-height:1.6;">
    Your transfer proof for the above event has been reviewed and <strong style="color:#C41E3A;">disputed</strong> by our team. This means the uploaded screenshot could not be verified as a valid transfer.
  </p>
  ${meta.reason ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;background:#fef2f2;border-radius:10px;border-left:4px solid #ef4444;">
    <tr><td style="padding:14px 16px;"><p style="margin:0;color:#991b1b;font-size:13px;"><strong>Reason:</strong> ${meta.reason}</p></td></tr>
  </table>` : ""}
  <p style="margin:16px 0 8px;color:#18181b;font-size:14px;line-height:1.6;font-weight:600;">What to do next:</p>
  <ol style="margin:0 0 16px;padding-left:20px;color:#52525b;font-size:14px;line-height:1.8;">
    <li>Go to your <a href="https://seats.ca/reseller-dashboard?tab=transfers" style="color:#C41E3A;text-decoration:none;font-weight:600;">Seller Portal → Transfers</a></li>
    <li>Find the disputed transfer and click to re-upload a clear screenshot</li>
    <li>Ensure the screenshot shows the recipient email, event name, and seat details</li>
  </ol>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr><td align="center">
      <a href="https://seats.ca/reseller-dashboard?tab=transfers" style="display:inline-block;background:#C41E3A;color:#ffffff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 4px 14px rgba(196,30,58,0.3);">Go to Seller Portal</a>
    </td></tr>
  </table>
  <p style="margin:20px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    If you believe this is an error, please contact us at <a href="mailto:support@seats.ca" style="color:#C41E3A;text-decoration:none;">support@seats.ca</a>.
  </p>`;

  return premiumWrapper({
    accentColor: "#C41E3A",
    title: "⚠️ Transfer Disputed",
    subtitle: "Action required — please re-upload your transfer proof",
    body,
  });
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
      const unsubToken = crypto.randomUUID();
      const subject = `Your Tickets Have Been Transferred — ${eventTitle}`;
      const html = transferConfirmedHtml({ eventTitle, venue, eventDate, section, rowName });

      await supabase.from("email_unsubscribe_tokens").insert({ email: buyerProfile.email, token: unsubToken });
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
          idempotency_key: messageId,
          unsubscribe_token: unsubToken,
          label: "buyer-transfer-confirmation",
          queued_at: new Date().toISOString(),
        },
      });

      await supabase.from("notifications").insert({
        user_id: transfer.orders.user_id,
        type: "transfer_confirmation",
        title: `Tickets Transferred — ${eventTitle}`,
        body: `The seller has transferred your tickets for ${eventTitle}. Check your email for the transfer confirmation.`,
        metadata: { event_title: eventTitle, venue, transfer_id },
      });

      // --- SELLER CONFIRMATION EMAIL: notify seller that transfer was accepted ---
      const ADMIN_EMAIL = "lmksportsconsulting@gmail.com";
      const transferAlias = transfer.transfer_email_alias || "";
      const orderRefLetters = transferAlias
        ? transferAlias.replace("order-", "").replace("@inbound.seats.ca", "").toUpperCase()
        : transfer.order_id?.slice(0, 8).toUpperCase() || "N/A";

      // Always send to admin
      const sellerConfirmMsgId = crypto.randomUUID();
      const sellerConfirmUnsub = crypto.randomUUID();
      const sellerConfirmSubject = `Transfer Complete — ${eventTitle}`;
      const sellerConfirmHtml = transferConfirmedSellerHtml({
        eventTitle, venue, eventDate, section, rowName, orderRef: orderRefLetters,
      });

      await supabase.from("email_unsubscribe_tokens").insert({ email: ADMIN_EMAIL, token: sellerConfirmUnsub });
      await supabase.from("email_send_log").insert({
        message_id: sellerConfirmMsgId,
        template_name: "seller-transfer-confirmed",
        recipient_email: ADMIN_EMAIL,
        status: "pending",
      });
      await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          message_id: sellerConfirmMsgId,
          to: ADMIN_EMAIL,
          from: `LMK Sports Consulting <${FROM_EMAIL}>`,
          sender_domain: SENDER_DOMAIN,
          subject: sellerConfirmSubject,
          html: sellerConfirmHtml,
          text: sellerConfirmSubject,
          purpose: "transactional",
          idempotency_key: sellerConfirmMsgId,
          unsubscribe_token: sellerConfirmUnsub,
          label: "seller-transfer-confirmed",
          queued_at: new Date().toISOString(),
          reply_to: "Lmksportsconsulting@gmail.com",
        },
      });

      // Also email the actual reseller if different from admin
      if (transfer.seller_id) {
        const { data: confirmReseller } = await supabase
          .from("resellers")
          .select("email, user_id")
          .eq("user_id", transfer.seller_id)
          .maybeSingle();

        if (confirmReseller?.email && confirmReseller.email !== ADMIN_EMAIL) {
          const resellerMsgId = crypto.randomUUID();
          const resellerUnsub = crypto.randomUUID();
          await supabase.from("email_unsubscribe_tokens").insert({ email: confirmReseller.email, token: resellerUnsub });
          await supabase.from("email_send_log").insert({
            message_id: resellerMsgId,
            template_name: "seller-transfer-confirmed",
            recipient_email: confirmReseller.email,
            status: "pending",
          });
          await supabase.rpc("enqueue_email", {
            queue_name: "transactional_emails",
            payload: {
              message_id: resellerMsgId,
              to: confirmReseller.email,
              from: `LMK Sports Consulting <${FROM_EMAIL}>`,
              sender_domain: SENDER_DOMAIN,
              subject: sellerConfirmSubject,
              html: sellerConfirmHtml,
              text: sellerConfirmSubject,
              purpose: "transactional",
              idempotency_key: resellerMsgId,
              unsubscribe_token: resellerUnsub,
              label: "seller-transfer-confirmed",
              queued_at: new Date().toISOString(),
              reply_to: "Lmksportsconsulting@gmail.com",
            },
          });
        }

        // In-app notification to seller
        if (confirmReseller) {
          await supabase.from("notifications").insert({
            user_id: confirmReseller.user_id,
            type: "transfer_confirmed_seller",
            title: `Transfer Complete — ${eventTitle}`,
            body: `The buyer has accepted the ticket transfer for ${eventTitle} (Order Ref: ${orderRefLetters}). Your delivery is complete.`,
            metadata: { event_title: eventTitle, venue, transfer_id, order_ref: orderRefLetters },
          });
        }
      }

    } else if (transferAction === "dispute") {
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
      const unsubToken2 = crypto.randomUUID();
      const subject = `Transfer Disputed — ${eventTitle}`;
      const html = transferDisputedSellerHtml({ eventTitle, venue, eventDate, section, rowName, reason });

      await supabase.from("email_unsubscribe_tokens").insert({ email: reseller.email, token: unsubToken2 });
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
          idempotency_key: messageId,
          unsubscribe_token: unsubToken2,
          label: "seller-transfer-disputed",
          queued_at: new Date().toISOString(),
        },
      });

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