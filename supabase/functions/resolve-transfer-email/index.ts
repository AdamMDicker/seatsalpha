import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

const RESEND_API_URL = "https://api.resend.com";
const LOGO_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/seats-logo-horizontal.png";
const HERO_BANNER_URL = "https://fkcszgrewzhswdtsqpad.supabase.co/storage/v1/object/public/email-assets/email-hero-banner.png";

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

    // ── Test preview mode ──
    if (body.test_preview && body.recipient_email) {
      console.log(`Test preview mode — sending to ${body.recipient_email}`);
      const testHtml = buildBrandedEmail("https://www.ticketmaster.ca/transfer/accept?test=preview");
      const testText = "This is a test transfer relay email. Accept link: https://www.ticketmaster.ca/transfer/accept?test=preview";
      await queueEmail(supabase, body.recipient_email, "🎟️ Test: Ticket Transfer Received", testHtml, testText);
      return new Response(JSON.stringify({ test_sent: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

      // Try stored accept_link first, then re-fetch from Resend if inbound_email_id exists.
      // Old bad extractions could store TM asset/image URLs, so treat those as invalid.
      let storedLink: string | null = isValidAcceptLink((transfer as any).accept_link)
        ? (transfer as any).accept_link
        : null;

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

      await queueEmail(supabase, profile.email, "🎟️ Your Ticket Transfer Is Ready", safeHtml, plainText);

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

    console.log("=== WEBHOOK RECEIVED ===");
    console.log("Webhook payload keys:", Object.keys(body.data || {}).join(", "));
    console.log("Webhook from:", body.data?.from);
    console.log("Webhook subject:", body.data?.subject);
    console.log("Webhook to:", JSON.stringify(body.data?.to));
    console.log("Webhook email_id:", body.data?.email_id);

    // Log the raw webhook HTML content if present (first 500 chars)
    if (body.data?.html) {
      console.log("Webhook body.data.html length:", body.data.html.length);
      console.log("Webhook body.data.html preview:", body.data.html.substring(0, 500));
    } else {
      console.log("Webhook body.data.html: NOT PRESENT");
    }
    if (body.data?.text) {
      console.log("Webhook body.data.text length:", body.data.text.length);
      console.log("Webhook body.data.text preview:", body.data.text.substring(0, 300));
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
      .select("id, order_id, status, transfer_image_url, inbound_email_id, seller_id, forward_sent_at")
      .eq("transfer_email_alias", alias)
      .single();

    if (transferError || !transfer) {
      console.error("Alias not found:", alias, transferError);
      return new Response(JSON.stringify({ error: "Alias not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── IDEMPOTENCY: skip if we've already processed this exact inbound email ──
    if (transfer.inbound_email_id && transfer.inbound_email_id === email_id) {
      console.log(`IGNORED duplicate webhook — inbound_email_id ${email_id} already processed for alias ${alias}`);
      return new Response(JSON.stringify({ ignored: true, reason: "duplicate_webhook" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── IDEMPOTENCY: skip if we've already forwarded a transfer email to the buyer ──
    if ((transfer as any).forward_sent_at) {
      console.log(`IGNORED webhook — buyer already received forward for alias ${alias} at ${(transfer as any).forward_sent_at}`);
      return new Response(JSON.stringify({ ignored: true, reason: "already_forwarded" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ATOMIC CLAIM: race-safe dedupe. Only the first concurrent invocation
    //    succeeds in writing inbound_email_id; any duplicate webhooks lose the
    //    race and exit early, preventing duplicate seller alert / forward emails.
    const { data: claimed, error: claimErr } = await supabase
      .from("order_transfers")
      .update({ inbound_email_id: email_id })
      .eq("id", transfer.id)
      .is("inbound_email_id", null)
      .select("id");

    if (claimErr) {
      console.error("Failed to claim inbound email:", claimErr);
      return new Response(JSON.stringify({ error: "Claim failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!claimed || claimed.length === 0) {
      console.log(`IGNORED duplicate webhook — alias ${alias} already claimed by a concurrent invocation`);
      return new Response(JSON.stringify({ ignored: true, reason: "concurrent_duplicate" }), {
        status: 200,
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

    // Always extract the accept link from the inbound email so we can store it
    const acceptLink = await extractAcceptLink(resendApiKey, email_id);
    console.log(`Extracted accept link for alias ${alias}:`, acceptLink ? `found (${safeHostname(acceptLink)})` : "not found");

    // ── PROOF GATE ──
    // The actual Ticketmaster transfer arriving at our inbound alias IS the strongest
    // proof that the seller initiated the transfer. Once we have a valid accept link,
    // we forward to the buyer immediately — regardless of whether the seller uploaded a
    // screenshot. The screenshot remains useful for fraud detection but should never
    // block the buyer from receiving tickets they paid for.
    //
    // The only case we still hold is `disputed` (already short-circuited above).
    const proofUploaded = !!transfer.transfer_image_url;
    const hasValidLink = isValidAcceptLink(acceptLink);
    const shouldForwardNow = hasValidLink || (proofUploaded && transfer.status === "confirmed");

    // Always persist the inbound email ID and accept link so they survive for later release
    const persistPayload: Record<string, unknown> = {
      inbound_email_id: email_id,
    };
    if (acceptLink) {
      persistPayload.accept_link = acceptLink;
      persistPayload.accept_link_extracted_at = new Date().toISOString();
    }

    if (!shouldForwardNow) {
      // Store link but DO NOT forward. Alert the seller (or admin for orphan tickets) to upload proof.
      await supabase
        .from("order_transfers")
        .update(persistPayload)
        .eq("id", transfer.id);

      const reason = !proofUploaded ? "awaiting_seller_proof" : `awaiting_verification (status=${transfer.status})`;
      console.log(`HOLDING forward for alias ${alias} — ${reason}. Link stored for later release.`);

      // Notify seller (or admin if orphan ticket) that TM email arrived but proof is missing
      try {
        const ADMIN_EMAIL = "lmksportsconsulting@gmail.com";
        let notifyEmail: string | null = null;
        let notifyUserId: string | null = transfer.seller_id;

        if (transfer.seller_id) {
          const { data: sellerProfile } = await supabase
            .from("profiles")
            .select("email")
            .eq("user_id", transfer.seller_id)
            .single();
          notifyEmail = sellerProfile?.email ?? null;
        } else {
          notifyEmail = ADMIN_EMAIL;
        }

        if (notifyEmail) {
          const alertHtml = buildSellerAlertEmail();
          await queueEmail(
            supabase,
            notifyEmail,
            "⚠️ Action Required: Upload Transfer Proof",
            alertHtml,
            "Ticketmaster sent the transfer email for one of your sales, but you haven't uploaded proof yet. The buyer will NOT receive the accept link until you upload proof in your seller dashboard."
          );
        }

        if (notifyUserId) {
          await supabase.from("notifications").insert({
            user_id: notifyUserId,
            type: "transfer_proof_required",
            title: "⚠️ Upload Transfer Proof",
            body: "Ticketmaster sent the transfer email, but the buyer won't receive the accept link until you upload proof in your seller dashboard.",
            metadata: { transfer_id: transfer.id },
          });
        }
      } catch (notifyErr) {
        console.error("Failed to send proof-required alert:", notifyErr);
      }

      return new Response(JSON.stringify({ forwarded: false, reason, link_stored: !!acceptLink }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Proof verified — forward to buyer ──
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
    // Use a generic, branded subject — never echo the inbound TM subject
    // (it often contains the buyer's name or other PII).
    const safeHtml = buildBrandedEmail(acceptLink);
    const plainText = acceptLink
      ? `A ticket transfer has been sent to your account. Accept it here: ${acceptLink}`
      : "A ticket transfer has been sent to your account. Look for an incoming transfer notification and accept it to add the tickets to your Ticketmaster account.";

    await queueEmail(supabase, buyerEmail, "🎟️ Your Ticket Transfer Is Ready", safeHtml, plainText);

    persistPayload.forward_sent_at = new Date().toISOString();
    await supabase
      .from("order_transfers")
      .update(persistPayload)
      .eq("id", transfer.id);

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

    // Debug: dump raw Resend response structure
    console.log("=== RESEND INBOUND API RESPONSE ===");
    console.log("Resend response keys:", Object.keys(emailData).join(", "));
    console.log("Resend response type:", typeof emailData);
    // Log each top-level field's type and length
    for (const [key, val] of Object.entries(emailData)) {
      if (typeof val === "string") {
        console.log(`  ${key}: string (${val.length} chars) preview: ${val.substring(0, 200)}`);
      } else if (Array.isArray(val)) {
        console.log(`  ${key}: array (${val.length} items)`);
      } else if (val && typeof val === "object") {
        console.log(`  ${key}: object keys=[${Object.keys(val as Record<string, unknown>).join(",")}]`);
      } else {
        console.log(`  ${key}: ${typeof val} = ${String(val)}`);
      }
    }

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
  if (!href || !href.startsWith("http") || !isValidAcceptLink(href)) return;

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
    /(mailto:|unsubscribe|preferences|privacy|facebook|instagram|twitter|linkedin|support@|noreply@|\.png\b|\.jpg\b|\.jpeg\b|\.gif\b|\.webp\b|\/images\/|\/image\/|logo|banner|pixel|tracking)/.test(link)
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

function isValidAcceptLink(value: string | null | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    const href = value.toLowerCase();
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    if (!/^https?:$/.test(url.protocol)) return false;
    if (/(^|\.)em-static-prod\.ticketmaster\.com$/.test(hostname)) return false;
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(pathname)) return false;
    if (/(\/images?\/|logo|banner|pixel|tracking)/.test(pathname)) return false;

    const looksLikeTmInvite =
      hostname.includes("ticketmaster") && /(accept|invite|invites|transfer|claim|secure|tickets?)/.test(`${pathname}${url.search}`);
    const looksLikeShortLink = /(^|\.)(click\.|links\.|lnk\.)/.test(hostname) && /(accept|transfer|ticket|invite|claim)/.test(href);

    return looksLikeTmInvite || looksLikeShortLink;
  } catch {
    return false;
  }
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
  // Outlook-bulletproof button: VML fallback + solid color (no gradient)
  const ctaSection = acceptLink
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 12px;">
        <tr><td align="center">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${acceptLink}" style="height:56px;v-text-anchor:middle;width:280px;" arcsize="50%" stroke="f" fillcolor="#059669">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">Accept Tickets</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-- -->
          <a href="${acceptLink}" target="_blank" style="display:inline-block;background-color:#059669;color:#ffffff;font-size:17px;font-weight:700;text-decoration:none;padding:18px 48px;border-radius:50px;letter-spacing:0.3px;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;mso-hide:all;">Accept Tickets</a>
          <!--<![endif]-->
        </td></tr>
        <tr><td align="center" style="padding-top:14px;">
          <p style="margin:0;color:#71717a;font-size:12px;font-family:'Space Grotesk',Arial,sans-serif;">Button not working? Copy this link:</p>
          <p style="margin:4px 0 0;font-size:12px;font-family:Arial,sans-serif;word-break:break-all;"><a href="${acceptLink}" style="color:#059669;text-decoration:underline;">${acceptLink}</a></p>
        </td></tr>
       </table>`
    : "";

  const stepsSection = acceptLink
    ? `<ol style="margin:8px 0 0;padding-left:20px;color:#065f46;font-size:13px;line-height:2;">
         <li>Click the <strong>"Accept Tickets"</strong> button above</li>
         <li>Sign in to your Ticketmaster account when prompted</li>
         <li>The tickets will be added to your account</li>
       </ol>`
    : `<ol style="margin:8px 0 0;padding-left:20px;color:#065f46;font-size:13px;line-height:2;">
         <li>Look for an incoming ticket transfer notification from Ticketmaster</li>
         <li>Accept the transfer to add the tickets to your Ticketmaster account</li>
       </ol>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);">

<tr><td style="padding:0;"><img src="${HERO_BANNER_URL}" alt="Compare Every Seat. Skip Every Fee." width="600" style="display:block;width:100%;height:auto;" /></td></tr>

<!-- Green accent bar -->
<tr><td style="height:4px;background:linear-gradient(90deg,#059669,#10b981,#059669);"></td></tr>

<!-- Title banner -->
<tr><td style="background:#18181b;padding:22px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">🎟️&nbsp; Ticket Transfer Received</h1>
  <p style="margin:6px 0 0;color:#a1a1aa;font-size:13px;letter-spacing:0.2px;">A ticket transfer has been sent to your account</p>
</td></tr>

<!-- Body -->
<tr><td style="padding:28px 40px 12px;">
  <p style="margin:0 0 4px;color:#52525b;font-size:14px;line-height:1.7;">
    Good news! A ticket transfer has been initiated for your order.
  </p>
  ${ctaSection}
</td></tr>

<!-- Next Steps card -->
<tr><td style="padding:0 40px 28px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-radius:12px;border:1px solid #d1fae5;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 4px;color:#047857;font-size:14px;font-weight:700;">📋 Next Steps</p>
      ${stepsSection}
    </td></tr>
  </table>
</td></tr>

<!-- Support -->
<tr><td style="padding:0 40px 28px;">
  <p style="margin:0;color:#71717a;font-size:13px;line-height:1.6;">
    Questions? Contact us at <a href="mailto:support@seats.ca" style="color:#C41E3A;font-weight:600;text-decoration:none;">support@seats.ca</a>
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 40px;background:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} Seats.ca · Canada's No-Fee Ticket Platform</p>
  <p style="margin:6px 0 0;color:#a1a1aa;font-size:11px;">Tip: Add noreply@seats.ca to your contacts so emails don't go to spam.</p>
</td></tr>

</table></td></tr></table>
</body></html>`;
}

function buildSellerAlertEmail(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);">
<tr><td style="padding:0;"><img src="${HERO_BANNER_URL}" alt="Seats.ca" width="600" style="display:block;width:100%;height:auto;" /></td></tr>
<tr><td style="height:4px;background:#dc2626;"></td></tr>
<tr><td style="background:#18181b;padding:22px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">⚠️ Action Required: Upload Transfer Proof</h1>
</td></tr>
<tr><td style="padding:28px 40px;">
  <p style="margin:0 0 16px;color:#52525b;font-size:15px;line-height:1.7;">
    Ticketmaster has sent the transfer email for one of your sales. <strong style="color:#dc2626;">However, the buyer will NOT receive the accept link</strong> until you upload your transfer proof.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#fef2f2;border-radius:12px;border-left:4px solid #dc2626;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 8px;color:#991b1b;font-size:14px;font-weight:700;">📋 What to do</p>
      <ol style="margin:0;padding-left:20px;color:#991b1b;font-size:13px;line-height:1.9;">
        <li>Log in to your Seats.ca seller dashboard</li>
        <li>Open the <strong>Transfers</strong> tab</li>
        <li>Find this order and upload your transfer screenshot</li>
        <li>Once verified, the buyer will automatically receive the accept link</li>
      </ol>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td align="center">
    <a href="https://seats.ca/reseller?tab=transfers" style="display:inline-block;background:#dc2626;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;">Upload Transfer Proof →</a>
  </td></tr></table>
  <p style="margin:0;color:#71717a;font-size:13px;line-height:1.6;">
    Questions? Contact <a href="mailto:support@seats.ca" style="color:#C41E3A;font-weight:600;text-decoration:none;">support@seats.ca</a>
  </p>
</td></tr>
<tr><td style="padding:20px 40px;background:#fafafa;border-top:1px solid #e5e5e5;text-align:center;">
  <p style="margin:0;color:#a1a1aa;font-size:11px;">© ${new Date().getFullYear()} Seats.ca · Canada's No-Fee Ticket Platform</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

async function queueEmail(
  supabase: any /* SupabaseClient */,
  to: string,
  subject: string,
  html: string,
  text: string
) {
  const messageId = crypto.randomUUID();
  const unsubToken = crypto.randomUUID();
  const SENDER_DOMAIN = "notify.seats.ca";
  const FROM_EMAIL = "noreply@seats.ca";

  await supabase.from("email_unsubscribe_tokens").insert({ email: to, token: unsubToken });

  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: "transfer-relay-forward",
    recipient_email: to,
    status: "pending",
  });

  await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to,
      from: `Seats.ca Transfers <${FROM_EMAIL}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      idempotency_key: messageId,
      unsubscribe_token: unsubToken,
      label: "transfer-relay-forward",
      queued_at: new Date().toISOString(),
    },
  });

  console.log(`Queued relay email ${messageId} to ${to}`);
}
