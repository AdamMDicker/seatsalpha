import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

import nhlLogo from "@/assets/leagues/nhl.png";
import nbaLogo from "@/assets/leagues/nba.png";
import mlbLogo from "@/assets/leagues/mlb.png";
import nflLogo from "@/assets/leagues/nfl.png";
import mlsLogo from "@/assets/leagues/mls.png";
import cflLogo from "@/assets/leagues/cfl.png";

type Reseller = Tables<"resellers"> & { status: string };

const LEAGUES = [
  { key: "NHL", logo: nhlLogo },
  { key: "NBA", logo: nbaLogo },
  { key: "MLB", logo: mlbLogo },
  { key: "NFL", logo: nflLogo },
  { key: "MLS", logo: mlsLogo },
  { key: "CFL", logo: cflLogo },
] as const;

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  live: { label: "Live", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  disabled: { label: "Disabled", variant: "destructive" },
};

type LeagueMap = Record<string, Record<string, boolean>>;

const AdminResellers = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [leagueMap, setLeagueMap] = useState<LeagueMap>({});
  const { toast } = useToast();

  const fetchResellers = async () => {
    const { data } = await supabase.from("resellers").select("*");
    setResellers((data as Reseller[]) || []);
    setLoading(false);
  };

  const fetchLeagues = async () => {
    const { data } = await supabase.from("reseller_leagues" as any).select("*");
    const map: LeagueMap = {};
    if (data) {
      (data as any[]).forEach((row: any) => {
        if (!map[row.reseller_id]) map[row.reseller_id] = {};
        map[row.reseller_id][row.league] = row.is_enabled;
      });
    }
    setLeagueMap(map);
  };

  useEffect(() => {
    fetchResellers();
    fetchLeagues();
  }, []);

  const toggleLeague = async (resellerId: string, league: string) => {
    const currentlyEnabled = leagueMap[resellerId]?.[league] ?? false;
    const newEnabled = !currentlyEnabled;

    // Optimistic update
    setLeagueMap((prev) => ({
      ...prev,
      [resellerId]: { ...prev[resellerId], [league]: newEnabled },
    }));

    // Check if record exists
    const { data: existing } = await (supabase.from("reseller_leagues" as any) as any)
      .select("id")
      .eq("reseller_id", resellerId)
      .eq("league", league)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await (supabase.from("reseller_leagues" as any) as any)
        .update({ is_enabled: newEnabled })
        .eq("id", existing.id));
    } else {
      ({ error } = await (supabase.from("reseller_leagues" as any) as any)
        .insert({ reseller_id: resellerId, league, is_enabled: newEnabled }));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      // Revert
      setLeagueMap((prev) => ({
        ...prev,
        [resellerId]: { ...prev[resellerId], [league]: currentlyEnabled },
      }));
    }
  };

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
        Manage reseller applications. Set each reseller to Live, Disabled, or Pending. Toggle league logos to control which tickets they can sell.
      </p>

      <div className="space-y-3">
        {resellers.map((r) => {
          const currentStatus = r.status || (r.is_enabled ? "live" : "pending");
          const config = statusConfig[currentStatus] || statusConfig.pending;

          return (
            <div key={r.id} className="glass rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

              {/* League toggles */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground font-medium mr-1">Leagues:</span>
                {LEAGUES.map((league) => {
                  const enabled = leagueMap[r.id]?.[league.key] ?? false;
                  return (
                    <button
                      key={league.key}
                      onClick={() => toggleLeague(r.id, league.key)}
                      className={`relative w-9 h-9 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        enabled
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/50 opacity-30 grayscale hover:opacity-60"
                      }`}
                      title={`${league.key} – ${enabled ? "Enabled" : "Disabled"}`}
                    >
                      <img
                        src={league.logo}
                        alt={league.key}
                        className="w-6 h-6 object-contain"
                      />
                    </button>
                  );
                })}
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
