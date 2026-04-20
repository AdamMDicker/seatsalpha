import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertCircle, CheckCircle2, Clock, SkipForward, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type WebhookEvent = {
  id: string;
  stripe_event_id: string;
  event_type: string;
  source: string;
  status: string;
  processing_ms: number | null;
  error_message: string | null;
  payload_summary: Record<string, unknown> | null;
  received_at: string;
  completed_at: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  processed: "bg-green-500/10 text-green-500 border-green-500/30",
  processing_error: "bg-destructive/10 text-destructive border-destructive/30",
  duplicate: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  ignored: "bg-muted text-muted-foreground border-border",
  skipped: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  received: "bg-secondary text-secondary-foreground border-border",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "processed") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "processing_error") return <AlertCircle className="h-3.5 w-3.5" />;
  if (status === "duplicate" || status === "skipped" || status === "ignored")
    return <SkipForward className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
};

const AdminWebhookEvents = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("stripe_webhook_events")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) {
      toast({ title: "Failed to load events", description: error.message, variant: "destructive" });
    } else {
      setEvents((data as WebhookEvent[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filteredEvents = events.filter((e) =>
    search.trim()
      ? e.stripe_event_id.toLowerCase().includes(search.toLowerCase()) ||
        e.event_type.toLowerCase().includes(search.toLowerCase())
      : true,
  );

  const handleReplay = async (eventId: string) => {
    setReplayingId(eventId);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-replay-stripe-event",
        { body: { stripe_event_id: eventId, force: false } },
      );
      if (error) throw error;
      if (data?.already_processed) {
        toast({
          title: "Already processed",
          description: "An order already exists. Use the Replay Webhook tab with 'force' to override.",
        });
      } else {
        toast({
          title: "Replay sent",
          description: `Webhook returned ${data?.status}. Refreshing list...`,
        });
        await load();
      }
    } catch (err) {
      toast({
        title: "Replay failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setReplayingId(null);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "Copied", description: id });
  };

  const counts = {
    total: events.length,
    errors: events.filter((e) => e.status === "processing_error").length,
    processed: events.filter((e) => e.status === "processed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold mb-1">Stripe Webhook Audit Log</h2>
          <p className="text-sm text-muted-foreground">
            Every signed Stripe webhook delivery is recorded here. Use this to spot silent failures.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total (last 200)</p>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Processed</p>
          <p className="text-2xl font-bold text-green-500">{counts.processed}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Errors</p>
          <p className="text-2xl font-bold text-destructive">{counts.errors}</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {["all", "processed", "processing_error", "duplicate", "ignored", "skipped"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <Input
          placeholder="Search by event id or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-left px-4 py-2.5 font-medium">Event ID</th>
                <th className="text-left px-4 py-2.5 font-medium">Type</th>
                <th className="text-left px-4 py-2.5 font-medium">Source</th>
                <th className="text-left px-4 py-2.5 font-medium">Time (ms)</th>
                <th className="text-left px-4 py-2.5 font-medium">Received</th>
                <th className="text-right px-4 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filteredEvents.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No webhook events found</td></tr>
              ) : (
                filteredEvents.map((ev) => (
                  <tr key={ev.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                    <td className="px-4 py-2.5">
                      <Badge
                        variant="outline"
                        className={`gap-1 ${STATUS_STYLES[ev.status] || STATUS_STYLES.received}`}
                      >
                        <StatusIcon status={ev.status} />
                        {ev.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => copyId(ev.stripe_event_id)}
                        className="font-mono text-xs hover:text-primary inline-flex items-center gap-1.5"
                        title="Click to copy"
                      >
                        {ev.stripe_event_id.slice(0, 24)}...
                        <Copy className="h-3 w-3 opacity-50" />
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-xs">{ev.event_type}</td>
                    <td className="px-4 py-2.5 text-xs capitalize">{ev.source}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {ev.processing_ms ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {new Date(ev.received_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {ev.event_type === "checkout.session.completed" &&
                        (ev.status === "processing_error" || ev.status === "received") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReplay(ev.stripe_event_id)}
                            disabled={replayingId === ev.stripe_event_id}
                          >
                            <RefreshCw
                              className={`h-3 w-3 mr-1 ${replayingId === ev.stripe_event_id ? "animate-spin" : ""}`}
                            />
                            Replay
                          </Button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEvents.some((e) => e.error_message) && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Recent Errors</h3>
          {filteredEvents
            .filter((e) => e.error_message)
            .slice(0, 5)
            .map((e) => (
              <div key={e.id} className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <p className="font-mono text-xs text-muted-foreground mb-1">{e.stripe_event_id}</p>
                <p className="text-xs text-destructive">{e.error_message}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminWebhookEvents;
