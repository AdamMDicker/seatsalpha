// Daily admin digest of Stripe webhook errors from the last 24 hours.
// Scheduled via pg_cron. Sends one email per admin via the queued email pipeline.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = `Seats.ca Alerts <alerts@${SENDER_DOMAIN}>`;

type WebhookRow = {
  stripe_event_id: string;
  event_type: string;
  source: string;
  status: string;
  error_message: string | null;
  received_at: string;
  processing_ms: number | null;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildDigestHtml(opts: {
  errors: WebhookRow[];
  totalCount: number;
  processedCount: number;
  errorCount: number;
  windowLabel: string;
}): string {
  const { errors, totalCount, processedCount, errorCount, windowLabel } = opts;
  const errorRows = errors
    .slice(0, 25)
    .map(
      (e) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-family:ui-monospace,monospace;font-size:11px;color:#111827;">${escapeHtml(e.stripe_event_id)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;">${escapeHtml(e.event_type)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#374151;text-transform:capitalize;">${escapeHtml(e.source)}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#b91c1c;">${escapeHtml(e.error_message ?? "(no message)")}</td>
        <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-size:11px;color:#6b7280;white-space:nowrap;">${new Date(e.received_at).toLocaleString("en-US", { timeZone: "America/Toronto" })}</td>
      </tr>`,
    )
    .join("");

  const moreNote =
    errors.length > 25
      ? `<p style="font-size:12px;color:#6b7280;margin:12px 0 0;">Showing 25 of ${errors.length} errors. View the full list in the admin dashboard.</p>`
      : "";

  const summaryColor = errorCount > 0 ? "#b91c1c" : "#059669";
  const summaryLabel = errorCount > 0 ? `⚠️ ${errorCount} webhook error${errorCount === 1 ? "" : "s"}` : "✅ All clear";

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:24px;">
    <div style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#0f172a;padding:24px;color:#ffffff;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;opacity:0.7;">Seats.ca Admin</p>
        <h1 style="margin:0;font-size:22px;font-weight:700;">Webhook Health Digest</h1>
        <p style="margin:8px 0 0;font-size:13px;opacity:0.85;">${escapeHtml(windowLabel)}</p>
      </div>

      <div style="padding:24px;">
        <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
          <div style="flex:1;min-width:140px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px;">
            <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Total Events</p>
            <p style="margin:0;font-size:22px;font-weight:700;color:#111827;">${totalCount}</p>
          </div>
          <div style="flex:1;min-width:140px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;">
            <p style="margin:0 0 4px;font-size:11px;color:#15803d;text-transform:uppercase;letter-spacing:0.5px;">Processed</p>
            <p style="margin:0;font-size:22px;font-weight:700;color:#15803d;">${processedCount}</p>
          </div>
          <div style="flex:1;min-width:140px;background:${errorCount > 0 ? "#fef2f2" : "#f9fafb"};border:1px solid ${errorCount > 0 ? "#fecaca" : "#e5e7eb"};border-radius:8px;padding:14px;">
            <p style="margin:0 0 4px;font-size:11px;color:${summaryColor};text-transform:uppercase;letter-spacing:0.5px;">Errors</p>
            <p style="margin:0;font-size:22px;font-weight:700;color:${summaryColor};">${errorCount}</p>
          </div>
        </div>

        <div style="padding:14px;background:${errorCount > 0 ? "#fef2f2" : "#f0fdf4"};border-left:4px solid ${summaryColor};border-radius:6px;margin-bottom:20px;">
          <p style="margin:0;font-size:14px;font-weight:600;color:${summaryColor};">${summaryLabel}</p>
        </div>

        ${
          errorCount > 0
            ? `
        <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827;">Recent Errors</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="text-align:left;padding:10px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Event ID</th>
              <th style="text-align:left;padding:10px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Type</th>
              <th style="text-align:left;padding:10px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Source</th>
              <th style="text-align:left;padding:10px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Error</th>
              <th style="text-align:left;padding:10px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb;">Received (ET)</th>
            </tr>
          </thead>
          <tbody>${errorRows}</tbody>
        </table>
        ${moreNote}

        <div style="margin-top:24px;text-align:center;">
          <a href="https://www.seats.ca/admin" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:600;">Open Admin Dashboard</a>
        </div>
        `
            : `<p style="font-size:14px;color:#374151;margin:0;">No webhook errors in the last 24 hours. Stripe webhooks are healthy.</p>`
        }
      </div>

      <div style="background:#f9fafb;padding:16px 24px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">Automated daily digest from Seats.ca · ${new Date().toLocaleDateString("en-US", { timeZone: "America/Toronto" })}</p>
      </div>
    </div>
  </div>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Pull last 24h of webhook events
    const { data: events, error: evErr } = await supabase
      .from("stripe_webhook_events")
      .select("stripe_event_id, event_type, source, status, error_message, received_at, processing_ms")
      .gte("received_at", sinceIso)
      .order("received_at", { ascending: false });

    if (evErr) throw new Error(`Failed to query webhook events: ${evErr.message}`);

    const all = (events || []) as WebhookRow[];
    const errors = all.filter((e) => e.status === "processing_error");
    const processed = all.filter((e) => e.status === "processed");

    // Find admin recipients
    const { data: admins, error: adminErr } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    if (adminErr) throw new Error(`Failed to load admins: ${adminErr.message}`);

    const adminIds = (admins || []).map((a) => a.user_id);
    if (adminIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no_admins" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("email")
      .in("user_id", adminIds);
    if (profErr) throw new Error(`Failed to load admin profiles: ${profErr.message}`);

    const recipients = (profiles || [])
      .map((p) => (p.email || "").trim().toLowerCase())
      .filter((e) => e.length > 0);

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ sent: 0, reason: "no_admin_emails" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const windowLabel = `${new Date(sinceIso).toLocaleString("en-US", { timeZone: "America/Toronto" })} → ${new Date().toLocaleString("en-US", { timeZone: "America/Toronto" })} ET`;

    const html = buildDigestHtml({
      errors,
      totalCount: all.length,
      processedCount: processed.length,
      errorCount: errors.length,
      windowLabel,
    });

    const subjectPrefix = errors.length > 0 ? `⚠️ ${errors.length} webhook error${errors.length === 1 ? "" : "s"}` : "✅ Webhooks healthy";
    const subject = `[Seats.ca Admin] ${subjectPrefix} · last 24h (${all.length} events)`;

    let queued = 0;
    for (const recipient of recipients) {
      const messageId = `webhook-digest-${recipient}-${new Date().toISOString().slice(0, 10)}`;

      // Log pending send
      await supabase.from("email_send_log").insert({
        message_id: messageId,
        template_name: "webhook-error-digest",
        recipient_email: recipient,
        status: "pending",
        metadata: { error_count: errors.length, total_count: all.length },
      });

      const { error: enqErr } = await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          message_id: messageId,
          template_name: "webhook-error-digest",
          recipient,
          subject,
          html,
          from: FROM_EMAIL,
        },
      });

      if (enqErr) {
        await supabase.from("email_send_log").insert({
          message_id: messageId,
          template_name: "webhook-error-digest",
          recipient_email: recipient,
          status: "failed",
          error_message: enqErr.message,
        });
        continue;
      }
      queued += 1;
    }

    return new Response(
      JSON.stringify({
        queued,
        recipients: recipients.length,
        total_events: all.length,
        processed: processed.length,
        errors: errors.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook-error-digest] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
