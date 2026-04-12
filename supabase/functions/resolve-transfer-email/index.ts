import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

const RESEND_API_URL = "https://api.resend.com";
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");

    const body = await req.json();

    if (body.type !== "email.received") {
      return new Response(JSON.stringify({ ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email_id, to: recipients } = body.data;

    if (!email_id || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid webhook payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract the alias from the recipient
    const aliasRecipient = recipients.find((r: string) =>
      r.includes("order-") && (r.includes("@inbound.seats.ca") || r.includes("@seats.ca"))
    );

    if (!aliasRecipient) {
      console.log("No order-*@inbound.seats.ca recipient found in:", recipients);
      return new Response(JSON.stringify({ ignored: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const alias = aliasRecipient.trim().toLowerCase();

    // Look up transfer via database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: transfer, error: transferError } = await supabase
      .from("order_transfers")
      .select("order_id, status, verification_result")
      .eq("transfer_email_alias", alias)
      .single();

    if (transferError || !transfer) {
      console.error("Alias not found:", alias, transferError);
      return new Response(JSON.stringify({ error: "Alias not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Block forwarding if AI verification found a mismatch
    if (transfer.status === "disputed") {
      console.log(`BLOCKED forward for alias ${alias} — status is disputed`);
      return new Response(JSON.stringify({ forwarded: false, reason: "mismatch_blocked" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch buyer email
    const { data: order } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", transfer.order_id)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", order.user_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "Buyer email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const buyerEmail = profile.email;

    // --- Fetch the full inbound email from Resend to get HTML body ---
    const acceptLink = await extractAcceptLink(resendApiKey, email_id);
    console.log(`Extracted accept link for alias ${alias}:`, acceptLink ? "found" : "not found");

    const inboundSubject = body.data.subject || "Ticket Transfer";
    const safeHtml = buildBrandedEmail(acceptLink);

    const plainText = acceptLink
      ? `A ticket transfer has been sent to your account. Accept it here: ${acceptLink}`
      : "A ticket transfer has been sent to your account. Look for an incoming transfer notification and accept it to add the tickets to your Ticketmaster account.";

    await sendEmail(resendApiKey, buyerEmail, `Fwd: ${inboundSubject}`, safeHtml, plainText);

    // Mark that the email was successfully forwarded
    await supabase
      .from("order_transfers")
      .update({ forward_sent_at: new Date().toISOString() })
      .eq("transfer_email_alias", alias);

    console.log(`Forwarded transfer email for alias ${alias} to buyer (link: ${acceptLink ? "yes" : "no"})`);

    return new Response(JSON.stringify({ forwarded: true, hasLink: !!acceptLink }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in resolve-transfer-email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Fetch the full email content from Resend's Receiving API and extract
 * the Ticketmaster "Accept" transfer link, stripping seller PII.
 */
async function extractAcceptLink(resendApiKey: string, emailId: string): Promise<string | null> {
  try {
    const res = await fetch(`${RESEND_API_URL}/emails/${emailId}`, {
      headers: { Authorization: `Bearer ${resendApiKey}` },
    });

    if (!res.ok) {
      console.error("Failed to fetch inbound email from Resend:", res.status, await res.text());
      return null;
    }

    const emailData = await res.json();
    const html: string = emailData.html || emailData.text || "";

    if (!html) {
      console.log("No HTML body in inbound email");
      return null;
    }

    // Ticketmaster accept/transfer links typically match these patterns:
    // - https://www.ticketmaster.com/transfer/accept?...
    // - https://am.ticketmaster.com/...
    // - https://myaccount.ticketmaster.com/...
    // - Links containing "accept" in Ticketmaster domains
    const patterns = [
      // Direct accept transfer URLs
      /https?:\/\/[a-z.]*ticketmaster\.[a-z.]+\/[^\s"'<>]*(?:accept|transfer)[^\s"'<>]*/gi,
      // Generic Ticketmaster links with tokens (often the CTA button href)
      /https?:\/\/[a-z.]*ticketmaster\.[a-z.]+\/[^\s"'<>]*token[^\s"'<>]*/gi,
      // Broad fallback: any Ticketmaster link that looks like an action URL (has query params)
      /https?:\/\/[a-z.]*ticketmaster\.[a-z.]+\/[^\s"'<>]*\?[^\s"'<>]+/gi,
    ];

    for (const pattern of patterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        // Clean up any trailing quotes or HTML artifacts
        let link = matches[0].replace(/["'>;].*$/, "").replace(/&amp;/g, "&");
        return link;
      }
    }

    console.log("No Ticketmaster accept link found in email body");
    return null;
  } catch (err) {
    console.error("Error extracting accept link:", err);
    return null;
  }
}

/**
 * Build a branded email that includes the acceptance link (if found)
 * or falls back to generic instructions.
 */
function buildBrandedEmail(acceptLink: string | null): string {
  const ctaSection = acceptLink
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td align="center">
          <a href="${acceptLink}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#059669,#047857);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">
            ✅ Accept Ticket Transfer
          </a>
        </td></tr>
       </table>`
    : "";

  const stepsSection = acceptLink
    ? `<ol style="margin:8px 0 0;padding-left:20px;color:#047857;font-size:13px;line-height:1.8;">
         <li>Click the <strong>"Accept Ticket Transfer"</strong> button above</li>
         <li>Sign in to your Ticketmaster account when prompted</li>
         <li>The tickets will be added to your account</li>
       </ol>`
    : `<ol style="margin:8px 0 0;padding-left:20px;color:#047857;font-size:13px;line-height:1.8;">
         <li>Look for an incoming ticket transfer notification from Ticketmaster</li>
         <li>Accept the transfer to add the tickets to your Ticketmaster account</li>
       </ol>`;

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
<tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:28px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">🎟️ Ticket Transfer Received</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">A ticket transfer has been sent to your account</p>
</td></tr>
<tr><td style="padding:32px 40px;">
  <p style="margin:0 0 16px;color:#18181b;font-size:14px;line-height:1.6;">
    Good news! A ticket transfer has been initiated for your order.
  </p>
  ${ctaSection}
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#ecfdf5;border-radius:8px;border:1px solid #a7f3d0;">
    <tr><td style="padding:16px;">
      <p style="margin:0;color:#047857;font-size:14px;font-weight:700;">📋 Next Steps</p>
      ${stepsSection}
    </td></tr>
  </table>
  <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
    If you have any questions, contact us at <a href="mailto:support@seats.ca" style="color:#d6193d;text-decoration:none;">support@seats.ca</a>.
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

async function sendEmail(
  resendApiKey: string,
  to: string,
  subject: string,
  html: string,
  text: string
) {
  const res = await fetch(`${RESEND_API_URL}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Seats.ca Transfers <noreply@seats.ca>",
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Failed to send email via Resend:", res.status, err);
    throw new Error(`Failed to send email: ${res.status}`);
  }
}
