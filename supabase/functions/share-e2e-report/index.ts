// Send an E2E test report to an arbitrary email address (admin only).
// Enqueues through the Lovable Emails pipeline (pgmq `transactional_emails` queue)
// so sends use the project's verified sender domain (notify.seats.ca).
import { createClient } from "npm:@supabase/supabase-js@2";
const SENDER_DOMAIN = "notify.seats.ca";
const FROM_EMAIL = "noreply@seats.ca";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TemplateResult {
  template: string;
  trigger: string;
  status: string;
  passed: boolean;
  recipient: string | null;
  error: string | null;
  loggedAt: string | null;
}

interface Step {
  id: string;
  label: string;
  status: string;
  detail?: string;
  startedAt?: number;
  endedAt?: number;
}

interface Payload {
  recipientEmail: string;
  note?: string;
  stage: string;
  buyerEmail?: string | null;
  orderInfo?: { orderId: string; transferId: string | null; transferAlias: string | null } | null;
  steps: Step[];
  assertion: {
    totalExpected: number;
    passCount: number;
    failCount: number;
    summary: TemplateResult[];
  } | null;
  logs: Array<{ ts: string; msg: string; kind?: string }>;
  generatedAt: string;
}

const escapeHtml = (s: string) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isValidEmail = (e: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 320;

const stepBadgeColor = (status: string) => {
  switch (status) {
    case "done": return "#10b981";
    case "failed": return "#ef4444";
    case "running": return "#3b82f6";
    case "skipped": return "#9ca3af";
    default: return "#6b7280";
  }
};

const stepDuration = (s: Step) => {
  if (!s.startedAt) return "";
  const end = s.endedAt ?? Date.now();
  const ms = end - s.startedAt;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

function buildReportHtml(p: Payload, sharedBy: string): string {
  const stageLabel =
    p.stage === "done" ? "All steps complete"
    : p.stage === "error" ? "Failed"
    : p.stage === "running" ? "Running"
    : "Idle";
  const stageColor = stageBadgeColor(p.stage);

  const stepsHtml = p.steps.map((s) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;vertical-align:top;">
        ${escapeHtml(s.label)}
        ${s.detail ? `<div style="margin-top:4px;font-family:ui-monospace,monospace;font-size:11px;color:${s.status === "failed" ? "#ef4444" : "#6b7280"};">${escapeHtml(s.detail)}</div>` : ""}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">
        <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;text-transform:uppercase;color:#fff;background:${stepBadgeColor(s.status)};">${escapeHtml(s.status)}</span>
        ${stepDuration(s) ? `<div style="margin-top:4px;font-size:11px;color:#6b7280;">${escapeHtml(stepDuration(s))}</div>` : ""}
      </td>
    </tr>
  `).join("");

  const assertionHtml = p.assertion ? `
    <h2 style="font-size:16px;color:#111827;margin:24px 0 8px;">Email Template Coverage — ${p.assertion.passCount}/${p.assertion.totalExpected} passed</h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      ${p.assertion.summary.map((s) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;vertical-align:top;">
            <code style="font-family:ui-monospace,monospace;font-weight:600;color:#111827;">${escapeHtml(s.template)}</code>
            <div style="margin-top:2px;font-size:11px;color:#6b7280;">trigger: ${escapeHtml(s.trigger)}${s.recipient ? ` · → ${escapeHtml(s.recipient)}` : ""}</div>
            ${s.error ? `<div style="margin-top:2px;font-size:11px;color:#ef4444;">${escapeHtml(s.error)}</div>` : ""}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap;">
            <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;text-transform:uppercase;color:#fff;background:${s.passed ? "#10b981" : "#ef4444"};">${escapeHtml(s.status)}</span>
          </td>
        </tr>
      `).join("")}
    </table>
  ` : "";

  const orderHtml = p.orderInfo ? `
    <p style="margin:8px 0;font-size:13px;color:#374151;">
      <strong>Order:</strong> <code style="font-family:ui-monospace,monospace;">${escapeHtml(p.orderInfo.orderId)}</code>
      ${p.orderInfo.transferAlias ? ` · <strong>Alias:</strong> <code style="font-family:ui-monospace,monospace;">${escapeHtml(p.orderInfo.transferAlias)}</code>` : ""}
    </p>
  ` : "";

  const noteHtml = p.note ? `
    <div style="margin:16px 0;padding:12px;border-left:3px solid #3b82f6;background:#eff6ff;border-radius:4px;">
      <div style="font-size:11px;color:#1e40af;font-weight:600;text-transform:uppercase;margin-bottom:4px;">Note from ${escapeHtml(sharedBy)}</div>
      <div style="font-size:13px;color:#1e3a8a;white-space:pre-wrap;">${escapeHtml(p.note)}</div>
    </div>
  ` : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>E2E Test Report</title></head>
<body style="margin:0;padding:24px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
    <div style="border-bottom:2px solid #f3f4f6;padding-bottom:16px;margin-bottom:20px;">
      <h1 style="margin:0;font-size:20px;color:#111827;">Seats.ca — E2E Test Report</h1>
      <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Shared by ${escapeHtml(sharedBy)} · ${escapeHtml(new Date(p.generatedAt).toLocaleString())}</p>
    </div>

    ${noteHtml}

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
      <span style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:600;color:#fff;background:${stageColor};">${escapeHtml(stageLabel)}</span>
      ${p.buyerEmail ? `<span style="font-size:12px;color:#6b7280;">buyer: ${escapeHtml(p.buyerEmail)}</span>` : ""}
    </div>
    ${orderHtml}

    <h2 style="font-size:16px;color:#111827;margin:24px 0 8px;">Test Steps</h2>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      ${stepsHtml}
    </table>

    ${assertionHtml}

    ${p.logs.length > 0 ? `
      <h2 style="font-size:16px;color:#111827;margin:24px 0 8px;">Live Log (last ${Math.min(p.logs.length, 50)} entries)</h2>
      <pre style="background:#f3f4f6;padding:12px;border-radius:8px;font-family:ui-monospace,monospace;font-size:11px;color:#374151;overflow-x:auto;white-space:pre-wrap;max-height:none;">${
        escapeHtml(p.logs.slice(-50).map(l => `[${l.ts}] ${l.msg}`).join("\n"))
      }</pre>
    ` : ""}

    <p style="margin-top:24px;padding-top:16px;border-top:1px solid #f3f4f6;font-size:11px;color:#9ca3af;text-align:center;">
      This is an internal diagnostic report from the Seats.ca admin E2E testing tool.
    </p>
  </div>
</body></html>`;
}

function stageBadgeColor(stage: string) {
  switch (stage) {
    case "done": return "#10b981";
    case "error": return "#ef4444";
    case "running": return "#3b82f6";
    default: return "#6b7280";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id, _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as Payload;

    if (!payload.recipientEmail || !isValidEmail(payload.recipientEmail)) {
      return new Response(JSON.stringify({ error: "Invalid recipient email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (payload.note && payload.note.length > 2000) {
      return new Response(JSON.stringify({ error: "Note too long (max 2000 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sharedBy = userData.user.email ?? "an admin";
    const html = buildReportHtml(payload, sharedBy);
    const passText = payload.assertion
      ? `${payload.assertion.passCount}/${payload.assertion.totalExpected} templates`
      : payload.stage;
    const subject = `Seats.ca E2E Report — ${passText} — ${new Date(payload.generatedAt).toLocaleString()}`;

    // Enqueue through the Lovable Emails pipeline so we use the verified
    // sender domain. `process-email-queue` will drain it within a few seconds.
    const messageId = crypto.randomUUID();
    const { error: enqueueError } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to: payload.recipientEmail,
        from: `Seats.ca Admin <${FROM_EMAIL}>`,
        sender_domain: SENDER_DOMAIN,
        reply_to: sharedBy,
        subject,
        html,
        text: subject,
        purpose: "transactional",
        idempotency_key: messageId,
        template_name: "e2e-report",
      },
    });

    if (enqueueError) {
      console.error("enqueue_email error", enqueueError);
      return new Response(JSON.stringify({ error: "Failed to enqueue email", detail: enqueueError.message }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: messageId, queued: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("share-e2e-report error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
