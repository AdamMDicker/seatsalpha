import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = "noreply@seats.ca";
const ADMIN_EMAIL = "lmksportsconsulting@gmail.com";
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo-horizontal.png";
const HERO_BANNER_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/email-hero-banner.png";

function isValidAcceptLink(value: string | null | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();
    const combined = `${pathname}${url.search}`.toLowerCase();

    if (!/^https?:$/.test(url.protocol)) return false;
    if (/(^|\.)em-static-prod\.ticketmaster\.com$/.test(hostname)) return false;
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(pathname)) return false;
    if (/(\/images?\/|logo|banner|pixel|tracking)/.test(pathname)) return false;

    return hostname.includes("ticketmaster") && /(accept|invite|invites|transfer|claim|secure|tickets?)/.test(combined);
  } catch {
    return false;
  }
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

function premiumWrapper(accentColor: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="padding:0;"><img src="${HERO_BANNER_URL}" alt="Compare Every Seat. Skip Every Fee." width="560" style="display:block;width:100%;height:auto;" /></td></tr>
<tr><td style="height:3px;background:${accentColor};"></td></tr>
<tr><td style="padding:32px 40px;">
${bodyContent}
</td></tr>
<tr><td style="padding:20px 40px;text-align:center;border-top:1px solid #f0f0f0;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;font-family:'Space Grotesk',Arial,sans-serif;">© ${new Date().getFullYear()} seats.ca · Canada's No-Fee Ticket Platform</p>
  <p style="margin:6px 0 0;color:#a1a1aa;font-size:11px;font-family:'Space Grotesk',Arial,sans-serif;">Tip: Add noreply@seats.ca to your contacts to avoid missing emails.</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { transfer_id } = await req.json();
    if (!transfer_id) {
      return new Response(JSON.stringify({ error: "Missing transfer_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get transfer + order + ticket + event details
    const { data: transfer, error: tErr } = await supabase
      .from("order_transfers")
      .select("*")
      .eq("id", transfer_id)
      .single();

    if (tErr || !transfer) {
      return new Response(JSON.stringify({ error: "Transfer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!transfer.transfer_image_url) {
      return new Response(JSON.stringify({ error: "No image uploaded yet" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fetch seller profile + event title up front so we can notify the seller
    //    at three checkpoints (received → verified | disputed)
    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", transfer.seller_id)
      .single();

    const { data: ticketForEvent } = await supabase
      .from("tickets")
      .select("event_id, section, row_name, events(title)")
      .eq("id", transfer.ticket_id)
      .single();

    const sellerEventTitle = (ticketForEvent?.events as any)?.title || "Your Event";
    const sellerSection = (ticketForEvent as any)?.section || "";
    const sellerRow = (ticketForEvent as any)?.row_name || "";
    const sellerOrderRef = transfer.transfer_email_alias
      ? transfer.transfer_email_alias.replace("order-", "").replace("@inbound.seats.ca", "").toUpperCase()
      : transfer.order_id.slice(0, 8).toUpperCase();

    // ── 1) UPLOAD RECEIVED — seller email + in-app notification ──
    if (sellerProfile?.email) {
      const receivedHtml = premiumWrapper(
        "linear-gradient(90deg,#3b82f6,#1d4ed8,#3b82f6)",
        `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">📥 Upload Received</h1>
<p style="margin:0 0 20px;font-size:14px;color:#1d4ed8;font-weight:600;font-family:'Space Grotesk',Arial,sans-serif;">Order #${sellerOrderRef} — verification in progress</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
  <tr><td style="padding:16px;background:#fafafa;">
    <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;">${sellerEventTitle}</p>
    ${(sellerSection || sellerRow) ? `<p style="margin:0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">${sellerSection ? `Section ${sellerSection}` : ""}${sellerSection && sellerRow ? " · " : ""}${sellerRow ? `Row ${sellerRow}` : ""}</p>` : ""}
  </td></tr>
</table>
<p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
  We've received your transfer screenshot. Our AI is verifying it now — you'll get another email within a minute with the result.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;border-radius:12px;overflow:hidden;border-left:4px solid #3b82f6;background:#eff6ff;">
  <tr><td style="padding:14px 18px;">
    <p style="margin:0;color:#1e40af;font-size:13px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">No action needed right now. We'll alert you immediately if anything looks off.</p>
  </td></tr>
</table>`
      );

      const receivedMsgId = crypto.randomUUID();
      const receivedUnsub = crypto.randomUUID();
      await supabase.from("email_unsubscribe_tokens").insert({ email: sellerProfile.email, token: receivedUnsub });
      await supabase.from("email_send_log").insert({
        message_id: receivedMsgId,
        template_name: "seller-upload-received",
        recipient_email: sellerProfile.email,
        status: "pending",
      });
      await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          message_id: receivedMsgId,
          to: sellerProfile.email,
          from: `seats.ca <${FROM_EMAIL}>`,
          sender_domain: SENDER_DOMAIN,
          subject: `📥 Upload Received — Order #${sellerOrderRef} (${sellerEventTitle})`,
          html: receivedHtml,
          text: `We've received your transfer screenshot for Order #${sellerOrderRef} (${sellerEventTitle}). AI verification in progress.`,
          purpose: "transactional",
          idempotency_key: `seller-upload-received-${transfer_id}-${transfer.uploaded_at || ""}`,
          unsubscribe_token: receivedUnsub,
          label: "seller-upload-received",
          queued_at: new Date().toISOString(),
        },
      });

      await supabase.from("notifications").insert({
        user_id: transfer.seller_id,
        type: "transfer_upload_received",
        title: `📥 Upload Received — ${sellerEventTitle}`,
        body: `We've received your transfer proof for Order #${sellerOrderRef}. Verification is in progress.`,
        metadata: { event_title: sellerEventTitle, transfer_id, order_ref: sellerOrderRef },
      });
    }

    // Get expected details from order
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("quantity, tickets(section, row_name, event_id, events(title, venue, event_date))")
      .eq("order_id", transfer.order_id)
      .eq("ticket_id", transfer.ticket_id)
      .maybeSingle();

    const ticket = orderItem?.tickets as any;
    const event = ticket?.events as any;

    const expectedQuantity = transfer.expected_quantity || orderItem?.quantity || 1;

    const expectedData = {
      transferEmail: transfer.transfer_email_alias || "",
      eventTitle: event?.title || "",
      eventDate: event?.event_date || "",
      section: ticket?.section || "",
      rowName: ticket?.row_name || "",
      quantity: expectedQuantity,
    };

    // Call AI to analyze the screenshot
    const prompt = `You are analyzing a screenshot of a completed ticket transfer from Ticketmaster or a similar platform.

Extract the following information from the screenshot:
1. The recipient email address the tickets were transferred to
2. The event name
3. The event date
4. The section number/name
5. The row number/name
6. The number of tickets transferred

Then compare with the expected details:
- Expected transfer email: ${expectedData.transferEmail}
- Expected event: ${expectedData.eventTitle}
- Expected date: ${expectedData.eventDate}
- Expected section: ${expectedData.section}
- Expected row: ${expectedData.rowName}
- Expected quantity: ${expectedData.quantity}

Respond with a JSON object (no markdown, just raw JSON):
{
  "extracted": {
    "email": "extracted email or null",
    "event": "extracted event name or null",
    "date": "extracted date or null",
    "section": "extracted section or null",
    "row": "extracted row or null",
    "quantity": "extracted quantity or null"
  },
  "matches": {
    "email": true/false,
    "event": true/false,
    "section": true/false,
    "row": true/false,
    "quantity": true/false
  },
  "overall_match": true/false,
  "confidence": "high/medium/low",
  "notes": "any additional observations"
}

IMPORTANT MATCHING RULES — be lenient on formatting, STRICT on quantity:
- EMAIL: Match if the local part (before @) is the same, ignore domain differences.
- EVENT: Match if the same teams are playing, regardless of format differences like "vs" vs "vs.", city names included or not (e.g. "Blue Jays vs Tigers" matches "Toronto Blue Jays vs. Detroit Tigers"), abbreviations, or word order.
- DATE: Match if it's the same calendar date. IGNORE time differences caused by timezone offsets (e.g. 19:07 ET vs 23:07 UTC are the same moment). Only flag a date mismatch if the actual calendar date is different.
- SECTION: Match if the number is the same, ignore prefixes like "Sec" or "Section".
- ROW: Match if the value is the same, ignore case or prefixes.
- QUANTITY: HARD MATCH — the extracted number of tickets transferred MUST exactly equal the expected quantity (${expectedData.quantity}). If extracted is greater OR less than expected, set quantity match to false.

CRITICAL: If quantity does NOT match exactly, set overall_match to false regardless of other fields. Quantity mismatch is always a dispute.

If all the core details (teams, date, section, row, email, quantity) refer to the same thing, set overall_match to true with high confidence.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: transfer.transfer_image_url },
              },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      await supabase
        .from("order_transfers")
        .update({
          verification_result: { error: "AI verification unavailable", status: aiResponse.status },
        })
        .eq("id", transfer_id);

      return new Response(JSON.stringify({ success: true, verified: false, reason: "AI unavailable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response (strip markdown fences if present)
    let verificationResult: any;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      verificationResult = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      verificationResult = { overall_match: false, notes: "Could not parse AI response", raw: content };
    }

    // Server-side hard enforcement: quantity mismatch is ALWAYS a dispute
    const extractedQty = parseInt(String(verificationResult?.extracted?.quantity ?? ""), 10);
    const expectedQty = expectedData.quantity;
    if (Number.isFinite(extractedQty) && extractedQty !== expectedQty) {
      verificationResult.overall_match = false;
      verificationResult.matches = { ...(verificationResult.matches || {}), quantity: false };
      verificationResult.notes = `Quantity mismatch: seller transferred ${extractedQty} ticket(s), buyer purchased ${expectedQty}. ${verificationResult.notes || ""}`.trim();
    }

    // Update transfer with verification result
    const isMatch = verificationResult.overall_match === true;
    const newStatus = isMatch ? "confirmed" : "disputed";

    await supabase
      .from("order_transfers")
      .update({
        status: newStatus,
        verification_result: verificationResult,
        ...(isMatch ? { confirmed_at: new Date().toISOString() } : {}),
      })
      .eq("id", transfer_id);

    // Get buyer info for notifications
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", transfer.order_id)
      .single();

    const { data: buyerProfile } = order
      ? await supabase.from("profiles").select("email, full_name").eq("user_id", order.user_id).single()
      : { data: null };

    const eventTitle = event?.title || "Your Event";
    const venue = event?.venue || "";
    const eventDate = event?.event_date ? formatEventDateET(event.event_date) : "";
    const section = ticket?.section || "";
    const rowName = ticket?.row_name || "";
    const quantity = expectedQuantity;

    if (isMatch) {
      // ── Auto-release the buyer accept link if Ticketmaster already sent it ──
      // (Inbound webhook stores accept_link without forwarding when proof isn't uploaded yet.)
      let didForwardNow = false;
      if (isValidAcceptLink(transfer.accept_link) && !transfer.forward_sent_at) {
        try {
          console.log(`Auto-releasing accept link to buyer for transfer ${transfer_id}`);
          await supabase.functions.invoke("resolve-transfer-email", {
            body: { transfer_id },
          });
          didForwardNow = true;
        } catch (relayErr) {
          console.error("Failed to auto-release accept link:", relayErr);
        }
      }

      // Only notify the buyer that their tickets are "confirmed" if the actual
      // Ticketmaster accept link has been forwarded to them. Otherwise the email
      // is misleading — the screenshot passed AI checks but the seller still
      // hasn't actually transferred the tickets via Ticketmaster yet.
      const linkAlreadyForwarded = !!transfer.forward_sent_at;
      const shouldNotifyBuyer = linkAlreadyForwarded || didForwardNow;

      // CONFIRMED - notify buyer (only if we've actually forwarded the accept link)
      if (shouldNotifyBuyer && buyerProfile?.email) {
        const detailsRows = [
          eventDate ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Date</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${eventDate}</td></tr>` : "",
          venue ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Venue</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${venue}</td></tr>` : "",
          section ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Section</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${section}</td></tr>` : "",
          rowName ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;">Row</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;">${rowName}</td></tr>` : "",
        ].filter(Boolean).join("");

        const bodyContent = `
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">✅ Transfer Verified</h1>
  <p style="margin:0 0 20px;font-size:14px;color:#059669;font-weight:600;font-family:'Space Grotesk',Arial,sans-serif;">Your tickets have been confirmed</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
    <tr><td style="padding:16px;background:#fafafa;">
      <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;">${eventTitle}</p>
      ${eventDate ? `<p style="margin:0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">${eventDate}</p>` : ""}
    </td></tr>
    ${venue || section || rowName || quantity ? `<tr><td style="padding:12px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${venue ? `<tr><td style="padding:4px 0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">Venue</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;font-family:'Space Grotesk',Arial,sans-serif;">${venue}</td></tr>` : ""}
        ${section ? `<tr><td style="padding:4px 0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">Section</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;font-family:'Space Grotesk',Arial,sans-serif;">${section}</td></tr>` : ""}
        ${rowName ? `<tr><td style="padding:4px 0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">Row</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;font-family:'Space Grotesk',Arial,sans-serif;">${rowName}</td></tr>` : ""}
        <tr><td style="padding:4px 0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">Quantity</td><td style="padding:4px 0;font-size:13px;font-weight:700;color:#059669;text-align:right;font-family:'Space Grotesk',Arial,sans-serif;">${quantity} ticket${quantity === 1 ? "" : "s"}</td></tr>
      </table>
    </td></tr>` : ""}
  </table>
  <p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
    Great news! The seller has transferred your tickets, and our team has verified the transfer.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border-left:4px solid #059669;background:#f0fdf4;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0 0 8px;color:#047857;font-size:14px;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">📋 Next Steps</p>
      <ol style="margin:0;padding-left:20px;color:#047857;font-size:13px;line-height:1.8;font-family:'Space Grotesk',Arial,sans-serif;">
        <li>Look for an incoming ticket transfer notification</li>
        <li>Accept the transfer to add the tickets to your Ticketmaster account</li>
      </ol>
    </td></tr>
  </table>
  <p style="margin:0;color:#a1a1aa;font-size:13px;font-family:'Space Grotesk',Arial,sans-serif;">
    If you have any questions, contact us at <a href="mailto:support@seats.ca" style="color:#C41E3A;text-decoration:none;font-weight:600;">support@seats.ca</a>.
  </p>`;

        const confirmedHtml = premiumWrapper("linear-gradient(90deg,#059669,#047857,#059669)", bodyContent);

        const messageId = crypto.randomUUID();
        const unsubToken = crypto.randomUUID();
        await supabase.from("email_unsubscribe_tokens").insert({ email: buyerProfile.email, token: unsubToken });
        await supabase.from("email_send_log").insert({
          message_id: messageId,
          template_name: "transfer-verified-buyer",
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
            subject: `✅ Transfer Verified — ${eventTitle}`,
            html: confirmedHtml,
            text: `Your tickets for ${eventTitle} have been verified and confirmed.`,
            purpose: "transactional",
            idempotency_key: messageId,
            unsubscribe_token: unsubToken,
            label: "transfer-verified-buyer",
            queued_at: new Date().toISOString(),
          },
        });
      }

      // In-app notification to buyer (also gated on actual link forwarding)
      if (shouldNotifyBuyer && order?.user_id) {
        await supabase.from("notifications").insert({
          user_id: order.user_id,
          type: "transfer_confirmed",
          title: `✅ Transfer Verified — ${eventTitle}`,
          body: `Your tickets for ${eventTitle} have been verified and confirmed. Look for an incoming transfer notification and accept it to add the tickets to your Ticketmaster account.`,
          metadata: { event_title: eventTitle, venue, transfer_id },
        });
      }

      // ── 2a) VERIFIED — seller email + in-app notification ──
      if (sellerProfile?.email) {
        const verifiedSellerHtml = premiumWrapper(
          "linear-gradient(90deg,#059669,#047857,#059669)",
          `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">✅ Transfer Verified</h1>
<p style="margin:0 0 20px;font-size:14px;color:#059669;font-weight:600;font-family:'Space Grotesk',Arial,sans-serif;">Order #${sellerOrderRef} — payout on track</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
  <tr><td style="padding:16px;background:#fafafa;">
    <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;">${sellerEventTitle}</p>
    ${(sellerSection || sellerRow) ? `<p style="margin:0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">${sellerSection ? `Section ${sellerSection}` : ""}${sellerSection && sellerRow ? " · " : ""}${sellerRow ? `Row ${sellerRow}` : ""}</p>` : ""}
  </td></tr>
</table>
<p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
  Your transfer screenshot passed AI verification. The buyer has been notified and will accept the transfer in their Ticketmaster account.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;border-radius:12px;overflow:hidden;border-left:4px solid #059669;background:#f0fdf4;">
  <tr><td style="padding:14px 18px;">
    <p style="margin:0;color:#047857;font-size:13px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">No further action needed. You're done with this order.</p>
  </td></tr>
</table>`
        );

        const verSellerMsgId = crypto.randomUUID();
        const verSellerUnsub = crypto.randomUUID();
        await supabase.from("email_unsubscribe_tokens").insert({ email: sellerProfile.email, token: verSellerUnsub });
        await supabase.from("email_send_log").insert({
          message_id: verSellerMsgId,
          template_name: "seller-transfer-verified",
          recipient_email: sellerProfile.email,
          status: "pending",
        });
        await supabase.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: verSellerMsgId,
            to: sellerProfile.email,
            from: `seats.ca <${FROM_EMAIL}>`,
            sender_domain: SENDER_DOMAIN,
            subject: `✅ Transfer Verified — Order #${sellerOrderRef} (${sellerEventTitle})`,
            html: verifiedSellerHtml,
            text: `Your transfer for Order #${sellerOrderRef} (${sellerEventTitle}) was verified. The buyer has been notified.`,
            purpose: "transactional",
            idempotency_key: `seller-verified-${transfer_id}`,
            unsubscribe_token: verSellerUnsub,
            label: "seller-transfer-verified",
            queued_at: new Date().toISOString(),
          },
        });

        await supabase.from("notifications").insert({
          user_id: transfer.seller_id,
          type: "transfer_verified_seller",
          title: `✅ Transfer Verified — ${sellerEventTitle}`,
          body: `Your transfer proof for Order #${sellerOrderRef} passed verification. The buyer has been notified.`,
          metadata: { event_title: sellerEventTitle, transfer_id, order_ref: sellerOrderRef },
        });
      }
    } else {
      // DISPUTED - alert admin
      const mismatchDetails = Object.entries(verificationResult.matches || {})
        .filter(([_, v]) => v === false)
        .map(([k]) => k)
        .join(", ");

      // Use the letters-only alias as order ref
      const orderRef = transfer.transfer_email_alias
        ? transfer.transfer_email_alias.replace("order-", "").replace("@inbound.seats.ca", "").toUpperCase()
        : transfer.order_id.slice(0, 8).toUpperCase();

      const disputeBody = `
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">⚠️ Transfer Mismatch</h1>
  <p style="margin:0 0 20px;font-size:14px;color:#dc2626;font-weight:600;font-family:'Space Grotesk',Arial,sans-serif;">Order #${orderRef} — ${eventTitle}</p>
  <p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
    The uploaded transfer proof does not match expected order details. Mismatched fields: <strong style="color:#dc2626;">${mismatchDetails || "unknown"}</strong>.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;border-radius:12px;overflow:hidden;border-left:4px solid #dc2626;background:#fef2f2;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0 0 8px;color:#991b1b;font-size:13px;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">Expected</p>
      <p style="margin:0;color:#991b1b;font-size:12px;line-height:1.8;font-family:'Space Grotesk',Arial,sans-serif;">
        Email: ${expectedData.transferEmail}<br>
        Event: ${expectedData.eventTitle}<br>
        Section: ${expectedData.section} · Row: ${expectedData.rowName}<br>
        Qty: ${expectedData.quantity}
      </p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-radius:12px;overflow:hidden;border-left:4px solid #3b82f6;background:#eff6ff;">
    <tr><td style="padding:16px 20px;">
      <p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">Extracted from Screenshot</p>
      <p style="margin:0;color:#1e40af;font-size:12px;line-height:1.8;font-family:'Space Grotesk',Arial,sans-serif;">
        Email: ${verificationResult.extracted?.email || "N/A"}<br>
        Event: ${verificationResult.extracted?.event || "N/A"}<br>
        Section: ${verificationResult.extracted?.section || "N/A"} · Row: ${verificationResult.extracted?.row || "N/A"}<br>
        Qty: ${verificationResult.extracted?.quantity || "N/A"}
      </p>
    </td></tr>
  </table>
  ${verificationResult.notes ? `<p style="margin:0 0 12px;color:#71717a;font-size:13px;font-family:'Space Grotesk',Arial,sans-serif;"><strong>Seats.ca Customer Service Note:</strong> ${verificationResult.notes}</p>` : ""}
  <p style="margin:0;font-size:13px;font-family:'Space Grotesk',Arial,sans-serif;">
    <a href="${transfer.transfer_image_url}" style="color:#C41E3A;text-decoration:none;font-weight:600;">View uploaded proof →</a>
  </p>`;

      const alertHtml = premiumWrapper("linear-gradient(90deg,#dc2626,#b91c1c,#dc2626)", disputeBody);

      const alertMsgId = crypto.randomUUID();
      const adminUnsubToken = crypto.randomUUID();
      await supabase.from("email_unsubscribe_tokens").insert({ email: ADMIN_EMAIL, token: adminUnsubToken });
      await supabase.from("email_send_log").insert({
        message_id: alertMsgId,
        template_name: "transfer-mismatch-admin",
        recipient_email: ADMIN_EMAIL,
        status: "pending",
      });
      await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          message_id: alertMsgId,
          to: ADMIN_EMAIL,
          from: `seats.ca <${FROM_EMAIL}>`,
          sender_domain: SENDER_DOMAIN,
          subject: `⚠️ Transfer Mismatch — Order #${orderRef} — ${eventTitle}`,
          html: alertHtml,
          text: `Transfer mismatch detected for Order #${orderRef}. Mismatched: ${mismatchDetails}`,
           purpose: "transactional",
          idempotency_key: alertMsgId,
          unsubscribe_token: adminUnsubToken,
          label: "transfer-mismatch-admin",
          queued_at: new Date().toISOString(),
        },
      });

      // ── 2b) DISPUTED — seller email with mismatch details ──
      if (sellerProfile?.email) {
        const disputeSellerHtml = premiumWrapper(
          "linear-gradient(90deg,#dc2626,#b91c1c,#dc2626)",
          `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">⚠️ Transfer Verification Failed</h1>
<p style="margin:0 0 20px;font-size:14px;color:#dc2626;font-weight:600;font-family:'Space Grotesk',Arial,sans-serif;">Order #${orderRef} — action required</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
  <tr><td style="padding:16px;background:#fafafa;">
    <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;">${eventTitle}</p>
    ${(section || rowName) ? `<p style="margin:0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">${section ? `Section ${section}` : ""}${section && rowName ? " · " : ""}${rowName ? `Row ${rowName}` : ""}</p>` : ""}
  </td></tr>
</table>
<p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.6;font-family:'Space Grotesk',Arial,sans-serif;">
  Your uploaded screenshot didn't match the expected order details. Mismatched fields: <strong style="color:#dc2626;">${mismatchDetails || "unknown"}</strong>.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;border-radius:12px;overflow:hidden;border-left:4px solid #dc2626;background:#fef2f2;">
  <tr><td style="padding:16px 20px;">
    <p style="margin:0 0 8px;color:#991b1b;font-size:13px;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">Expected</p>
    <p style="margin:0;color:#991b1b;font-size:12px;line-height:1.8;font-family:'Space Grotesk',Arial,sans-serif;">
      Email: ${expectedData.transferEmail}<br>
      Event: ${expectedData.eventTitle}<br>
      Section: ${expectedData.section} · Row: ${expectedData.rowName}<br>
      Qty: ${expectedData.quantity}
    </p>
  </td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-radius:12px;overflow:hidden;border-left:4px solid #3b82f6;background:#eff6ff;">
  <tr><td style="padding:16px 20px;">
    <p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">What we extracted from your screenshot</p>
    <p style="margin:0;color:#1e40af;font-size:12px;line-height:1.8;font-family:'Space Grotesk',Arial,sans-serif;">
      Email: ${verificationResult.extracted?.email || "N/A"}<br>
      Event: ${verificationResult.extracted?.event || "N/A"}<br>
      Section: ${verificationResult.extracted?.section || "N/A"} · Row: ${verificationResult.extracted?.row || "N/A"}<br>
      Qty: ${verificationResult.extracted?.quantity || "N/A"}
    </p>
  </td></tr>
</table>
${verificationResult.notes ? `<p style="margin:0 0 12px;color:#71717a;font-size:13px;font-family:'Space Grotesk',Arial,sans-serif;"><strong>Note:</strong> ${verificationResult.notes}</p>` : ""}
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-radius:12px;overflow:hidden;border-left:4px solid #f59e0b;background:#fef3c7;">
  <tr><td style="padding:16px 20px;">
    <p style="margin:0 0 8px;color:#92400e;font-size:13px;font-weight:700;font-family:'Space Grotesk',Arial,sans-serif;">📋 What To Do</p>
    <ol style="margin:0;padding-left:20px;color:#92400e;font-size:13px;line-height:1.8;font-family:'Space Grotesk',Arial,sans-serif;">
      <li>Re-check that you transferred to <strong>${expectedData.transferEmail}</strong></li>
      <li>Open your seller dashboard and re-upload a clearer screenshot showing the correct details</li>
      <li>If the transfer was correct, our team will review and reach out — no further action needed</li>
    </ol>
  </td></tr>
</table>
<p style="margin:0;color:#a1a1aa;font-size:13px;font-family:'Space Grotesk',Arial,sans-serif;">
  Questions? Email <a href="mailto:support@seats.ca" style="color:#C41E3A;text-decoration:none;font-weight:600;">support@seats.ca</a>.
</p>`
        );

        const disSellerMsgId = crypto.randomUUID();
        const disSellerUnsub = crypto.randomUUID();
        await supabase.from("email_unsubscribe_tokens").insert({ email: sellerProfile.email, token: disSellerUnsub });
        await supabase.from("email_send_log").insert({
          message_id: disSellerMsgId,
          template_name: "seller-transfer-disputed",
          recipient_email: sellerProfile.email,
          status: "pending",
        });
        await supabase.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: disSellerMsgId,
            to: sellerProfile.email,
            from: `seats.ca <${FROM_EMAIL}>`,
            sender_domain: SENDER_DOMAIN,
            subject: `⚠️ Verification Failed — Order #${orderRef} (${eventTitle})`,
            html: disputeSellerHtml,
            text: `Your transfer for Order #${orderRef} (${eventTitle}) failed verification. Mismatched: ${mismatchDetails}. Re-upload a clearer screenshot from your seller dashboard.`,
            purpose: "transactional",
            idempotency_key: `seller-disputed-${transfer_id}-${transfer.uploaded_at || ""}`,
            unsubscribe_token: disSellerUnsub,
            label: "seller-transfer-disputed",
            queued_at: new Date().toISOString(),
          },
        });
      }

      // In-app notification to seller
      await supabase.from("notifications").insert({
        user_id: transfer.seller_id,
        type: "transfer_disputed",
        title: `⚠️ Transfer Issue — ${eventTitle}`,
        body: `Your transfer proof for Order #${orderRef} could not be verified. Mismatched: ${mismatchDetails}. Please re-upload from your seller dashboard.`,
        metadata: { event_title: eventTitle, transfer_id, mismatched_fields: mismatchDetails },
      });
    }

    return new Response(JSON.stringify({ success: true, verified: isMatch, result: verificationResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in verify-transfer-image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
