import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  PlayCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Circle,
  History,
  Eye,
} from "lucide-react";

const STORAGE_KEY = "admin-e2e-test-state-v1";

interface PersistedState {
  stage: Stage;
  steps: Step[];
  logs: Array<{ ts: string; msg: string; kind?: "info" | "ok" | "warn" | "err" }>;
  buyerEmail: string;
  checkoutUrl: string | null;
  orderInfo: { orderId: string; transferId: string | null; transferAlias: string | null } | null;
  assertion: AssertResult | null;
  savedAt: number;
}

interface TemplateResult {
  template: string;
  trigger: string;
  status: string;
  passed: boolean;
  recipient: string | null;
  error: string | null;
  loggedAt: string | null;
}

interface AssertResult {
  totalExpected: number;
  passCount: number;
  failCount: number;
  summary: TemplateResult[];
}

type StepStatus = "pending" | "running" | "done" | "failed" | "skipped";

interface Step {
  id: string;
  label: string;
  description: string;
  status: StepStatus;
  detail?: string;
  startedAt?: number;
  endedAt?: number;
}

const INITIAL_STEPS: Step[] = [
  { id: "start",       label: "1. Create Stripe Checkout session", description: "Calls run-purchase-test → action:start. Picks a future event + ticket and creates a $0.50 CAD checkout.", status: "pending" },
  { id: "open",        label: "2. Open Checkout in new tab",       description: "Opens the Stripe-hosted Checkout URL. You complete the real card payment.", status: "pending" },
  { id: "poll",        label: "3. Poll for webhook-created order", description: "Waits up to 5 min for stripe-webhook to insert orders + order_transfers rows.", status: "pending" },
  { id: "trigger",     label: "4. Trigger downstream email paths", description: "Calls notify-buyer-transfer (confirm + dispute), resolve-transfer-email, fallback + relay reminders, proof reminder, seller-application.", status: "pending" },
  { id: "queue_wait",  label: "5. Wait for queue dispatcher",      description: "Sleeps 8s so process-email-queue can drain enqueued emails before assertion.", status: "pending" },
  { id: "assert",      label: "6. Assert email_send_log coverage", description: "Verifies every expected template logged a row with status sent or pending.", status: "pending" },
];

type Stage =
  | "idle"
  | "running"
  | "done"
  | "error";

const AdminE2ETest = () => {
  const [stage, setStage] = useState<Stage>("idle");
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<Array<{ ts: string; msg: string; kind?: "info" | "ok" | "warn" | "err" }>>([]);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<{
    orderId: string;
    transferId: string | null;
    transferAlias: string | null;
  } | null>(null);
  const [assertion, setAssertion] = useState<AssertResult | null>(null);
  const [clearing, setClearing] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  // ── Persist state across page reloads / auth redirects ─────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved: PersistedState = JSON.parse(raw);
      // Only restore if saved within last 24h
      if (Date.now() - saved.savedAt > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      setStage(saved.stage === "running" ? "error" : saved.stage);
      setSteps(
        saved.stage === "running"
          ? saved.steps.map((s) => (s.status === "running" ? { ...s, status: "failed", detail: "Interrupted (page reload / logout)" } : s))
          : saved.steps
      );
      setLogs(saved.logs);
      setBuyerEmail(saved.buyerEmail);
      setCheckoutUrl(saved.checkoutUrl);
      setOrderInfo(saved.orderInfo);
      setAssertion(saved.assertion);
      setRestoredFromStorage(true);
      if (saved.stage === "running") {
        toast.info("Restored test state — your last test was interrupted. Use 'Re-assert' to verify emails.");
      }
    } catch (e) {
      console.warn("Failed to restore E2E test state", e);
    }
  }, []);

  useEffect(() => {
    if (stage === "idle") {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload: PersistedState = {
      stage, steps, logs, buyerEmail, checkoutUrl, orderInfo, assertion, savedAt: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, [stage, steps, logs, buyerEmail, checkoutUrl, orderInfo, assertion]);

  const log = (msg: string, kind: "info" | "ok" | "warn" | "err" = "info") => {
    setLogs((l) => [...l, { ts: new Date().toLocaleTimeString(), msg, kind }]);
  };

  const updateStep = (id: string, patch: Partial<Step>) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = { ...s, ...patch };
        if (patch.status === "running" && !s.startedAt) next.startedAt = Date.now();
        if (patch.status && patch.status !== "running" && !s.endedAt) next.endedAt = Date.now();
        return next;
      })
    );
  };

  const recoverLastTest = async () => {
    setRecovering(true);
    log("Looking up your most recent test order…", "info");
    try {
      // Find the most recent $0.50 test order for this admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not signed in");
        setRecovering(false);
        return;
      }
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id, created_at, total_amount")
        .eq("user_id", user.id)
        .gte("total_amount", 0.49)
        .lte("total_amount", 0.51)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      if (!orders || orders.length === 0) {
        toast.warning("No recent $0.50 test orders found in the last 24h");
        log("No recent test order found.", "warn");
        setRecovering(false);
        return;
      }
      const orderId = orders[0].id;
      log(`✓ Found recent test order ${orderId.slice(0, 8)}… (${new Date(orders[0].created_at).toLocaleTimeString()})`, "ok");

      // Pull related transfer for context
      const { data: transfers } = await supabase
        .from("order_transfers")
        .select("id, transfer_email_alias, ticket_id, seller_id")
        .eq("order_id", orderId)
        .limit(1);
      const t = transfers?.[0];

      setOrderInfo({
        orderId,
        transferId: t?.id ?? null,
        transferAlias: t?.transfer_email_alias ?? null,
      });
      // Mark all steps as done so user can see the recovered context
      setSteps(INITIAL_STEPS.map((s) => ({
        ...s,
        status: s.id === "assert" ? "running" : "done",
        detail: s.id === "open" ? "Completed in previous session" : s.id === "poll" ? `Order ${orderId.slice(0, 8)}…` : undefined,
      })));
      setStage("running");

      // Now re-assert against the buyer email
      log("Asserting email_send_log for recovered order…", "info");
      const assertRes = await supabase.functions.invoke("run-purchase-test", {
        body: { action: "assert", buyerEmail: buyerEmail || user.email },
      });
      if (assertRes.error) throw assertRes.error;
      const a = assertRes.data as AssertResult;
      setAssertion(a);
      updateStep("assert", {
        status: a.failCount === 0 ? "done" : "failed",
        detail: `${a.passCount}/${a.totalExpected} templates verified`,
      });
      setStage(a.failCount === 0 ? "done" : "error");
      log(`Result: ${a.passCount}/${a.totalExpected} verified`, a.failCount === 0 ? "ok" : "warn");
      if (a.failCount === 0) toast.success(`All ${a.totalExpected} templates verified ✅`);
      else toast.warning(`${a.failCount} template(s) missing — see results below`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Recovery failed: ${msg}`);
      log(`Recovery error: ${msg}`, "err");
      setStage("error");
    } finally {
      setRecovering(false);
    }
  };

  const failRemaining = (fromId: string) => {
    setSteps((prev) => {
      let hit = false;
      return prev.map((s) => {
        if (s.id === fromId) hit = true;
        if (hit && s.status === "pending") return { ...s, status: "skipped" };
        return s;
      });
    });
  };

  const reset = () => {
    setStage("idle");
    setLogs([]);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending", detail: undefined, startedAt: undefined, endedAt: undefined })));
    setCheckoutUrl(null);
    setOrderInfo(null);
    setAssertion(null);
  };

  const runTest = async () => {
    reset();
    setStage("running");
    log("Starting end-to-end test…");

    // ── Step 1: start ──────────────────────────────────────────────
    updateStep("start", { status: "running" });
    const startRes = await supabase.functions.invoke("run-purchase-test", {
      body: { action: "start", buyerEmail: buyerEmail || undefined },
    });
    if (startRes.error || !startRes.data?.url) {
      const detail = startRes.error?.message || "no URL returned";
      log(`Failed to create checkout: ${detail}`, "err");
      updateStep("start", { status: "failed", detail });
      failRemaining("open");
      setStage("error");
      toast.error("Could not start test");
      return;
    }
    const { url, eventTitle, buyerEmail: usedEmail } = startRes.data as {
      url: string;
      eventTitle: string;
      buyerEmail: string;
    };
    setCheckoutUrl(url);
    updateStep("start", { status: "done", detail: `Event: ${eventTitle} · buyer ${usedEmail}` });
    log(`✓ Checkout session created for "${eventTitle}" → buyer ${usedEmail}`, "ok");

    // ── Step 2: open in new tab ────────────────────────────────────
    updateStep("open", { status: "running" });
    window.open(url, "_blank", "noopener,noreferrer");
    updateStep("open", { status: "done", detail: "Tab opened — pay the $0.50 charge to continue" });
    log("Opened Stripe Checkout in a new tab. Pay the $0.50 charge to continue.", "info");

    // ── Step 3: poll ───────────────────────────────────────────────
    updateStep("poll", { status: "running", detail: "Waiting for webhook…" });
    log("Waiting for Stripe webhook to create the order…", "info");
    const start = Date.now();
    let pollAttempts = 0;
    let order: { orderId: string; transferId: string | null; transferAlias: string | null; ticketId: string | null; sellerId: string | null } | null = null;
    while (Date.now() - start < 5 * 60 * 1000) {
      await new Promise((r) => setTimeout(r, 4000));
      pollAttempts++;
      const elapsed = Math.floor((Date.now() - start) / 1000);
      updateStep("poll", { status: "running", detail: `Attempt ${pollAttempts} · ${elapsed}s elapsed` });
      const pollRes = await supabase.functions.invoke("run-purchase-test", {
        body: { action: "poll" },
      });
      if (pollRes.error) {
        log(`Poll error: ${pollRes.error.message}`, "warn");
        continue;
      }
      if (pollRes.data?.ready) {
        order = pollRes.data;
        break;
      }
      if (pollAttempts % 5 === 0) {
        log(`…still waiting (attempt ${pollAttempts}, ${elapsed}s elapsed).`, "info");
      }
    }
    if (!order) {
      const detail = "Timed out after 5 min. Did you complete checkout? Check stripe_webhook_events for failures.";
      log(detail, "err");
      updateStep("poll", { status: "failed", detail });
      failRemaining("trigger");
      setStage("error");
      return;
    }
    setOrderInfo({
      orderId: order.orderId,
      transferId: order.transferId,
      transferAlias: order.transferAlias,
    });
    updateStep("poll", {
      status: "done",
      detail: `Order ${order.orderId.slice(0, 8)}… · alias ${order.transferAlias ?? "n/a"} (after ${pollAttempts} attempt(s))`,
    });
    log(`✓ Order created: ${order.orderId.slice(0, 8)}… (transfer alias: ${order.transferAlias ?? "n/a"})`, "ok");

    // ── Step 4: trigger downstream emails ──────────────────────────
    updateStep("trigger", { status: "running" });
    log("Triggering all downstream email paths…", "info");
    const trigRes = await supabase.functions.invoke("run-purchase-test", {
      body: {
        action: "trigger",
        orderId: order.orderId,
        transferId: order.transferId,
        ticketId: order.ticketId,
        sellerId: order.sellerId,
        buyerEmail: usedEmail,
      },
    });
    if (trigRes.error) {
      const detail = `Trigger error: ${trigRes.error.message}`;
      log(detail, "err");
      updateStep("trigger", { status: "failed", detail });
      failRemaining("queue_wait");
      setStage("error");
      return;
    }
    const triggered: Array<{ template: string; ok: boolean; detail?: string }> =
      trigRes.data?.triggered ?? [];
    const okCount = triggered.filter((t) => t.ok).length;
    triggered.forEach((t) =>
      log(`${t.ok ? "✓" : "✗"} ${t.template}${t.detail ? ` — ${t.detail}` : ""}`, t.ok ? "ok" : "warn")
    );
    updateStep("trigger", {
      status: okCount === triggered.length ? "done" : "done",
      detail: `${okCount}/${triggered.length} downstream calls succeeded`,
    });

    // ── Step 5: queue wait ─────────────────────────────────────────
    updateStep("queue_wait", { status: "running", detail: "Sleeping 8s…" });
    log("Waiting 8s for queue dispatcher to process emails…", "info");
    await new Promise((r) => setTimeout(r, 8000));
    updateStep("queue_wait", { status: "done", detail: "Queue should have drained" });

    // ── Step 6: assert ─────────────────────────────────────────────
    updateStep("assert", { status: "running" });
    log("Asserting email_send_log entries for each template…", "info");
    const assertRes = await supabase.functions.invoke("run-purchase-test", {
      body: { action: "assert", buyerEmail: usedEmail },
    });
    if (assertRes.error) {
      const detail = `Assert error: ${assertRes.error.message}`;
      log(detail, "err");
      updateStep("assert", { status: "failed", detail });
      setStage("error");
      return;
    }
    const a = assertRes.data as AssertResult;
    setAssertion(a);
    const assertDetail = `${a.passCount}/${a.totalExpected} templates verified`;
    log(`Result: ${assertDetail}`, a.failCount === 0 ? "ok" : "warn");
    updateStep("assert", {
      status: a.failCount === 0 ? "done" : "failed",
      detail: assertDetail,
    });
    setStage(a.failCount === 0 ? "done" : "error");
    if (a.failCount === 0) toast.success(`All ${a.totalExpected} email templates verified ✅`);
    else toast.warning(`${a.failCount} template(s) missing — see results below`);
  };

  const reAssert = async () => {
    updateStep("assert", { status: "running" });
    log("Re-checking email_send_log…", "info");
    const r = await supabase.functions.invoke("run-purchase-test", {
      body: { action: "assert", buyerEmail },
    });
    if (r.data) {
      const a = r.data as AssertResult;
      setAssertion(a);
      log(`Updated: ${a.passCount}/${a.totalExpected} verified`, "ok");
      updateStep("assert", {
        status: a.failCount === 0 ? "done" : "failed",
        detail: `${a.passCount}/${a.totalExpected} templates verified`,
      });
      setStage(a.failCount === 0 ? "done" : "error");
    }
  };

  const clearTestData = async () => {
    if (!confirm("Delete all $0.50 test orders, items and transfers from the last 24h? Email log rows will be retained for audit.")) return;
    setClearing(true);
    const r = await supabase.functions.invoke("clear-test-data", {
      body: { sinceHours: 24 },
    });
    setClearing(false);
    if (r.error) {
      toast.error(`Clear failed: ${r.error.message}`);
      return;
    }
    const d = r.data as { ordersDeleted: number; inventoryRestored: number; emailsInWindow: number };
    // Also wipe the on-screen test results + persisted localStorage state
    reset();
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    toast.success(
      `Cleared ${d.ordersDeleted} order(s), restored ${d.inventoryRestored} ticket(s). ${d.emailsInWindow} email log row(s) retained. Screen reset.`
    );
  };

  const isRunning = stage === "running";
  const currentStep = steps.find((s) => s.status === "running");
  const focusableStep =
    currentStep ?? steps.find((s) => s.status === "failed") ?? steps.slice().reverse().find((s) => s.status === "done");
  const [flashStepId, setFlashStepId] = useState<string | null>(null);

  const viewStepDetails = () => {
    const target = focusableStep;
    if (!target) {
      toast.info("No active step to focus");
      return;
    }
    const el = document.getElementById(`e2e-step-${target.id}`);
    if (!el) {
      toast.warning("Step row not visible yet");
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashStepId(target.id);
    setTimeout(() => setFlashStepId(null), 1800);
  };

  const stepIcon = (status: StepStatus) => {
    switch (status) {
      case "running": return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case "done":    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "failed":  return <XCircle className="h-5 w-5 text-destructive" />;
      case "skipped": return <Circle className="h-5 w-5 text-muted-foreground/40" />;
      default:        return <Circle className="h-5 w-5 text-muted-foreground/60" />;
    }
  };

  const stepDuration = (s: Step) => {
    if (!s.startedAt) return null;
    const end = s.endedAt ?? Date.now();
    const ms = end - s.startedAt;
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <PlayCircle className="h-5 w-5 text-primary" />
            End-to-End Purchase Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-amber-500/40 bg-amber-500/5 p-4 text-sm space-y-1">
            <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> This runs a real $0.50 CAD charge in Live mode.
            </p>
            <p className="text-muted-foreground">
              A real Stripe Checkout opens in a new tab. After payment, the test polls for the
              webhook-created order, then triggers every downstream email path (transfer relay,
              fallback, proof reminder, dispute, application) and asserts each template emitted a
              row to <code className="px-1 rounded bg-muted">email_send_log</code>.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyer-email">Buyer email (defaults to your admin email)</Label>
            <Input
              id="buyer-email"
              type="email"
              placeholder="optional — override buyer email for this test"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={runTest} disabled={isRunning || recovering} className="gap-2">
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              {isRunning ? (currentStep?.label ?? "Running…") : "Run E2E Test"}
            </Button>
            <Button
              variant="secondary"
              onClick={recoverLastTest}
              disabled={isRunning || recovering}
              className="gap-2"
              title="Find your most recent $0.50 test order and re-run the email assertion (use this after a logout/redirect)"
            >
              {recovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
              Recover Last Test
            </Button>
            {checkoutUrl && isRunning && (
              <Button variant="outline" onClick={() => window.open(checkoutUrl, "_blank")} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Re-open Checkout
              </Button>
            )}
            {(stage === "done" || stage === "error") && orderInfo && (
              <Button variant="outline" onClick={reAssert} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Re-assert
              </Button>
            )}
            {(stage === "done" || stage === "error") && (
              <Button variant="ghost" onClick={reset}>Reset</Button>
            )}
            <Button
              variant="destructive"
              onClick={clearTestData}
              disabled={clearing}
              className="gap-2 ml-auto"
            >
              {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Clear Test Data
            </Button>
          </div>

          {restoredFromStorage && stage !== "idle" && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <strong>Restored from previous session.</strong> Your last test state was recovered from local storage.
              {stage === "error" && " The test was interrupted (likely by a logout/redirect) — click 'Recover Last Test' to verify the order's emails actually went out."}
            </div>
          )}


          {orderInfo && (
            <div className="text-sm text-muted-foreground">
              order <code className="px-1 rounded bg-muted">{orderInfo.orderId.slice(0, 8)}</code>
              {orderInfo.transferAlias && (
                <> · alias <code className="px-1 rounded bg-muted">{orderInfo.transferAlias}</code></>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step-by-step progress tracker — always visible after first run */}
      {(stage !== "idle") && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center justify-between gap-2 flex-wrap">
              <span>Test Steps</span>
              <div className="flex items-center gap-2">
                <Badge variant={stage === "done" ? "default" : stage === "error" ? "destructive" : "secondary"}>
                  {stage === "done" ? "All steps complete" : stage === "error" ? "Failed" : "Running…"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={viewStepDetails}
                  disabled={!focusableStep}
                  className="gap-1.5 h-7 px-2 text-xs"
                  title={
                    focusableStep
                      ? `Jump to "${focusableStep.label}" — opens its logs and results inline`
                      : "No active step yet"
                  }
                >
                  <Eye className="h-3 w-3" />
                  View step details
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {steps.map((s) => {
                const dur = stepDuration(s);
                return (
                  <li
                    key={s.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                      s.status === "running"
                        ? "border-primary/50 bg-primary/5"
                        : s.status === "failed"
                        ? "border-destructive/50 bg-destructive/5"
                        : s.status === "done"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border"
                    }`}
                  >
                    <div className="pt-0.5">{stepIcon(s.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${s.status === "skipped" ? "text-muted-foreground/60" : ""}`}>
                          {s.label}
                        </span>
                        <Badge
                          variant={
                            s.status === "done" ? "default" :
                            s.status === "failed" ? "destructive" :
                            s.status === "running" ? "secondary" :
                            "outline"
                          }
                          className="text-[10px] uppercase tracking-wide"
                        >
                          {s.status}
                        </Badge>
                        {dur && (
                          <span className="text-xs text-muted-foreground">· {dur}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                      {s.detail && (
                        <p
                          className={`text-xs mt-1 font-mono ${
                            s.status === "failed" ? "text-destructive" : "text-foreground/70"
                          }`}
                        >
                          {s.detail}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}

      {logs.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="font-display text-base">Live Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/50 p-3 font-mono text-xs max-h-72 overflow-y-auto space-y-1">
              {logs.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.kind === "ok" ? "text-emerald-600 dark:text-emerald-400" :
                    l.kind === "err" ? "text-destructive" :
                    l.kind === "warn" ? "text-amber-600 dark:text-amber-400" :
                    "text-muted-foreground"
                  }
                >
                  <span className="opacity-60">[{l.ts}]</span> {l.msg}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {assertion && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center justify-between">
              <span>Email Template Coverage</span>
              <Badge variant={assertion.failCount === 0 ? "default" : "destructive"}>
                {assertion.passCount}/{assertion.totalExpected} passed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assertion.summary.map((s) => (
                <div
                  key={s.template}
                  className="flex items-start gap-3 rounded-lg border border-border p-3"
                >
                  <div className="pt-0.5">
                    {s.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : s.status === "missing" ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-semibold">{s.template}</code>
                      <Badge variant="outline" className="text-xs">{s.trigger}</Badge>
                      <Badge
                        variant={s.passed ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {s.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {s.recipient && <>→ {s.recipient}</>}
                      {s.loggedAt && <> · logged {new Date(s.loggedAt).toLocaleTimeString()}</>}
                      {s.error && <span className="text-destructive"> · {s.error}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminE2ETest;
