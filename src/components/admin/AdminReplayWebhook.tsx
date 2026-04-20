import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertTriangle } from "lucide-react";

const AdminReplayWebhook = () => {
  const { toast } = useToast();
  const [eventId, setEventId] = useState("");
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const handleReplay = async () => {
    const trimmed = eventId.trim();
    if (!trimmed.startsWith("evt_")) {
      toast({
        title: "Invalid event ID",
        description: "Stripe event IDs start with 'evt_'.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-replay-stripe-event",
        { body: { stripe_event_id: trimmed, force } },
      );
      if (error) throw error;
      setResult(data);
      if (data?.already_processed) {
        toast({
          title: "Already processed",
          description: `An order already exists for ${trimmed}. Enable "force" to replay anyway.`,
        });
      } else if (data?.ok) {
        toast({
          title: "Replay succeeded",
          description: `Webhook returned ${data?.status}. Check Orders & Transfers tabs.`,
        });
      } else {
        toast({
          title: "Replay returned non-2xx",
          description: `Status: ${data?.status ?? "unknown"}. See details below.`,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Replay failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
      setResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Replay Stripe Webhook Event</h2>
        <p className="text-sm text-muted-foreground">
          Manually re-fire a <code className="text-xs bg-secondary px-1 py-0.5 rounded">checkout.session.completed</code> event
          from Stripe. Use this to recover from logged <code className="text-xs bg-secondary px-1 py-0.5 rounded">processing_error</code> deliveries.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-id">Stripe Event ID</Label>
          <Input
            id="event-id"
            placeholder="evt_1AbCdEfGhIjKlMnO..."
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            disabled={loading}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Find this in your Stripe Dashboard → Developers → Events.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="force"
            checked={force}
            onCheckedChange={(v) => setForce(v === true)}
            disabled={loading}
          />
          <div className="space-y-1">
            <Label htmlFor="force" className="cursor-pointer flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
              Force replay (event already has an order)
            </Label>
            <p className="text-xs text-muted-foreground">
              Detaches the existing order's stripe_event_id and re-runs fulfillment. Use only if the original processing failed mid-way.
            </p>
          </div>
        </div>

        <Button onClick={handleReplay} disabled={loading || !eventId.trim()}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Replaying..." : "Replay Event"}
        </Button>
      </div>

      {result !== null && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm font-semibold mb-2">Response</p>
          <pre className="text-xs bg-secondary p-3 rounded overflow-x-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminReplayWebhook;
