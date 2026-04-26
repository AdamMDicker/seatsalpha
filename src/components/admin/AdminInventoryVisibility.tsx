import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
  TrendingDown,
  Trophy,
  ShieldCheck,
  Crown,
} from "lucide-react";

type Reseller = {
  id: string;
  user_id: string;
  business_name: string;
  email: string | null;
  status: string;
  is_enabled: boolean;
  is_suspended: boolean;
};

type TicketRow = {
  id: string;
  seller_id: string;
  is_reseller_ticket: boolean;
  is_active: boolean;
  price: number;
  quantity: number;
  quantity_sold: number;
  section: string;
  event_id: string;
};

type ResellerVisibility = {
  reseller: Reseller;
  totalActive: number;
  totalListings: number;
  cheaper: number; // listings where this reseller beats admin price for the same event
  costlier: number;
  topPlacement: number; // count of listings that are the absolute #1 cheapest in their event
  avgRankWhenAdminPresent: number | null; // avg position in event sorted by price (1 = best)
  eventsWithAdmin: number;
  eventsResellerOnly: number;
};

const AdminInventoryVisibility = () => {
  const { toast } = useToast();
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: rs }, { data: tx }] = await Promise.all([
      supabase
        .from("resellers")
        .select("id, user_id, business_name, email, status, is_enabled, is_suspended")
        .order("business_name"),
      supabase
        .from("tickets")
        .select(
          "id, seller_id, is_reseller_ticket, is_active, price, quantity, quantity_sold, section, event_id",
        ),
    ]);
    setResellers((rs as Reseller[]) || []);
    setTickets((tx as TicketRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Build per-event sorted ticket list (price asc), then compute ranking metrics per reseller.
  const ticketsByEvent = useMemo(() => {
    const grouped: Record<string, TicketRow[]> = {};
    for (const t of tickets) {
      if (!t.is_active) continue;
      if (t.quantity - t.quantity_sold <= 0) continue;
      (grouped[t.event_id] ||= []).push(t);
    }
    Object.values(grouped).forEach((list) =>
      list.sort((a, b) => Number(a.price) - Number(b.price)),
    );
    return grouped;
  }, [tickets]);

  const visibility: ResellerVisibility[] = useMemo(() => {
    return resellers.map((r) => {
      const ownTickets = tickets.filter(
        (t) => t.seller_id === r.user_id && t.is_reseller_ticket,
      );
      const totalListings = ownTickets.length;
      const totalActive = ownTickets.filter(
        (t) => t.is_active && t.quantity - t.quantity_sold > 0,
      ).length;

      let cheaper = 0;
      let costlier = 0;
      let topPlacement = 0;
      const ranks: number[] = [];
      const eventIds = new Set<string>();
      const eventsWithAdmin = new Set<string>();

      for (const t of ownTickets) {
        if (!t.is_active) continue;
        if (t.quantity - t.quantity_sold <= 0) continue;
        eventIds.add(t.event_id);

        const eventList = ticketsByEvent[t.event_id] || [];
        const adminInEvent = eventList.filter((x) => !x.is_reseller_ticket);
        if (adminInEvent.length > 0) eventsWithAdmin.add(t.event_id);

        const idx = eventList.findIndex((x) => x.id === t.id);
        if (idx === 0) topPlacement += 1;
        if (idx >= 0 && adminInEvent.length > 0) {
          ranks.push(idx + 1);
          const cheapestAdmin = Math.min(...adminInEvent.map((x) => Number(x.price)));
          if (Number(t.price) < cheapestAdmin) cheaper += 1;
          else if (Number(t.price) > cheapestAdmin) costlier += 1;
        }
      }

      const avgRank = ranks.length
        ? ranks.reduce((s, n) => s + n, 0) / ranks.length
        : null;

      return {
        reseller: r,
        totalActive,
        totalListings,
        cheaper,
        costlier,
        topPlacement,
        avgRankWhenAdminPresent: avgRank,
        eventsWithAdmin: eventsWithAdmin.size,
        eventsResellerOnly: eventIds.size - eventsWithAdmin.size,
      };
    });
  }, [resellers, tickets, ticketsByEvent]);

  const filtered = visibility.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.reseller.business_name.toLowerCase().includes(q) ||
      (v.reseller.email || "").toLowerCase().includes(q)
    );
  });

  const toggleEnabled = async (r: Reseller) => {
    setActionId(r.id);
    const newEnabled = !r.is_enabled;
    const { error } = await supabase
      .from("resellers")
      .update({
        is_enabled: newEnabled,
        status: newEnabled ? "live" : "disabled",
      } as any)
      .eq("id", r.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Hide/show their listings to align visibility
      await supabase
        .from("tickets")
        .update({ is_active: newEnabled })
        .eq("seller_id", r.user_id)
        .eq("is_reseller_ticket", true);

      toast({
        title: newEnabled ? "Reseller enabled" : "Reseller disabled",
        description: newEnabled
          ? "Listings are visible to buyers again."
          : "All their listings are hidden from buyers.",
      });
      await fetchAll();
    }
    setActionId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading inventory visibility…
      </div>
    );
  }

  // Aggregate footer stats
  const adminTickets = tickets.filter((t) => !t.is_reseller_ticket && t.is_active);
  const resellerTickets = tickets.filter((t) => t.is_reseller_ticket && t.is_active);

  return (
    <div>
      <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-xl font-semibold">Inventory Visibility</h2>
          <p className="text-sm text-muted-foreground">
            Where each reseller's listings rank against our own (admin) inventory in the
            buyer-facing sort. Buyers see tickets sorted by price ascending — lower rank = more visible.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Crown className="h-3 w-3 text-primary" /> Admin: {adminTickets.length} active
          </Badge>
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="h-3 w-3" /> Resellers: {resellerTickets.length} active
          </Badge>
        </div>
      </div>

      <div className="relative my-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search resellers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No resellers match your search.</p>
        )}
        {filtered.map((v) => {
          const r = v.reseller;
          const ratio =
            v.cheaper + v.costlier > 0
              ? Math.round((v.cheaper / (v.cheaper + v.costlier)) * 100)
              : null;

          return (
            <div
              key={r.id}
              className={`glass rounded-xl p-4 ${
                !r.is_enabled || r.is_suspended ? "opacity-70 border-destructive/30" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{r.business_name}</h3>
                    <Badge variant={r.is_enabled ? "default" : "destructive"}>
                      {r.is_enabled ? "Visible" : "Hidden"}
                    </Badge>
                    {r.is_suspended && <Badge variant="destructive">Suspended</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.email}</p>
                </div>
                <Button
                  size="sm"
                  variant={r.is_enabled ? "destructive" : "hero"}
                  onClick={() => toggleEnabled(r)}
                  disabled={actionId === r.id}
                >
                  {actionId === r.id ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : r.is_enabled ? (
                    <EyeOff className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {r.is_enabled ? "Disable & Hide" : "Enable & Show"}
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <Metric
                  label="Active listings"
                  value={`${v.totalActive}`}
                  sub={`${v.totalListings} total`}
                />
                <Metric
                  label="Avg rank vs admin"
                  value={
                    v.avgRankWhenAdminPresent !== null
                      ? `#${v.avgRankWhenAdminPresent.toFixed(1)}`
                      : "—"
                  }
                  sub={`${v.eventsWithAdmin} shared event${v.eventsWithAdmin === 1 ? "" : "s"}`}
                  hint="Position when sorted with admin tickets (lower = more visible)"
                />
                <Metric
                  label="Beating admin price"
                  value={
                    ratio !== null ? (
                      <span className="inline-flex items-center gap-1">
                        {ratio >= 50 ? (
                          <TrendingDown className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <TrendingUp className="h-3 w-3 text-amber-500" />
                        )}
                        {ratio}%
                      </span>
                    ) : (
                      "—"
                    )
                  }
                  sub={`${v.cheaper} cheaper · ${v.costlier} costlier`}
                />
                <Metric
                  label="Top of list"
                  value={
                    <span className="inline-flex items-center gap-1">
                      {v.topPlacement > 0 && <Trophy className="h-3 w-3 text-amber-500" />}
                      {v.topPlacement}
                    </span>
                  }
                  sub="Cheapest listing in event"
                />
              </div>

              {v.eventsResellerOnly > 0 && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  {v.eventsResellerOnly} event{v.eventsResellerOnly === 1 ? "" : "s"} where this reseller is the only inventory
                  (no admin competition).
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Metric = ({
  label,
  value,
  sub,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  hint?: string;
}) => (
  <div className="bg-secondary/40 rounded-lg p-2.5" title={hint}>
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

export default AdminInventoryVisibility;
