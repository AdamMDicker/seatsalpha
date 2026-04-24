import { useState } from "react";
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
} from "lucide-react";

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

type Stage =
  | "idle"
  | "starting"
  | "awaiting_payment"
  | "polling"
  | "triggering"
  | "asserting"
  | "done"
  | "error";

const AdminE2ETest = () => {
  const [stage, setStage] = useState<Stage>("idle");
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

  const log = (msg: string, kind: "info" | "ok" | "warn" | "err" = "info") => {
    setLogs((l) => [...l, { ts: new Date().toLocaleTimeString(), msg, kind }]);
  };

  const reset = () => {
    setStage("idle");
    setLogs([]);
    setCheckoutUrl(null);
    setOrderInfo(null);
    setAssertion(null);
  };

  const runTest = async () => {
    reset();
    setStage("starting");
    log("Starting end-to-end test…");

    // Step 1: start
    const startRes = await supabase.functions.invoke("run-purchase-test", {
      body: { action: "start", buyerEmail: buyerEmail || undefined },
    });
    if (startRes.error || !startRes.data?.url) {
      log(`Failed to create checkout: ${startRes.error?.message || "no URL"}`, "err");
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
    log(`Checkout session created for "${eventTitle}" → buyer ${usedEmail}`, "ok");
    log("Opening Stripe Checkout in a new tab. Pay the $0.50 charge to continue.", "info");
    window.open(url, "_blank", "noopener,noreferrer");
    setStage("awaiting_payment");

    // Step 2: poll for completed order
    setStage("polling");
    log("Waiting for Stripe webhook to create the order…", "info");
    const start = Date.now();
    let order: { orderId: string; transferId: string | null; transferAlias: string | null; ticketId: string | null; sellerId: string | null } | null = null;
    while (Date.now() - start < 5 * 60 * 1000) {
      await new Promise((r) => setTimeout(r, 4000));
      const pollRes = await supabase.functions.invoke("run-purchase-test", {
        body: { action: "poll" },
      });
      if (pollRes.data?.ready) {
        order = pollRes.data;
        break;
      }
      log("…still waiting (will time out after 5 min).", "info");
    }
    if (!order) {
      log("Timed out waiting for order. Did you complete checkout?", "err");
      setStage("error");
      return;
    }
    setOrderInfo({
      orderId: order.orderId,
      transferId: order.transferId,
      transferAlias: order.transferAlias,
    });
    log(`✅ Order created: ${order.orderId.slice(0, 8)}… (transfer alias: ${order.transferAlias ?? "n/a"})`, "ok");

    // Step 3: trigger downstream emails
    setStage("triggering");
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
      log(`Trigger error: ${trigRes.error.message}`, "err");
    } else {
      const triggered: Array<{ template: string; ok: boolean; detail?: string }> =
        trigRes.data?.triggered ?? [];
      triggered.forEach((t) =>
        log(`${t.ok ? "✓" : "✗"} ${t.template}${t.detail ? ` — ${t.detail}` : ""}`, t.ok ? "ok" : "warn")
      );
    }

    // Wait briefly for emails to flush through the queue.
    log("Waiting 8s for queue dispatcher to process emails…", "info");
    await new Promise((r) => setTimeout(r, 8000));

    // Step 4: assert
    setStage("asserting");
    log("Asserting email_send_log entries for each template…", "info");
    const assertRes = await supabase.functions.invoke("run-purchase-test", {
      body: { action: "assert", buyerEmail: usedEmail },
    });
    if (assertRes.error) {
      log(`Assert error: ${assertRes.error.message}`, "err");
      setStage("error");
      return;
    }
    const a = assertRes.data as AssertResult;
    setAssertion(a);
    log(`Result: ${a.passCount}/${a.totalExpected} templates verified`, a.failCount === 0 ? "ok" : "warn");
    setStage("done");
    if (a.failCount === 0) toast.success(`All ${a.totalExpected} email templates verified ✅`);
    else toast.warning(`${a.failCount} template(s) missing — see results below`);
  };

  const reAssert = async () => {
    setStage("asserting");
    log("Re-checking email_send_log…", "info");
    const r = await supabase.functions.invoke("run-purchase-test", {
      body: { action: "assert", buyerEmail },
    });
    if (r.data) {
      setAssertion(r.data as AssertResult);
      log(`Updated: ${r.data.passCount}/${r.data.totalExpected} verified`, "ok");
    }
    setStage("done");
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
    toast.success(
      `Cleared ${d.ordersDeleted} order(s), restored ${d.inventoryRestored} ticket(s). ${d.emailsInWindow} email log row(s) retained.`
    );
  };

  const stageLabel = (() => {
    switch (stage) {
      case "starting": return "Creating checkout session…";
      case "awaiting_payment": return "Awaiting payment in new tab…";
      case "polling": return "Polling for webhook-created order…";
      case "triggering": return "Triggering downstream emails…";
      case "asserting": return "Asserting delivery…";
      case "done": return "Complete";
      case "error": return "Error";
      default: return "Ready";
    }
  })();

  const isRunning = stage !== "idle" && stage !== "done" && stage !== "error";

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
            <Button onClick={runTest} disabled={isRunning} className="gap-2">
              {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              {isRunning ? stageLabel : "Run E2E Test"}
            </Button>
            {checkoutUrl && stage === "awaiting_payment" && (
              <Button variant="outline" onClick={() => window.open(checkoutUrl, "_blank")} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Re-open Checkout
              </Button>
            )}
            {stage === "done" && (
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

          <div className="flex items-center gap-2 text-sm">
            <Badge variant={stage === "done" ? "default" : stage === "error" ? "destructive" : "secondary"}>
              {stageLabel}
            </Badge>
            {orderInfo && (
              <span className="text-muted-foreground">
                · order <code className="px-1 rounded bg-muted">{orderInfo.orderId.slice(0, 8)}</code>
                {orderInfo.transferAlias && (
                  <> · alias <code className="px-1 rounded bg-muted">{orderInfo.transferAlias}</code></>
                )}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

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
