import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = "noreply@seats.ca";
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo-horizontal.png";
const HERO_BANNER_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/email-hero-banner.png";

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

// --- Premium email wrapper ---
function premiumWrapper(accentColor: string, bodyContent: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);"><tr><td style="background:#18181b;padding:28px 40px;text-align:center;"><img src="${LOGO_URL}" alt="seats.ca" width="180" style="display:block;margin:0 auto;width:180px;height:auto;" /></td></tr><tr><td style="height:3px;background:${accentColor};"></td></tr><tr><td style="padding:32px 40px;">${bodyContent}</td></tr><tr><td style="padding:20px 40px;border-top:1px solid #f0f0f0;text-align:center;"><p style="margin:0;color:#a1a1aa;font-size:11px;font-family:'Space Grotesk',Arial,sans-serif;">© ${new Date().getFullYear()} seats.ca · Canada's No-Fee Ticket Platform</p><p style="margin:6px 0 0;color:#a1a1aa;font-size:11px;font-family:'Space Grotesk',Arial,sans-serif;">Tip: Add noreply@seats.ca to your contacts to avoid missing emails.</p></td></tr></table></td></tr></table></body></html>`;
}

function buyerConfirmationHtml(meta: {
  eventTitle: string; venue: string; eventDate: string; tier: string; quantity: string; totalAmount: string; ticketSubtotal?: string; hstAmount?: string; membershipAmount?: string;
}): string {
  const formattedDate = formatEventDateET(meta.eventDate);
  const hasHst = meta.hstAmount && parseFloat(meta.hstAmount) > 0;
  const hasMembership = meta.membershipAmount && parseFloat(meta.membershipAmount) > 0;
  const ticketSubtotal = meta.ticketSubtotal || meta.totalAmount;
  const body = `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">🎟️ Order Confirmed</h1><p style="margin:0 0 20px;font-size:14px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">Thank you for your purchase on seats.ca</p><table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;"><tr><td style="padding:16px;background:#fafafa;"><p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;">${meta.eventTitle}</p>${formattedDate ? `<p style="margin:0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">${formattedDate}</p>` : ""}</td></tr><tr><td style="padding:12px 16px;"><table width="100%" cellpadding="0" cellspacing="0">${meta.venue ? `<tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Venue</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;">${meta.venue}</td></tr>` : ""}${meta.tier ? `<tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Seats</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;">${meta.tier}</td></tr>` : ""}<tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Quantity</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;">${meta.quantity}</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fa;border-radius:12px;border:1px solid #e4e4e7;"><tr><td style="padding:16px;"><table width="100%"><tr><td style="color:#71717a;font-size:13px;padding:4px 0;">Tickets</td><td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${ticketSubtotal} CAD</td></tr>${hasHst ? `<tr><td style="color:#71717a;font-size:13px;padding:4px 0;">LCC (13%)</td><td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.hstAmount} CAD</td></tr>` : ""}${hasMembership ? `<tr><td style="color:#71717a;font-size:13px;padding:4px 0;">Annual Membership</td><td align="right" style="color:#18181b;font-size:14px;font-weight:600;padding:4px 0;">$${meta.membershipAmount} CAD</td></tr>` : ""}<tr><td style="color:#18181b;font-size:14px;padding:10px 0 0;border-top:1px solid #e0e0e0;font-weight:600;">Total Paid</td><td align="right" style="color:#C41E3A;font-size:22px;font-weight:800;padding:10px 0 0;border-top:1px solid #e0e0e0;">$${meta.totalAmount} CAD</td></tr></table></td></tr></table><p style="margin:20px 0 0;color:#71717a;font-size:13px;line-height:1.6;">Your tickets will be delivered to your email 48 hours before the event. Questions? <a href="mailto:support@seats.ca" style="color:#C41E3A;text-decoration:none;font-weight:600;">support@seats.ca</a>.</p><p style="margin:12px 0 0;color:#a1a1aa;font-size:11px;">All sales are final. <a href="https://seats.ca/terms" style="color:#C41E3A;text-decoration:none;">Terms of Service</a>.</p>`;
  return premiumWrapper("linear-gradient(90deg,#C41E3A,#d6193d,#C41E3A)", body);
}

function sellerNotificationHtml(meta: {
  eventTitle: string; venue: string; eventDate: string; section: string; rowName: string; salePrice: string; quantity: string; orderRef: string; transferEmail?: string;
}): string {
  const formattedDate = formatEventDateET(meta.eventDate);
  const qty = parseInt(meta.quantity) || 1;
  const pricePerTicket = parseFloat(meta.salePrice) || 0;
  const totalSale = (qty * pricePerTicket).toFixed(2);
  const body = `<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;letter-spacing:-0.5px;">💰 Ticket Sold!</h1><p style="margin:0 0 20px;font-size:14px;color:#059669;font-weight:600;font-family:'Space Grotesk',Arial,sans-serif;">One of your listings has been purchased</p><table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;"><tr><td style="padding:16px;background:#fafafa;"><p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#18181b;font-family:'Space Grotesk',Arial,sans-serif;">${meta.eventTitle}</p>${formattedDate ? `<p style="margin:0;font-size:13px;color:#71717a;font-family:'Space Grotesk',Arial,sans-serif;">${formattedDate}</p>` : ""}</td></tr><tr><td style="padding:12px 16px;"><table width="100%" cellpadding="0" cellspacing="0">${meta.venue ? `<tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Venue</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;">${meta.venue}</td></tr>` : ""}<tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Section</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;">${meta.section}${meta.rowName ? ` · Row ${meta.rowName}` : ""}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Qty</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;">${meta.quantity}</td></tr><tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Order Ref</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#18181b;text-align:right;">${meta.orderRef}</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-radius:12px;border:1px solid #bbf7d0;"><tr><td style="padding:16px;"><table width="100%"><tr><td style="color:#047857;font-size:13px;padding:4px 0;">Price Per Ticket</td><td align="right" style="color:#047857;font-size:14px;font-weight:600;padding:4px 0;">$${meta.salePrice} CAD</td></tr><tr><td style="color:#047857;font-size:14px;padding:10px 0 0;border-top:1px solid #a7f3d0;font-weight:600;">Total Sale (${meta.quantity} ticket${qty > 1 ? "s" : ""})</td><td align="right" style="color:#047857;font-size:22px;font-weight:800;padding:10px 0 0;border-top:1px solid #a7f3d0;">$${totalSale} CAD</td></tr></table></td></tr></table>${meta.transferEmail ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-radius:12px;overflow:hidden;border-left:4px solid #3b82f6;background:#eff6ff;"><tr><td style="padding:16px 20px;"><p style="margin:0 0 8px;color:#1e40af;font-size:13px;font-weight:700;">📧 Transfer Email Address</p><p style="margin:0;color:#1e3a8a;font-size:15px;font-weight:700;font-family:'Courier New',monospace;background:#dbeafe;padding:10px 14px;border-radius:8px;letter-spacing:0.5px;">${meta.transferEmail}</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;background:#dbeafe;border-radius:8px;"><tr><td style="padding:10px 14px;"><p style="margin:0 0 4px;color:#1e40af;font-size:12px;font-weight:700;">👤 Recipient Name (for Ticketmaster)</p><p style="margin:0;color:#1e3a8a;font-size:14px;font-weight:700;">First Name: <span style="font-family:'Courier New',monospace;">Seats</span> &nbsp;|&nbsp; Last Name: <span style="font-family:'Courier New',monospace;">${meta.orderRef}</span></p></td></tr></table></td></tr></table>` : ""}<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-radius:12px;overflow:hidden;border-left:4px solid #f59e0b;background:#fef3c7;"><tr><td style="padding:16px 20px;"><p style="margin:0 0 10px;color:#92400e;font-size:14px;font-weight:700;">📤 How to Complete Your Transfer</p><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="color:#92400e;font-size:12px;line-height:2;padding:0;"><strong>1.</strong> Log in to your <a href="https://seats.ca/reseller-dashboard?tab=transfers" style="color:#C41E3A;text-decoration:none;font-weight:600;">Seller Portal</a><br><strong>2.</strong> Go to <strong>Transfers</strong> tab<br><strong>3.</strong> Locate sale (Order Ref: ${meta.orderRef})<br><strong>4.</strong> Transfer tickets to the email above<br><strong>5.</strong> Screenshot the completed transfer<br><strong>6.</strong> Upload screenshot to confirm delivery</td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;"><tr><td align="center"><a href="https://seats.ca/reseller-dashboard?tab=transfers" style="display:inline-block;background:#059669;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:50px;text-decoration:none;box-shadow:0 4px 14px rgba(5,150,105,0.3);">View Transfer in Seller Portal →</a></td></tr></table><p style="margin:20px 0 0;color:#18181b;font-size:13px;font-weight:600;">Tickets must be delivered at least 48 hours before the event.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-radius:12px;overflow:hidden;border-left:4px solid #ef4444;background:#fef2f2;"><tr><td style="padding:14px 16px;"><p style="margin:0 0 8px;color:#991b1b;font-size:12px;line-height:1.5;">⚠️ Transfer errors are subject to Seats.ca Terms and Conditions.</p><p style="margin:0;color:#991b1b;font-size:12px;line-height:1.5;">💳 Payments occur two weeks after the event, contingent on proper delivery.</p></td></tr></table><p style="margin:16px 0 0;color:#71717a;font-size:13px;">Questions? <a href="mailto:support@seats.ca" style="color:#C41E3A;text-decoration:none;font-weight:600;">support@seats.ca</a></p>`;
  return premiumWrapper("linear-gradient(90deg,#059669,#047857,#059669)", body);
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
    const unsubToken = crypto.randomUUID();
    const isSellerEmail = type === "seller_notification";
    const displayName = isSellerEmail ? "LMK Sports Consulting" : "seats.ca";

    await supabase.from("email_unsubscribe_tokens").insert({ email: to, token: unsubToken });

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
        idempotency_key: messageId,
        unsubscribe_token: unsubToken,
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
