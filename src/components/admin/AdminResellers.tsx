import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Reseller = Tables<"resellers"> & { status: string };

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  live: { label: "Live", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  disabled: { label: "Disabled", variant: "destructive" },
};

const AdminResellers = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchResellers = async () => {
    const { data } = await supabase.from("resellers").select("*");
    setResellers((data as Reseller[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchResellers(); }, []);

  const setStatus = async (reseller: Reseller, newStatus: string) => {
    const isEnabled = newStatus === "live";
    const { error } = await supabase
      .from("resellers")
      .update({ is_enabled: isEnabled, status: newStatus } as any)
      .eq("id", reseller.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Reseller set to ${statusConfig[newStatus]?.label || newStatus}` });
    fetchResellers();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-6">Resellers ({resellers.length})</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Manage reseller applications. Set each reseller to Live, Disabled, or Pending.
      </p>

      <div className="space-y-3">
        {resellers.map((r) => {
          const currentStatus = r.status || (r.is_enabled ? "live" : "pending");
          const config = statusConfig[currentStatus] || statusConfig.pending;

          return (
            <div key={r.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{r.business_name}</h3>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {r.first_name} {r.last_name} {r.email ? `• ${r.email}` : ""} {r.phone ? `• ${r.phone}` : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.ticket_count ? `${r.ticket_count} tickets` : "No ticket count"} • Joined {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {currentStatus !== "live" && (
                  <Button variant="hero" size="sm" onClick={() => setStatus(r, "live")}>
                    Set Live
                  </Button>
                )}
                {currentStatus !== "pending" && (
                  <Button variant="glass" size="sm" onClick={() => setStatus(r, "pending")}>
                    Set Pending
                  </Button>
                )}
                {currentStatus !== "disabled" && (
                  <Button variant="destructive" size="sm" onClick={() => setStatus(r, "disabled")}>
                    Disable
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {resellers.length === 0 && <p className="text-muted-foreground text-center py-8">No reseller applications yet.</p>}
      </div>
    </div>
  );
};

export default AdminResellers;
