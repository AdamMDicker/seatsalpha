import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldAlert, ShieldOff, CreditCard, DollarSign, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

import nhlLogo from "@/assets/leagues/nhl.png";
import nbaLogo from "@/assets/leagues/nba.png";
import mlbLogo from "@/assets/leagues/mlb.png";
import nflLogo from "@/assets/leagues/nfl.png";
import mlsLogo from "@/assets/leagues/mls.png";
import cflLogo from "@/assets/leagues/cfl.png";

type Reseller = Tables<"resellers"> & { status: string; is_suspended: boolean; stripe_customer_id: string | null };

interface ResellerStats {
  liveTickets: number;
  soldTickets: number;
  totalRevenue: number;
  totalFees: number;
}

interface SubInfo {
  status: string;
  weekly_fee: number;
  discount_code: string | null;
}

const LEAGUES = [
  { key: "NHL", logo: nhlLogo },
  { key: "NBA", logo: nbaLogo },
  { key: "MLB", logo: mlbLogo },
  { key: "NFL", logo: nflLogo },
  { key: "MLS", logo: mlsLogo },
  { key: "CFL", logo: cflLogo },
  { key: "OTHER", logo: null },
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
  const [statsMap, setStatsMap] = useState<Record<string, ResellerStats>>({});
  const [subsMap, setSubsMap] = useState<Record<string, SubInfo>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [preauthAmounts, setPreauthAmounts] = useState<Record<string, string>>({});
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

  const fetchSubs = async () => {
    const { data } = await supabase.from("seller_subscriptions").select("reseller_id, status, weekly_fee, discount_code");
    const map: Record<string, SubInfo> = {};
    if (data) {
      data.forEach((s: any) => {
        map[s.reseller_id] = { status: s.status, weekly_fee: s.weekly_fee, discount_code: s.discount_code };
      });
    }
    setSubsMap(map);
  };

  const fetchStats = async (resellerList: Reseller[]) => {
    const map: Record<string, ResellerStats> = {};
    for (const r of resellerList) {
      const { data: tickets } = await supabase
        .from("tickets")
        .select("quantity, quantity_sold, price")
        .eq("seller_id", r.user_id)
        .eq("is_reseller_ticket", true);

      const liveTickets = (tickets || []).reduce((sum, t) => sum + (t.quantity - t.quantity_sold), 0);
      const soldTickets = (tickets || []).reduce((sum, t) => sum + t.quantity_sold, 0);
      const totalRevenue = (tickets || []).reduce((sum, t) => sum + t.quantity_sold * Number(t.price), 0);

      const { data: orders } = await supabase
        .from("orders")
        .select("fees_amount")
        .eq("user_id", r.user_id);
      const totalFees = (orders || []).reduce((sum, o) => sum + Number(o.fees_amount), 0);

      map[r.id] = { liveTickets, soldTickets, totalRevenue, totalFees };
    }
    setStatsMap(map);
  };

  useEffect(() => {
    const init = async () => {
      await fetchResellers();
      await fetchLeagues();
      await fetchSubs();
    };
    init();
  }, []);

  useEffect(() => {
    if (resellers.length > 0) fetchStats(resellers);
  }, [resellers]);

  const toggleLeague = async (resellerId: string, league: string) => {
    const currentlyEnabled = leagueMap[resellerId]?.[league] ?? false;
    const newEnabled = !currentlyEnabled;
    setLeagueMap((prev) => ({ ...prev, [resellerId]: { ...prev[resellerId], [league]: newEnabled } }));

    const { data: existing } = await (supabase.from("reseller_leagues" as any) as any)
      .select("id").eq("reseller_id", resellerId).eq("league", league).maybeSingle();

    let error;
    if (existing) {
      ({ error } = await (supabase.from("reseller_leagues" as any) as any).update({ is_enabled: newEnabled }).eq("id", existing.id));
    } else {
      ({ error } = await (supabase.from("reseller_leagues" as any) as any).insert({ reseller_id: resellerId, league, is_enabled: newEnabled }));
    }
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLeagueMap((prev) => ({ ...prev, [resellerId]: { ...prev[resellerId], [league]: currentlyEnabled } }));
    }
  };

  const setStatus = async (reseller: Reseller, newStatus: string) => {
    const isEnabled = newStatus === "live";
    const { error } = await supabase.from("resellers").update({ is_enabled: isEnabled, status: newStatus } as any).eq("id", reseller.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Reseller set to ${statusConfig[newStatus]?.label || newStatus}` });
    fetchResellers();
  };

  const suspendSeller = async (reseller: Reseller) => {
    setActionLoading(`suspend-${reseller.id}`);
    // Suspend the reseller
    const { error } = await supabase
      .from("resellers")
      .update({ is_suspended: true } as any)
      .eq("id", reseller.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Delist all their tickets
      await supabase
        .from("tickets")
        .update({ is_active: false })
        .eq("seller_id", reseller.user_id)
        .eq("is_reseller_ticket", true);

      // Update subscription status
      await supabase
        .from("seller_subscriptions")
        .update({ status: "suspended" })
        .eq("reseller_id", reseller.id);

      toast({ title: "Seller Suspended", description: "All tickets delisted and account suspended." });
      fetchResellers();
      fetchSubs();
    }
    setActionLoading(null);
  };

  const unsuspendSeller = async (reseller: Reseller) => {
    setActionLoading(`unsuspend-${reseller.id}`);
    const { error } = await supabase
      .from("resellers")
      .update({ is_suspended: false } as any)
      .eq("id", reseller.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Re-activate subscription if it was suspended
      await supabase
        .from("seller_subscriptions")
        .update({ status: "active" })
        .eq("reseller_id", reseller.id)
        .eq("status", "suspended");

      // Re-activate tickets
      await supabase
        .from("tickets")
        .update({ is_active: true })
        .eq("seller_id", reseller.user_id)
        .eq("is_reseller_ticket", true);

      toast({ title: "Seller Unsuspended", description: "Account restored and tickets re-listed." });
      fetchResellers();
      fetchSubs();
    }
    setActionLoading(null);
  };

  const preauthHold = async (reseller: Reseller) => {
    if (!reseller.stripe_customer_id) {
      toast({ title: "Error", description: "Seller has no payment method on file.", variant: "destructive" });
      return;
    }
    const amountStr = preauthAmounts[reseller.id] || "500";
    const amountDollars = parseFloat(amountStr);
    if (isNaN(amountDollars) || amountDollars < 1 || amountDollars > 10000) {
      toast({ title: "Error", description: "Enter a valid amount between $1 and $10,000.", variant: "destructive" });
      return;
    }
    const amountCents = Math.round(amountDollars * 100);
    setActionLoading(`preauth-${reseller.id}`);
    try {
      const { data, error } = await supabase.functions.invoke("seller-preauth", {
        body: { reseller_id: reseller.id, amount_cents: amountCents },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Pre-Auth Hold Placed", description: `$${amountDollars.toFixed(0)} hold placed. Intent: ${data.payment_intent_id}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setActionLoading(null);
  };

  const filteredResellers = resellers.filter((r) => {
    const status = r.status || (r.is_enabled ? "live" : "pending");
    const matchesSearch = !searchQuery ||
      r.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${r.first_name} ${r.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-2">Resellers ({resellers.length})</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Manage reseller applications, subscriptions, suspend accounts, and place pre-auth holds.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search resellers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
        </div>
        <div className="flex gap-1.5">
          {["all", "live", "pending", "disabled"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}>
              {s === "all" ? "All" : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredResellers.map((r) => {
          const currentStatus = r.status || (r.is_enabled ? "live" : "pending");
          const config = statusConfig[currentStatus] || statusConfig.pending;
          const stats = statsMap[r.id];
          const subInfo = subsMap[r.id];

          return (
            <div key={r.id} className={`glass rounded-xl p-4 space-y-3 ${r.is_suspended ? "border-destructive/50" : ""}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground">{r.business_name}</h3>
                    <Badge variant={config.variant}>{config.label}</Badge>
                    {r.is_suspended && <Badge variant="destructive">SUSPENDED</Badge>}
                    {subInfo && (
                      <Badge variant={subInfo.status === "active" ? "default" : "secondary"}>
                        Sub: {subInfo.status} {subInfo.discount_code ? `(${subInfo.discount_code})` : `$${subInfo.weekly_fee}/wk`}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {r.first_name} {r.last_name} {r.email ? `• ${r.email}` : ""} {r.phone ? `• ${r.phone}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.ticket_count ? `${r.ticket_count} tickets declared` : "No ticket count"} • Joined {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {currentStatus !== "live" && <Button variant="hero" size="sm" onClick={() => setStatus(r, "live")}>Set Live</Button>}
                  {currentStatus !== "pending" && <Button variant="glass" size="sm" onClick={() => setStatus(r, "pending")}>Set Pending</Button>}
                  {currentStatus !== "disabled" && <Button variant="destructive" size="sm" onClick={() => setStatus(r, "disabled")}>Disable</Button>}
                </div>
              </div>

              {/* Enforcement actions */}
              <div className="flex gap-2 flex-wrap border-t border-border/50 pt-3">
                {!r.is_suspended ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => suspendSeller(r)}
                    disabled={actionLoading === `suspend-${r.id}`}
                  >
                    {actionLoading === `suspend-${r.id}` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
                    Suspend
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unsuspendSeller(r)}
                    disabled={actionLoading === `unsuspend-${r.id}`}
                  >
                    {actionLoading === `unsuspend-${r.id}` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ShieldOff className="h-3 w-3 mr-1" />}
                    Unsuspend
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="500"
                    value={preauthAmounts[r.id] || ""}
                    onChange={(e) => setPreauthAmounts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    className="w-20 px-2 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs"
                    min="1"
                    max="10000"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => preauthHold(r)}
                    disabled={!r.stripe_customer_id || actionLoading === `preauth-${r.id}`}
                    title={!r.stripe_customer_id ? "No payment method on file" : "Place hold"}
                  >
                    {actionLoading === `preauth-${r.id}` ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CreditCard className="h-3 w-3 mr-1" />}
                    Pre-Auth ${preauthAmounts[r.id] || "500"}
                  </Button>
                </div>
              </div>

              {/* Stats row */}
              {stats && (
                <div className="flex flex-wrap gap-4 text-xs border-t border-border/50 pt-3">
                  <div className="flex flex-col items-center px-3">
                    <span className="text-lg font-bold text-foreground">{stats.liveTickets}</span>
                    <span className="text-muted-foreground">Live</span>
                  </div>
                  <div className="flex flex-col items-center px-3">
                    <span className="text-lg font-bold text-foreground">{stats.soldTickets}</span>
                    <span className="text-muted-foreground">Sold</span>
                  </div>
                  <div className="flex flex-col items-center px-3">
                    <span className="text-lg font-bold text-primary">${stats.totalRevenue.toFixed(0)}</span>
                    <span className="text-muted-foreground">Revenue</span>
                  </div>
                  <div className="flex flex-col items-center px-3">
                    <span className="text-lg font-bold text-foreground">${stats.totalFees.toFixed(0)}</span>
                    <span className="text-muted-foreground">Fees Paid</span>
                  </div>
                </div>
              )}

              {/* League toggles */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground font-medium mr-1">Leagues:</span>
                {LEAGUES.map((league) => {
                  const enabled = leagueMap[r.id]?.[league.key] ?? false;
                  return (
                    <button key={league.key} onClick={() => toggleLeague(r.id, league.key)}
                      className={`relative w-9 h-9 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                        enabled ? "border-primary bg-primary/10 shadow-sm" : "border-border/50 opacity-30 grayscale hover:opacity-60"
                      }`}
                      title={`${league.key} – ${enabled ? "Enabled" : "Disabled"}`}>
                      {league.logo ? (
                        <img src={league.logo} alt={league.key} className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold text-foreground">{league.key}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filteredResellers.length === 0 && <p className="text-muted-foreground text-center py-8">No resellers found.</p>}
      </div>
    </div>
  );
};

export default AdminResellers;
