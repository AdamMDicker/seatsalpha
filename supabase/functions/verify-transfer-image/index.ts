import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = "noreply@seats.ca";
const ADMIN_EMAIL = "lmksportsconsulting@gmail.com";
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

    // Get expected details from order
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("quantity, tickets(section, row_name, event_id, events(title, venue, event_date))")
      .eq("order_id", transfer.order_id)
      .eq("ticket_id", transfer.ticket_id)
      .maybeSingle();

    const ticket = orderItem?.tickets as any;
    const event = ticket?.events as any;

    const expectedData = {
      transferEmail: transfer.transfer_email_alias || "",
      eventTitle: event?.title || "",
      eventDate: event?.event_date || "",
      section: ticket?.section || "",
      rowName: ticket?.row_name || "",
      quantity: orderItem?.quantity || 1,
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
    "row": true/false
  },
  "overall_match": true/false,
  "confidence": "high/medium/low",
  "notes": "any additional observations"
}

IMPORTANT MATCHING RULES — be VERY lenient:
- EMAIL: Match if the local part (before @) is the same, ignore domain differences.
- EVENT: Match if the same teams are playing, regardless of format differences like "vs" vs "vs.", city names included or not (e.g. "Blue Jays vs Tigers" matches "Toronto Blue Jays vs. Detroit Tigers"), abbreviations, or word order.
- DATE: Match if it's the same calendar date. IGNORE time differences caused by timezone offsets (e.g. 19:07 ET vs 23:07 UTC are the same moment). Only flag a date mismatch if the actual calendar date is different.
- SECTION: Match if the number is the same, ignore prefixes like "Sec" or "Section".
- ROW: Match if the value is the same, ignore case or prefixes.
- QUANTITY: Match if the numbers are equal.

If all the core details (teams, date, section, row, email) refer to the same thing despite formatting differences, set overall_match to true with high confidence.`;

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

    if (isMatch) {
      // CONFIRMED - notify buyer
      if (buyerProfile?.email) {
        const detailsRows = [
          eventDate ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Date</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${eventDate}</td></tr>` : "",
          venue ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Venue</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${venue}</td></tr>` : "",
          section ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;border-bottom:1px solid #f0f0f0;">Section</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${section}</td></tr>` : "",
          rowName ? `<tr><td style="padding:8px 12px;color:#71717a;font-size:13px;">Row</td><td style="padding:8px 12px;color:#18181b;font-size:13px;font-weight:600;">${rowName}</td></tr>` : "",
        ].filter(Boolean).join("");

        const bodyContent = `
  <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">${eventTitle}</h2>
  ${detailsRows ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">${detailsRows}</table>` : ""}
  <p style="margin:0 0 16px;color:#18181b;font-size:14px;line-height:1.6;">
    Great news! The seller has transferred your tickets, and our team has verified the transfer.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#ecfdf5;border-radius:8px;border:1px solid #a7f3d0;">
    <tr><td style="padding:16px;">
      <p style="margin:0;color:#047857;font-size:14px;font-weight:700;">📋 Next Steps</p>
      <ol style="margin:8px 0 0;padding-left:20px;color:#047857;font-size:13px;line-height:1.8;">
        <li>Look for an incoming ticket transfer notification</li>
        <li>Accept the transfer to add the tickets to your Ticketmaster account</li>
      </ol>
    </td></tr>
  </table>
  <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    If you have any questions, contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a>.
  </p>`;

        const confirmedHtml = brandedEmailWrapper(
          "linear-gradient(135deg,#059669,#047857)",
          "✅",
          "Transfer Verified & Confirmed!",
          "Your tickets have been successfully transferred",
          bodyContent
        );

        const messageId = crypto.randomUUID();
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
            label: "transfer-verified-buyer",
            queued_at: new Date().toISOString(),
          },
        });
      }

      // In-app notification to buyer
      if (order?.user_id) {
        await supabase.from("notifications").insert({
          user_id: order.user_id,
          type: "transfer_confirmed",
          title: `✅ Transfer Verified — ${eventTitle}`,
          body: `Your tickets for ${eventTitle} have been verified and confirmed. Look for an incoming transfer notification and accept it to add the tickets to your Ticketmaster account.`,
          metadata: { event_title: eventTitle, venue, transfer_id },
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

      const bodyContent = `
  <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:700;">Order #${orderRef} — ${eventTitle}</h2>
  <p style="margin:0 0 16px;color:#18181b;font-size:14px;line-height:1.6;">
    The uploaded transfer proof does not match the expected order details. Mismatched fields: <strong>${mismatchDetails || "unknown"}</strong>.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#fef2f2;border-radius:8px;border:1px solid #fca5a5;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 8px;color:#991b1b;font-size:13px;font-weight:700;">Expected</p>
      <p style="margin:0;color:#991b1b;font-size:12px;line-height:1.8;">
        Email: ${expectedData.transferEmail}<br>
        Event: ${expectedData.eventTitle}<br>
        Section: ${expectedData.section} · Row: ${expectedData.rowName}<br>
        Qty: ${expectedData.quantity}
      </p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#eff6ff;border-radius:8px;border:1px solid #93c5fd;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:700;">Extracted from Screenshot</p>
      <p style="margin:0;color:#1e40af;font-size:12px;line-height:1.8;">
        Email: ${verificationResult.extracted?.email || "N/A"}<br>
        Event: ${verificationResult.extracted?.event || "N/A"}<br>
        Section: ${verificationResult.extracted?.section || "N/A"} · Row: ${verificationResult.extracted?.row || "N/A"}<br>
        Qty: ${verificationResult.extracted?.quantity || "N/A"}
      </p>
    </td></tr>
  </table>
  ${verificationResult.notes ? `<p style="margin:16px 0 0;color:#71717a;font-size:13px;"><strong>AI Notes:</strong> ${verificationResult.notes}</p>` : ""}
  <p style="margin:16px 0 0;color:#71717a;font-size:13px;">
    <a href="${transfer.transfer_image_url}" style="color:#d6193d;text-decoration:none;">View uploaded proof →</a>
  </p>`;

      const alertHtml = brandedEmailWrapper(
        "linear-gradient(135deg,#dc2626,#b91c1c)",
        "⚠️",
        "Transfer Mismatch Detected",
        "Automated verification found discrepancies",
        bodyContent
      );

      const alertMsgId = crypto.randomUUID();
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
          label: "transfer-mismatch-admin",
          queued_at: new Date().toISOString(),
        },
      });

      // In-app notification to seller
      await supabase.from("notifications").insert({
        user_id: transfer.seller_id,
        type: "transfer_disputed",
        title: `⚠️ Transfer Issue — ${eventTitle}`,
        body: `Your transfer proof for Order #${orderRef} could not be verified. Our team has been notified and will review. Mismatched: ${mismatchDetails}.`,
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
