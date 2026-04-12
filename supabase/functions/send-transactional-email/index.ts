import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "seats.ca";
const FROM_EMAIL = `noreply@${SENDER_DOMAIN}`;
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png";

// --- Date formatting helper ---
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

function shortDateForSubject(raw: string): string {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const estOffset = -5 * 60;
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    const est = new Date(utc + estOffset * 60000);
    return `${months[est.getMonth()]} ${est.getDate()}`;
  } catch {
    return "";
  }
}

// --- Email HTML builders ---

function buyerConfirmationHtml(meta: {
  eventTitle: string;
  venue: string;
  eventDate: string;
  tier: string;
  quantity: string;
  totalAmount: string;
  ticketSubtotal?: string;
  hstAmount?: string;
  membershipAmount?: string;
}): string {
  const formattedDate = formatEventDateET(meta.eventDate);
  const hasHst = meta.hstAmount && parseFloat(meta.hstAmount) > 0;
  const hasMembership = meta.membershipAmount && parseFloat(meta.membershipAmount) > 0;
  const ticketSubtotal = meta.ticketSubtotal || meta.totalAmount;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="padding:28px 40px 0;text-align:center;">
  <img src="${LOGO_URL}" alt="seats.ca" width="300" height="300" style="display:block;margin:0 auto;width:300px;height:300px;" />
</td></tr>

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#d6193d,#b81535);padding:28px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">🎟️ Order Confirmed</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Thank you for your purchase on seats.ca</p>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px 40px;">
  <h2 style="margin:0 0 20px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    ${formattedDate ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;width:120px;">Date</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${formattedDate}</td></tr>` : ""}
    ${meta.venue ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Venue</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.venue}</td></tr>` : ""}
    ${meta.tier ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Seats</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.tier}</td></tr>` : ""}
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Quantity</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.quantity}</td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fa;border-radius:8px;padding:16px;">
    <tr><td style="padding:16px;">
      <table width="100%">
        <tr>
          <td style="color:#71717a;font-size:13px;padding:4px 0;">Tickets</td>
          <td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${ticketSubtotal} CAD</td>
        </tr>
        ${hasHst ? `<tr>
          <td style="color:#71717a;font-size:13px;padding:4px 0;">LCC (13%)</td>
          <td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.hstAmount} CAD</td>
        </tr>` : ""}
        ${hasMembership ? `<tr>
          <td style="color:#71717a;font-size:13px;padding:4px 0;">Annual Membership</td>
          <td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.membershipAmount} CAD</td>
        </tr>` : ""}
        <tr>
          <td style="color:#71717a;font-size:14px;padding:8px 0 0;border-top:1px solid #e0e0e0;">Total Paid</td>
          <td align="right" style="color:#18181b;font-size:22px;font-weight:800;padding:8px 0 0;border-top:1px solid #e0e0e0;">$${meta.totalAmount} CAD</td>
        </tr>
      </table>
    </td></tr>
  </table>

  <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    Your tickets will be delivered to your email 48 hours before the event. If the seller does not upload proof of delivery within that timeline, a penalty may be assessed — even if tickets are eventually delivered. If you have any questions, please contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a>.
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} seats.ca — Canada's No-Fee Ticket Platform</p>
  <p style="margin:4px 0 0;color:#a1a1aa;font-size:11px;">All sales are final. Please review our <a href="https://seats.ca/terms" style="color:#d6193d;text-decoration:none;">Terms of Service</a>.</p>
</td></tr>
<tr><td style="padding:16px 40px;text-align:center;background:#FEF9E7;border-top:1px solid #D4AC0D;">
  <p style="margin:0;color:#7C6F1B;font-size:11px;line-height:1.5;">⚠️ If you don't see future emails from us, check your <strong>Spam</strong> or <strong>Junk</strong> folder and mark <strong>noreply@seats.ca</strong> as a safe sender.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function sellerNotificationHtml(meta: {
  eventTitle: string;
  venue: string;
  eventDate: string;
  section: string;
  rowName: string;
  salePrice: string;
  quantity: string;
  orderRef: string;
  transferEmail?: string;
}): string {
  const formattedDate = formatEventDateET(meta.eventDate);
  const qty = parseInt(meta.quantity) || 1;
  const pricePerTicket = parseFloat(meta.salePrice) || 0;
  const totalSale = (qty * pricePerTicket).toFixed(2);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="padding:28px 40px 0;text-align:center;">
  <img src="${LOGO_URL}" alt="seats.ca" width="300" height="300" style="display:block;margin:0 auto;width:300px;height:300px;" />
</td></tr>

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:28px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">💰 Ticket Sold!</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Great news — one of your listings has been purchased</p>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px 40px;">
  <h2 style="margin:0 0 20px;color:#18181b;font-size:20px;font-weight:700;">${meta.eventTitle}</h2>
  
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    ${formattedDate ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;width:120px;">Date</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${formattedDate}</td></tr>` : ""}
    ${meta.venue ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Venue</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.venue}</td></tr>` : ""}
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Section</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.section}${meta.rowName ? ` · Row ${meta.rowName}` : ""}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Quantity</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.quantity}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#71717a;font-size:13px;">Order Ref</td><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#18181b;font-size:14px;font-weight:600;">${meta.orderRef}</td></tr>
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-radius:8px;">
    <tr><td style="padding:16px;">
      <table width="100%">
        <tr>
          <td style="color:#047857;font-size:13px;padding:4px 0;">Price Per Ticket</td>
          <td align="right" style="color:#047857;font-size:14px;font-weight:600;padding:4px 0;">$${meta.salePrice} CAD</td>
        </tr>
        <tr>
          <td style="color:#047857;font-size:14px;padding:8px 0 0;border-top:1px solid #a7f3d0;">Total Sale (${meta.quantity} ticket${qty > 1 ? "s" : ""})</td>
          <td align="right" style="color:#047857;font-size:22px;font-weight:800;padding:8px 0 0;border-top:1px solid #a7f3d0;">$${totalSale} CAD</td>
        </tr>
      </table>
    </td></tr>
  </table>

  ${meta.transferEmail ? `
  <!-- Transfer Email -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#eff6ff;border-radius:8px;border:1px solid #93c5fd;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:700;">📧 Transfer Email Address</p>
      <p style="margin:0;color:#1e3a8a;font-size:16px;font-weight:700;font-family:'Courier New',monospace;background:#dbeafe;padding:10px 14px;border-radius:6px;letter-spacing:0.5px;">${meta.transferEmail}</p>
      <p style="margin:8px 0 0;color:#3b82f6;font-size:12px;line-height:1.5;">Transfer your tickets to this email address on Ticketmaster (or your ticket platform).</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;background:#dbeafe;border-radius:6px;">
        <tr><td style="padding:10px 14px;">
          <p style="margin:0 0 4px;color:#1e40af;font-size:12px;font-weight:700;">👤 Recipient Name (for Ticketmaster)</p>
          <p style="margin:0;color:#1e3a8a;font-size:15px;font-weight:700;">First Name: <span style="font-family:'Courier New',monospace;">Seats</span> &nbsp;|&nbsp; Last Name: <span style="font-family:'Courier New',monospace;">Customer</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  ` : ""}

  <!-- Step-by-step transfer guide -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#fef3c7;border-radius:8px;border:1px solid #fbbf24;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 12px;color:#92400e;font-size:14px;font-weight:700;">📤 How to Complete Your Transfer</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="color:#92400e;font-size:12px;line-height:2;padding:0;">
          <strong>1.</strong> Log in to your <a href="https://seats.ca/reseller-dashboard?tab=transfers" style="color:#d6193d;text-decoration:none;font-weight:600;">Seats.ca Seller Portal</a><br>
          <strong>2.</strong> Go to the <strong>Transfers</strong> tab<br>
          <strong>3.</strong> Locate this sale (Order Ref: ${meta.orderRef})<br>
          <strong>4.</strong> Transfer your tickets to the email shown above via Ticketmaster (or your platform)<br>
          <strong>5.</strong> Take a screenshot of the completed transfer<br>
          <strong>6.</strong> Upload the screenshot to confirm delivery
        </td></tr>
      </table>
    </td></tr>
  </table>

  <!-- CTA Button -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
    <tr><td align="center">
      <a href="https://seats.ca/reseller-dashboard?tab=transfers" style="display:inline-block;background:linear-gradient(135deg,#059669,#047857);color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">View Transfer in Seller Portal →</a>
    </td></tr>
  </table>

  <p style="margin:24px 0 0;color:#18181b;font-size:13px;line-height:1.6;font-weight:600;">
    Tickets must be delivered within, at least, 48 hours before the event.
  </p>

  <!-- Penalty & payment terms -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#fef2f2;border-radius:8px;border:1px solid #fca5a5;">
    <tr><td style="padding:16px;">
      <p style="margin:0 0 10px;color:#991b1b;font-size:12px;line-height:1.5;">
        ⚠️ Please ensure that your ticket transfer is for the noted event and seats. Ticket transfer errors are subject to Seats.ca Terms and Conditions.
      </p>
      <p style="margin:0;color:#991b1b;font-size:12px;line-height:1.5;">
        💳 Seller payments are contingent on properly transferred tickets and occur two weeks after the event. In the event of any ticket transfer errors, Seats.ca reserves the right to withhold payment to facilitate any buyer issues/complaints.
      </p>
    </td></tr>
  </table>

  <p style="margin:16px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    Questions? Contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a>.
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} seats.ca — Canada's No-Fee Ticket Platform</p>
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

    const { type, to, meta } = await req.json();

    if (!type || !to) {
      return new Response(JSON.stringify({ error: "Missing type or to" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const shortDate = shortDateForSubject(meta?.eventDate || "");
    const subjectSuffix = shortDate ? ` · ${shortDate}` : "";

    let subject: string;
    let html: string;
    let label: string;

    if (type === "buyer_confirmation") {
      subject = `Order Confirmed — ${meta.eventTitle}${subjectSuffix}`;
      html = buyerConfirmationHtml(meta);
      label = "buyer-confirmation";
    } else if (type === "seller_notification") {
      subject = `Ticket Sold — ${meta.eventTitle}${subjectSuffix}`;
      html = sellerNotificationHtml(meta);
      label = "seller-notification";
    } else {
      return new Response(JSON.stringify({ error: "Unknown email type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messageId = crypto.randomUUID();
    const isSellerEmail = type === "seller_notification";
    const displayName = isSellerEmail ? "LMK Sports Consulting" : "seats.ca";

    const { error: enqueueError } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to,
        from: `${displayName} <${FROM_EMAIL}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text: subject,
        purpose: "transactional",
        label,
        queued_at: new Date().toISOString(),
        ...(isSellerEmail ? { reply_to: "Lmksportsconsulting@gmail.com" } : {}),
      },
    });

    if (enqueueError) {
      console.error("Failed to enqueue email:", enqueueError);
      return new Response(JSON.stringify({ error: "Failed to enqueue email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, messageId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-transactional-email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
