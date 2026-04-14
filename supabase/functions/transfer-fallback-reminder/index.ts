import { createClient } from "npm:@supabase/supabase-js@2";

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = "noreply@seats.ca";
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo-horizontal.png";

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
        const unsubToken = crypto.randomUUID();
        const subject = `Action Needed — Accept Your Ticket Transfer for ${eventTitle}`;
        const html = fallbackReminderHtml(eventTitle);

        // Log & enqueue
        await supabase.from("email_unsubscribe_tokens").insert({ email: profile.email, token: unsubToken });

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
            idempotency_key: messageId,
            unsubscribe_token: unsubToken,
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
  const body = `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">📱 Accept Your Ticket Transfer</h1>
<p style="margin:0 0 20px;font-size:14px;color:#C41E3A;font-weight:600;font-family:'Space Grotesk',Arial,sans-serif;">Action needed — your tickets are waiting</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
  <tr><td style="padding:16px;background:#fafafa;">
    <p style="margin:0;font-size:17px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;">${eventTitle}</p>
  </td></tr>
</table>
<p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
  Your tickets have been transferred by the seller, but we haven't detected that you've received the transfer notification yet.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border-left:4px solid #f59e0b;background:#fef3c7;">
  <tr><td style="padding:16px 20px;">
    <p style="margin:0 0 8px;color:#92400e;font-size:14px;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">📋 What To Do</p>
    <ol style="margin:0;padding-left:20px;color:#92400e;font-size:13px;line-height:1.8;font-family:'Space Grotesk',Arial,sans-serif;">
      <li>Open your <strong>Ticketmaster app</strong> and check for a pending transfer</li>
      <li>Check your email (including Spam/Junk) for a transfer notification from Ticketmaster</li>
      <li>Accept the transfer to add the tickets to your account</li>
    </ol>
  </td></tr>
</table>
<p style="margin:0;color:#a1a1aa;font-size:13px;font-family:'Space Grotesk',Arial,sans-serif;">
  If you still can't find the transfer, contact us at <a href="mailto:support@seats.ca" style="color:#C41E3A;text-decoration:none;font-weight:600;">support@seats.ca</a> and we'll help you right away.
</p>`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background:#18181b;padding:28px 40px;text-align:center;"><img src="${LOGO_URL}" alt="seats.ca" width="180" style="display:block;margin:0 auto;width:180px;height:auto;" /></td></tr><tr><td style="height:3px;background:linear-gradient(90deg,#C41E3A,#d6193d,#C41E3A);"></td></tr><tr><td style="padding:32px 40px;">${body}</td></tr><tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;text-align:center;"><p style="margin:0;color:#a1a1aa;font-size:11px;font-family:'Space Grotesk',Arial,sans-serif;">© ${new Date().getFullYear()} seats.ca · Canada's No-Fee Ticket Platform</p><p style="margin:6px 0 0;color:#a1a1aa;font-size:11px;font-family:'Space Grotesk',Arial,sans-serif;">Tip: Add noreply@seats.ca to your contacts to avoid missing emails.</p></td></tr></table></td></tr></table></body></html>`;
}
