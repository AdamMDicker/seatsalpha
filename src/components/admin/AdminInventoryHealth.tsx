import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Copy,
  PackageX,
  RefreshCw,
  Trash2,
  CheckCircle2,
} from "lucide-react";

type EventRow = {
  id: string;
  title: string;
  venue: string;
  city: string;
  province: string;
  event_date: string;
};

type TicketRow = {
  id: string;
  event_id: string;
  section: string | null;
  row_name: string | null;
  seat_number: string | null;
  price: number;
  quantity: number;
  quantity_sold: number;
  is_active: boolean;
  is_reseller_ticket: boolean;
  seller_id: string | null;
  created_at: string;
};

type EnrichedTicket = TicketRow & {
  event_title: string;
  event_date: string;
};

type DuplicateGroup = {
  key: string;
  title: string;
  event_date: string;
  events: EventRow[];
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const AdminInventoryHealth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [tickets, setTickets] = useState<EnrichedTicket[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchAll = async () => {
    setRefreshing(true);
    const nowIso = new Date().toISOString();

    const { data: eventRows } = await supabase
      .from("events")
      .select("id, title, venue, city, province, event_date")
      .gte("event_date", nowIso)
      .order("event_date", { ascending: true });

    const eventIds = (eventRows || []).map((e) => e.id);

    // Page through tickets so we don't get truncated at 1000
    const pageSize = 1000;
    const all: TicketRow[] = [];
    if (eventIds.length > 0) {
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("tickets")
          .select(
            "id, event_id, section, row_name, seat_number, price, quantity, quantity_sold, is_active, is_reseller_ticket, seller_id, created_at"
          )
          .in("event_id", eventIds)
          .order("event_id", { ascending: true })
          .order("id", { ascending: true })
          .range(from, from + pageSize - 1);
        if (error) break;
        if (!data || data.length === 0) break;
        all.push(...(data as TicketRow[]));
        if (data.length < pageSize) break;
        from += pageSize;
      }
    }

    const eventsById = new Map((eventRows || []).map((e) => [e.id, e]));
    const enriched: EnrichedTicket[] = all.map((t) => {
      const e = eventsById.get(t.event_id);
      return {
        ...t,
        event_title: e?.title || "(unknown event)",
        event_date: e?.event_date || "",
      };
    });

    setEvents(eventRows || []);
    setTickets(enriched);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Flag #1 — Tickets missing a section value
  const missingSection = useMemo(
    () => tickets.filter((t) => !t.section || t.section.trim() === ""),
    [tickets]
  );

  // Flag #2 — Duplicate event titles on the same calendar date
  const duplicates = useMemo<DuplicateGroup[]>(() => {
    const groups = new Map<string, EventRow[]>();
    for (const e of events) {
      const dayKey = new Date(e.event_date).toISOString().slice(0, 10);
      const key = `${e.title.trim().toLowerCase()}|${dayKey}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }
    return Array.from(groups.entries())
      .filter(([, list]) => list.length > 1)
      .map(([key, list]) => ({
        key,
        title: list[0].title,
        event_date: list[0].event_date,
        events: list,
      }));
  }, [events]);

  // Flag #3 — Zero or negative available inventory (active tickets where quantity - quantity_sold <= 0)
  const zeroAvail = useMemo(
    () =>
      tickets.filter(
        (t) => t.is_active && t.quantity - t.quantity_sold <= 0
      ),
    [tickets]
  );

  const deleteTicket = async (id: string) => {
    if (!confirm("Delete this ticket row? This cannot be undone.")) return;
    setActioningId(id);
    const { error } = await supabase.from("tickets").delete().eq("id", id);
    setActioningId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Ticket deleted" });
    fetchAll();
  };

  const deactivateTicket = async (id: string) => {
    setActioningId(id);
    const { error } = await supabase.from("tickets").update({ is_active: false }).eq("id", id);
    setActioningId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Ticket deactivated" });
    fetchAll();
  };

  const deleteEvent = async (id: string) => {
    if (
      !confirm(
        "Delete this event and ALL its tickets? Use only for true duplicate rows."
      )
    )
      return;
    setActioningId(id);
    const { error: tErr } = await supabase.from("tickets").delete().eq("event_id", id);
    if (tErr) {
      setActioningId(null);
      toast({ title: "Delete failed", description: tErr.message, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("events").delete().eq("id", id);
    setActioningId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Event deleted" });
    fetchAll();
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">Loading inventory health…</div>
    );
  }

  const totalIssues = missingSection.length + duplicates.length + zeroAvail.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Inventory Health</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Surfaces problems in the imported events &amp; tickets so they can be fixed before buyers see them.
          </p>
        </div>
        <Button variant="glass" size="sm" onClick={fetchAll} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryTile
          tone={missingSection.length > 0 ? "warn" : "ok"}
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Missing section"
          value={missingSection.length}
        />
        <SummaryTile
          tone={duplicates.length > 0 ? "warn" : "ok"}
          icon={<Copy className="h-4 w-4" />}
          label="Duplicate event titles"
          value={duplicates.length}
        />
        <SummaryTile
          tone={zeroAvail.length > 0 ? "warn" : "ok"}
          icon={<PackageX className="h-4 w-4" />}
          label="Zero / negative inventory"
          value={zeroAvail.length}
        />
      </div>

      {totalIssues === 0 && (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="font-semibold text-foreground">All clear</p>
          <p className="text-sm text-muted-foreground mt-1">
            No upcoming events or tickets currently match any of the health rules.
          </p>
        </div>
      )}

      {/* Section: Missing section */}
      {missingSection.length > 0 && (
        <Section
          title="Tickets missing a section"
          description="These rows were imported without a section value. Buyers won't be able to map them to a seat. Either add a section in the Tickets tab or delete the row."
          tone="warn"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60">
                <tr className="text-left text-muted-foreground">
                  <Th>Event</Th>
                  <Th>Date</Th>
                  <Th>Row / Seat</Th>
                  <Th className="text-right">Price</Th>
                  <Th className="text-right">Qty</Th>
                  <Th>Source</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {missingSection.map((t) => (
                  <tr key={t.id} className="border-t border-border/60">
                    <Td className="font-medium">{t.event_title}</Td>
                    <Td>{t.event_date ? fmtDate(t.event_date) : "—"}</Td>
                    <Td>
                      {t.row_name || "—"} / {t.seat_number || "—"}
                    </Td>
                    <Td className="text-right">${Number(t.price).toFixed(2)}</Td>
                    <Td className="text-right">
                      {t.quantity - t.quantity_sold}/{t.quantity}
                    </Td>
                    <Td>{t.is_reseller_ticket ? "Reseller" : "Admin"}</Td>
                    <Td className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteTicket(t.id)}
                        disabled={actioningId === t.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Section: Duplicate titles */}
      {duplicates.length > 0 && (
        <Section
          title="Duplicate event titles"
          description="Two or more events share the same title on the same day. Usually one of them is a stale import. Delete the dupes you don't want — this also removes their tickets."
          tone="warn"
        >
          <div className="space-y-4">
            {duplicates.map((g) => (
              <div key={g.key} className="bg-secondary/40 border border-border rounded-lg p-3">
                <p className="text-sm font-semibold text-foreground mb-2">
                  {g.title} —{" "}
                  <span className="text-muted-foreground font-normal">
                    {fmtDate(g.event_date)}
                  </span>
                </p>
                <div className="space-y-2">
                  {g.events.map((e) => {
                    const ticketCount = tickets.filter((t) => t.event_id === e.id).length;
                    return (
                      <div
                        key={e.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-background border border-border rounded p-2.5"
                      >
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p className="font-mono">{e.id}</p>
                          <p>
                            {e.venue} · {e.city}, {e.province}
                          </p>
                          <p>{ticketCount} ticket row(s)</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive self-start md:self-auto"
                          onClick={() => deleteEvent(e.id)}
                          disabled={actioningId === e.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete event
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Section: Zero / negative inventory */}
      {zeroAvail.length > 0 && (
        <Section
          title="Zero or negative available inventory"
          description="These tickets are still flagged active but have no remaining seats (or are oversold). Consider deactivating them so they don't appear on the site."
          tone="warn"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60">
                <tr className="text-left text-muted-foreground">
                  <Th>Event</Th>
                  <Th>Date</Th>
                  <Th>Section</Th>
                  <Th className="text-right">Sold / Total</Th>
                  <Th className="text-right">Avail</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {zeroAvail.map((t) => {
                  const avail = t.quantity - t.quantity_sold;
                  return (
                    <tr key={t.id} className="border-t border-border/60">
                      <Td className="font-medium">{t.event_title}</Td>
                      <Td>{t.event_date ? fmtDate(t.event_date) : "—"}</Td>
                      <Td>
                        {t.section} {t.row_name ? `· Row ${t.row_name}` : ""}
                      </Td>
                      <Td className="text-right">
                        {t.quantity_sold}/{t.quantity}
                      </Td>
                      <Td
                        className={`text-right font-semibold ${
                          avail < 0 ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {avail}
                      </Td>
                      <Td className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deactivateTicket(t.id)}
                          disabled={actioningId === t.id}
                        >
                          Deactivate
                        </Button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
};

const SummaryTile = ({
  tone,
  icon,
  label,
  value,
}: {
  tone: "ok" | "warn";
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div
    className={`rounded-xl border p-4 ${
      tone === "warn"
        ? "border-destructive/40 bg-destructive/5"
        : "border-border bg-card"
    }`}
  >
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className={tone === "warn" ? "text-destructive" : "text-primary"}>
        {icon}
      </span>
    </div>
    <p
      className={`text-2xl font-bold ${
        tone === "warn" ? "text-destructive" : "text-foreground"
      }`}
    >
      {value}
    </p>
  </div>
);

const Section = ({
  title,
  description,
  tone,
  children,
}: {
  title: string;
  description: string;
  tone: "warn" | "ok";
  children: React.ReactNode;
}) => (
  <div
    className={`rounded-xl border p-4 ${
      tone === "warn" ? "border-destructive/30" : "border-border"
    } bg-card`}
  >
    <div className="mb-3">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
    {children}
  </div>
);

const Th = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <th className={`px-3 py-2 text-xs font-medium ${className}`}>{children}</th>
);

const Td = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => (
  <td className={`px-3 py-2 align-top ${className}`}>{children}</td>
);

export default AdminInventoryHealth;
