import { createClient } from "npm:@supabase/supabase-js@2";

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = "noreply@seats.ca";
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find confirmed transfers where:
    // - confirmed_at is more than 30 minutes ago
    // - forward_sent_at is null (Ticketmaster email was never relayed)
    // - fallback_sent_at is null (we haven't sent the fallback yet)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: transfers, error } = await supabase
      .from("order_transfers")
      .select("id, order_id, ticket_id")
      .eq("status", "confirmed")
      .is("forward_sent_at", null)
      .is("fallback_sent_at", null)
      .not("confirmed_at", "is", null)
      .lt("confirmed_at", thirtyMinAgo);

    if (error) {
      console.error("Error querying transfers:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    if (!transfers || transfers.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let processed = 0;

    for (const transfer of transfers) {
      try {
        // Get buyer info
        const { data: order } = await supabase
          .from("orders")
          .select("user_id")
          .eq("id", transfer.order_id)
          .single();

        if (!order) continue;

        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", order.user_id)
          .single();

        if (!profile?.email) continue;

        // Get event details for the email
        const { data: ticket } = await supabase
          .from("tickets")
          .select("event_id, section, row_name")
          .eq("id", transfer.ticket_id)
          .single();

        let eventTitle = "Your Event";
        if (ticket?.event_id) {
          const { data: event } = await supabase
            .from("events")
            .select("title")
            .eq("id", ticket.event_id)
            .single();
          if (event?.title) eventTitle = event.title;
        }

        // Build fallback email
        const messageId = crypto.randomUUID();
        const subject = `Action Needed — Accept Your Ticket Transfer for ${eventTitle}`;
        const html = fallbackReminderHtml(eventTitle);

        // Log & enqueue
        await supabase.from("email_send_log").insert({
          message_id: messageId,
          template_name: "buyer-transfer-fallback",
          recipient_email: profile.email,
          status: "pending",
        });

        await supabase.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: profile.email,
            from: `seats.ca <${FROM_EMAIL}>`,
            sender_domain: SENDER_DOMAIN,
            subject,
            html,
            text: `Your tickets for ${eventTitle} have been transferred. Please open your Ticketmaster app or check your email for a transfer notification to accept them.`,
            purpose: "transactional",
            label: "buyer-transfer-fallback",
            queued_at: new Date().toISOString(),
          },
        });

        // In-app notification
        await supabase.from("notifications").insert({
          user_id: order.user_id,
          type: "transfer_fallback",
          title: `Accept Your Tickets — ${eventTitle}`,
          body: `Your tickets for ${eventTitle} have been transferred. Please open your Ticketmaster app or check your email to accept the transfer.`,
          metadata: { event_title: eventTitle, transfer_id: transfer.id },
        });

        // Mark fallback as sent
        await supabase
          .from("order_transfers")
          .update({ fallback_sent_at: new Date().toISOString() })
          .eq("id", transfer.id);

        processed++;
      } catch (err) {
        console.error(`Error processing fallback for transfer ${transfer.id}:`, err);
      }
    }

    console.log(`Transfer fallback reminder: processed ${processed} of ${transfers.length}`);

    return new Response(JSON.stringify({ processed }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in transfer-fallback-reminder:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

function fallbackReminderHtml(eventTitle: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
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
  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">📱 Accept Your Ticket Transfer</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Action needed — your tickets are waiting</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">${eventTitle}</h2>
  <p style="margin:0 0 16px;color:#18181b;font-size:14px;line-height:1.6;">
    Your tickets have been transferred by the seller, but we haven't detected that you've received the transfer notification yet.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#fef3c7;border-radius:8px;border:1px solid #fbbf24;">
    <tr><td style="padding:16px;">
      <p style="margin:0;color:#92400e;font-size:14px;font-weight:700;">📋 What To Do</p>
      <ol style="margin:8px 0 0;padding-left:20px;color:#92400e;font-size:13px;line-height:1.8;">
        <li>Open your <strong>Ticketmaster app</strong> and check for a pending transfer</li>
        <li>Check your email (including Spam/Junk) for a transfer notification from Ticketmaster</li>
        <li>Accept the transfer to add the tickets to your account</li>
      </ol>
    </td></tr>
  </table>
  <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    If you still can't find the transfer, please contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a> and we'll help you right away.
  </p>
</td></tr>
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} seats.ca — Canada's No-Fee Ticket Platform</p>
</td></tr>
<tr><td style="padding:16px 40px;text-align:center;background:#FEF9E7;border-top:1px solid #D4AC0D;">
  <p style="margin:0;color:#7C6F1B;font-size:11px;line-height:1.5;">⚠️ If you don't see future emails from us, check your <strong>Spam</strong> or <strong>Junk</strong> folder and mark <strong>noreply@seats.ca</strong> as a safe sender.</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}
