import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

const RESEND_API_URL = "https://api.resend.com";
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo.png";

interface LinkCandidate {
  href: string;
  text: string;
  score: number;
  source: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");

    const body = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // ── Manual admin re-trigger mode ──
    if (body.transfer_id && !body.type) {
      console.log(`Manual relay trigger for transfer_id=${body.transfer_id}`);

      const { data: transfer, error: transferError } = await supabase
        .from("order_transfers")
        .select("order_id, transfer_email_alias, status, accept_link, inbound_email_id")
        .eq("id", body.transfer_id)
        .single();

      if (transferError || !transfer) {
        return new Response(JSON.stringify({ error: "Transfer not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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

      // Try stored accept_link first, then re-fetch from Resend if inbound_email_id exists
      let storedLink: string | null = (transfer as any).accept_link || null;

      if (!storedLink && (transfer as any).inbound_email_id) {
        console.log(`No stored link — re-extracting from inbound email ${(transfer as any).inbound_email_id}`);
        storedLink = await extractAcceptLink(resendApiKey, (transfer as any).inbound_email_id);
        if (storedLink) {
          await supabase
            .from("order_transfers")
            .update({ accept_link: storedLink, accept_link_extracted_at: new Date().toISOString() })
            .eq("id", body.transfer_id);
        }
      }

      console.log(`Manual relay for ${body.transfer_id}: accept_link=${storedLink ? "yes" : "no"}`);

      const safeHtml = buildBrandedEmail(storedLink);
      const plainText = storedLink
        ? `A ticket transfer has been sent to your account. Accept it here: ${storedLink}`
        : "A ticket transfer has been sent to your account. Look for an incoming transfer notification and accept it to add the tickets to your Ticketmaster account.";

      await sendEmail(resendApiKey, profile.email, "Fwd: Ticket Transfer", safeHtml, plainText);

      await supabase
        .from("order_transfers")
        .update({ forward_sent_at: new Date().toISOString() })
        .eq("id", body.transfer_id);

      console.log(`Manual relay sent to ${profile.email} for transfer ${body.transfer_id}`);

      return new Response(JSON.stringify({ forwarded: true, manual: true, hasLink: !!storedLink }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Standard webhook mode ──
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

    const { data: transfer, error: transferError } = await supabase
      .from("order_transfers")
      .select("order_id, status")
      .eq("transfer_email_alias", alias)
      .single();

    if (transferError || !transfer) {
      console.error("Alias not found:", alias, transferError);
      return new Response(JSON.stringify({ error: "Alias not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (transfer.status === "disputed") {
      console.log(`BLOCKED forward for alias ${alias} — status is disputed`);
      return new Response(JSON.stringify({ forwarded: false, reason: "mismatch_blocked" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    const acceptLink = await extractAcceptLink(resendApiKey, email_id);

    console.log(`Extracted accept link for alias ${alias}:`, acceptLink ? `found (${safeHostname(acceptLink)})` : "not found");

    const inboundSubject = body.data.subject || "Ticket Transfer";
    const safeHtml = buildBrandedEmail(acceptLink);
    const plainText = acceptLink
      ? `A ticket transfer has been sent to your account. Accept it here: ${acceptLink}`
      : "A ticket transfer has been sent to your account. Look for an incoming transfer notification and accept it to add the tickets to your Ticketmaster account.";

    await sendEmail(resendApiKey, buyerEmail, `Fwd: ${inboundSubject}`, safeHtml, plainText);

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

async function extractAcceptLink(resendApiKey: string, emailId: string): Promise<string | null> {
  try {
    const res = await fetch(`${RESEND_API_URL}/emails/receiving/${emailId}`, {
      headers: { Authorization: `Bearer ${resendApiKey}` },
    });

    if (!res.ok) {
      console.error("Failed to fetch inbound email from Resend:", res.status, await res.text());
      return null;
    }

    const emailData = await res.json();
    const contentCandidates = collectContentCandidates(emailData);

    console.log(
      "Inbound email content sources:",
      contentCandidates.map(({ source, value }) => `${source}:${value.length}`).join(", ") || "none"
    );

    // Debug: dump ALL links found in the email so we can see what domains TM uses
    const allLinks = contentCandidates.flatMap(({ source, value }) => extractLinkCandidates(value, source));
    console.log(
      "ALL links found in inbound email:",
      JSON.stringify(allLinks.map(l => ({ href: truncate(l.href, 120), text: truncate(l.text, 60), score: l.score, host: safeHostname(l.href) })))
    );

    // Also dump raw URLs from the HTML for complete visibility
    const firstHtml = contentCandidates.find(c => c.source === "html")?.value || "";
    const rawUrls = firstHtml.match(/https?:\/\/[^\s"'<>]+/gi) || [];
    console.log("Raw URLs in inbound HTML:", JSON.stringify(rawUrls.map(u => truncate(u, 150)).slice(0, 20)));

    const rankedLinks = rankLinkCandidates(allLinks);

    if (rankedLinks.length > 0) {
      const best = rankedLinks[0];
      console.log(
        `Selected inbound link host=${safeHostname(best.href)} score=${best.score} source=${best.source} text=${truncate(best.text, 60)}`
      );
      return best.href;
    }

    console.log(
      "No inbound accept link matched",
      JSON.stringify({
        keys: Object.keys(emailData).slice(0, 20),
        candidateSources: contentCandidates.map(({ source }) => source),
      })
    );

    return null;
  } catch (err) {
    console.error("Error extracting accept link:", err);
    return null;
  }
}

function collectContentCandidates(emailData: Record<string, unknown>): Array<{ source: string; value: string }> {
  const candidates = new Map<string, string>();
  const preferredPaths = [
    ["html"],
    ["text"],
    ["body", "html"],
    ["body", "text"],
    ["content", "html"],
    ["content", "text"],
    ["email", "html"],
    ["email", "text"],
    ["data", "html"],
    ["data", "text"],
    ["raw"],
    ["raw_html"],
    ["raw_text"],
    ["message", "html"],
    ["message", "text"],
  ];

  for (const path of preferredPaths) {
    const value = getNestedString(emailData, path);
    if (value) {
      candidates.set(path.join("."), normalizeContent(value));
    }
  }

  collectRecursiveStrings(emailData, [], candidates, 0);

  return Array.from(candidates.entries()).map(([source, value]) => ({ source, value }));
}

function getNestedString(obj: unknown, path: string[]): string | null {
  let current: unknown = obj;
  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) return null;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" && current.trim() ? current : null;
}

function collectRecursiveStrings(
  value: unknown,
  path: string[],
  candidates: Map<string, string>,
  depth: number
): void {
  if (depth > 4 || !value) return;

  if (typeof value === "string") {
    const lastKey = path[path.length - 1]?.toLowerCase() ?? "";
    if (["html", "text", "body", "raw", "content", "message"].some((part) => lastKey.includes(part))) {
      const normalized = normalizeContent(value);
      if (normalized) candidates.set(path.join("."), normalized);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => collectRecursiveStrings(item, [...path, String(index)], candidates, depth + 1));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([key, nested]) => {
      collectRecursiveStrings(nested, [...path, key], candidates, depth + 1);
    });
  }
}

function normalizeContent(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/=\r?\n/g, "")
    .replace(/\u003d/g, "=")
    .replace(/\u0026/g, "&")
    .trim();
}

function extractLinkCandidates(content: string, source: string): LinkCandidate[] {
  const candidates = new Map<string, LinkCandidate>();
  const anchorRegex = /<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let anchorMatch: RegExpExecArray | null;

  while ((anchorMatch = anchorRegex.exec(content)) !== null) {
    const href = cleanUrl(anchorMatch[2]);
    const text = stripHtml(anchorMatch[3]);
    const context = anchorMatch[0];
    maybeAddCandidate(candidates, href, text, source, context);
  }

  const plainUrlRegex = /https?:\/\/[^\s"'<>]+/gi;
  const plainMatches = content.match(plainUrlRegex) ?? [];
  for (const rawUrl of plainMatches) {
    const href = cleanUrl(rawUrl);
    maybeAddCandidate(candidates, href, "", source, rawUrl);
  }

  return Array.from(candidates.values());
}

function maybeAddCandidate(
  store: Map<string, LinkCandidate>,
  rawHref: string,
  text: string,
  source: string,
  context: string
): void {
  const href = cleanUrl(rawHref);
  if (!href || !href.startsWith("http")) return;

  const score = scoreLinkCandidate(href, text, context);
  if (score < 40) return;

  const existing = store.get(href);
  const candidate = { href, text, source, score };

  if (!existing || existing.score < score) {
    store.set(href, candidate);
  }
}

function scoreLinkCandidate(href: string, text: string, context: string): number {
  const link = href.toLowerCase();
  const label = text.toLowerCase();
  const nearby = context.toLowerCase();

  if (
    /(mailto:|unsubscribe|preferences|privacy|facebook|instagram|twitter|linkedin|support@|noreply@)/.test(link)
  ) {
    return -1000;
  }

  let score = 0;

  if (link.includes("ticketmaster")) score += 45;
  if (/(accept|claim|receive|view\s*tickets|manage\s*tickets|ticket\s*transfer|view\s*transfer)/.test(label)) score += 60;
  if (/(accept|claim|transfer|tickets?|secure|redeem)/.test(link)) score += 35;
  if (/(ticket\s*transfer|accept\s*your\s*tickets|accept\s*transfer|mobile\s*tickets|has\s*sent\s*you)/.test(nearby)) score += 20;
  if (/click\.|links\.|lnk\./.test(link) && /(accept|transfer|ticket)/.test(label + " " + nearby)) score += 25;
  if (link.startsWith("https://")) score += 5;

  return score;
}

function rankLinkCandidates(candidates: LinkCandidate[]): LinkCandidate[] {
  return candidates.sort((a, b) => b.score - a.score || a.href.length - b.href.length);
}

function cleanUrl(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/^href=/i, "")
    .replace(/["']/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, "")
    .replace(/[>;]+$/g, "")
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/=3D/gi, "=");
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "invalid-url";
  }
}

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
