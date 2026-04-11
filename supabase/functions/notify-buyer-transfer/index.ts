import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "seats.ca";
const FROM_EMAIL = `noreply@${SENDER_DOMAIN}`;

function transferConfirmedHtml(meta: {
  eventTitle: string;
  venue: string;
  imageUrl: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#d6193d,#b81535);padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🎟️ Your Tickets Have Been Transferred!</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Great news — your tickets are on the way</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  ${meta.venue ? `<p style="margin:0 0 24px;color:#71717a;font-size:14px;">${meta.venue}</p>` : ""}
  <p style="margin:0 0 16px;color:#18181b;font-size:14px;line-height:1.6;">
    The seller has completed the ticket transfer and it has been verified by our team. Below is the transfer confirmation:
  </p>
  <div style="text-align:center;margin:24px 0;">
    <img src="${meta.imageUrl}" alt="Transfer Confirmation" style="max-width:100%;border-radius:8px;border:1px solid #e0e0e0;" />
  </div>
  <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    Please check your Ticketmaster account (or relevant platform) to accept the transfer. If you have any questions, contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a>.
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

function transferDisputedSellerHtml(meta: {
  eventTitle: string;
  venue: string;
  reason: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#d6193d,#b81535);padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">⚠️ Transfer Disputed</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Action required — please re-upload your transfer proof</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  ${meta.venue ? `<p style="margin:0 0 24px;color:#71717a;font-size:14px;">${meta.venue}</p>` : ""}
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

    // Default action is "confirm" for backward compatibility
    const transferAction = action || "confirm";

    // Get transfer details
    const { data: transfer, error: transferError } = await supabase
      .from("order_transfers")
      .select("*, orders!inner(user_id), tickets!inner(event_id)")
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
      .select("title, venue")
      .eq("id", transfer.tickets.event_id)
      .single();

    const eventTitle = event?.title || "Your Event";
    const venue = event?.venue || "";

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
        imageUrl: transfer.transfer_image_url,
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
      const html = transferDisputedSellerHtml({ eventTitle, venue, reason });

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
