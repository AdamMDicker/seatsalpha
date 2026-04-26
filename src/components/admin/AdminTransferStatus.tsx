import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Mail,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Send,
  ShieldAlert,
  Search,
} from "lucide-react";

interface TransferRow {
  id: string;
  order_id: string;
  ticket_id: string;
  seller_id: string | null;
  status: string;
  expected_quantity: number;
  created_at: string;
  uploaded_at: string | null;
  confirmed_at: string | null;
  forward_sent_at: string | null;
  fallback_sent_at: string | null;
  accept_link_extracted_at: string | null;
  seller_reminder_sent_at: string | null;
  admin_escalation_sent_at: string | null;
  seller_relay_reminder_sent_at: string | null;
  transfer_image_url: string | null;
  // joined
  order_total: number | null;
  order_status: string | null;
  buyer_email: string | null;
  buyer_name: string | null;
  seller_email: string | null;
  seller_name: string | null;
  event_title: string | null;
  event_date: string | null;
  venue: string | null;
  section: string | null;
  row_name: string | null;
}

const formatDateTime = (raw: string | null) => {
  if (!raw) return null;
  try {
    return new Date(raw).toLocaleString("en-CA", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return raw;
  }
};

const formatRelative = (raw: string | null) => {
  if (!raw) return null;
  const diffMs = Date.now() - new Date(raw).getTime();
  if (diffMs < 0) return "in future";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const AdminTransferStatus = () => {
  const [rows, setRows] = useState<TransferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "disputed" | "completed">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Manual resend by transfer ID
  const [manualId, setManualId] = useState("");
  const [manualLookup, setManualLookup] = useState<{
    found: boolean;
    sellerEmail: string | null;
    lastSentAt: string | null;
    status: string | null;
  } | null>(null);
  const [manualBusy, setManualBusy] = useState(false);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      // Pull a wide set of transfers, then enrich
      const { data: transfers, error } = await supabase
        .from("order_transfers")
        .select(
          "id, order_id, ticket_id, seller_id, status, expected_quantity, created_at, uploaded_at, confirmed_at, forward_sent_at, fallback_sent_at, accept_link_extracted_at, seller_reminder_sent_at, admin_escalation_sent_at, seller_relay_reminder_sent_at, transfer_image_url"
        )
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      const list = transfers ?? [];
      if (list.length === 0) {
        setRows([]);
        return;
      }

      const orderIds = Array.from(new Set(list.map((t) => t.order_id)));
      const ticketIds = Array.from(new Set(list.map((t) => t.ticket_id)));
      const sellerIds = Array.from(
        new Set(list.map((t) => t.seller_id).filter((v): v is string => !!v))
      );

      const [{ data: orders }, { data: tickets }, { data: sellerProfiles }] = await Promise.all([
        supabase.from("orders").select("id, status, total_amount, user_id").in("id", orderIds),
        supabase.from("tickets").select("id, section, row_name, event_id").in("id", ticketIds),
        sellerIds.length
          ? supabase.from("profiles").select("user_id, email, full_name").in("user_id", sellerIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const buyerUserIds = Array.from(
        new Set((orders ?? []).map((o) => o.user_id).filter((v): v is string => !!v))
      );
      const eventIds = Array.from(
        new Set((tickets ?? []).map((t) => t.event_id).filter((v): v is string => !!v))
      );

      const [{ data: buyerProfiles }, { data: events }] = await Promise.all([
        buyerUserIds.length
          ? supabase.from("profiles").select("user_id, email, full_name").in("user_id", buyerUserIds)
          : Promise.resolve({ data: [] as any[] }),
        eventIds.length
          ? supabase.from("events").select("id, title, event_date, venue").in("id", eventIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const ordersById = new Map((orders ?? []).map((o) => [o.id, o]));
      const ticketsById = new Map((tickets ?? []).map((t) => [t.id, t]));
      const sellerById = new Map((sellerProfiles ?? []).map((p: any) => [p.user_id, p]));
      const buyerById = new Map((buyerProfiles ?? []).map((p: any) => [p.user_id, p]));
      const eventsById = new Map((events ?? []).map((e: any) => [e.id, e]));

      const enriched: TransferRow[] = list.map((t) => {
        const order = ordersById.get(t.order_id);
        const ticket = ticketsById.get(t.ticket_id);
        const event = ticket?.event_id ? eventsById.get(ticket.event_id) : null;
        const seller = t.seller_id ? sellerById.get(t.seller_id) : null;
        const buyer = order?.user_id ? buyerById.get(order.user_id) : null;
        return {
          ...t,
          order_total: order?.total_amount ?? null,
          order_status: order?.status ?? null,
          buyer_email: buyer?.email ?? null,
          buyer_name: buyer?.full_name ?? null,
          seller_email: seller?.email ?? null,
          seller_name: seller?.full_name ?? null,
          event_title: event?.title ?? null,
          event_date: event?.event_date ?? null,
          venue: event?.venue ?? null,
          section: ticket?.section ?? null,
          row_name: ticket?.row_name ?? null,
        };
      });
      setRows(enriched);
    } catch (e: any) {
      console.error("Failed to load transfers:", e);
      toast.error(e.message ?? "Failed to load transfers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.event_title?.toLowerCase().includes(q) ||
        r.buyer_email?.toLowerCase().includes(q) ||
        r.seller_email?.toLowerCase().includes(q) ||
        r.section?.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.order_id.toLowerCase().includes(q)
      );
    });
  }, [rows, search, statusFilter]);

  const counts = useMemo(() => {
    const completedOrderPending = rows.filter(
      (r) => r.order_status === "completed" && r.status === "pending" && !r.transfer_image_url
    ).length;
    const awaitingTM = rows.filter(
      (r) => r.status === "pending" && !r.accept_link_extracted_at && !r.transfer_image_url
    ).length;
    const awaitingProof = rows.filter(
      (r) => r.status === "pending" && r.accept_link_extracted_at && !r.transfer_image_url
    ).length;
    const disputed = rows.filter((r) => r.status === "disputed").length;
    return { completedOrderPending, awaitingTM, awaitingProof, disputed };
  }, [rows]);

  const handleResendReminder = async (transferId: string) => {
    setBusyId(transferId);
    try {
      const { data, error } = await supabase.functions.invoke("seller-proof-reminder", {
        body: { transfer_id: transferId, force: true },
      });
      if (error) throw error;
      if (data?.ok) {
        toast.success(`Reminder sent to ${data.sent_to}`);
      } else {
        toast.warning(data?.reason ?? "Could not send reminder");
      }
      await fetchTransfers();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message ?? "Failed to send reminder");
    } finally {
      setBusyId(null);
    }
  };

  const renderStatusBadge = (r: TransferRow) => {
    if (r.status === "completed" || r.confirmed_at) {
      return (
        <Badge className="bg-green-600/15 text-green-500 border-green-600/30 hover:bg-green-600/20">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
        </Badge>
      );
    }
    if (r.status === "disputed") {
      return (
        <Badge variant="destructive">
          <ShieldAlert className="h-3 w-3 mr-1" /> Disputed
        </Badge>
      );
    }
    if (r.transfer_image_url && !r.confirmed_at) {
      return (
        <Badge className="bg-blue-600/15 text-blue-400 border-blue-600/30 hover:bg-blue-600/20">
          <Inbox className="h-3 w-3 mr-1" /> Awaiting verification
        </Badge>
      );
    }
    if (r.accept_link_extracted_at) {
      return (
        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20">
          <Clock className="h-3 w-3 mr-1" /> Awaiting seller proof
        </Badge>
      );
    }
    return (
      <Badge className="bg-orange-500/15 text-orange-400 border-orange-500/30 hover:bg-orange-500/20">
        <AlertTriangle className="h-3 w-3 mr-1" /> Awaiting Ticketmaster transfer
      </Badge>
    );
  };

  const TimelineItem = ({
    label,
    at,
    icon: Icon,
    accent = false,
  }: {
    label: string;
    at: string | null;
    icon: any;
    accent?: boolean;
  }) => (
    <div className="flex items-start gap-2">
      <div
        className={`mt-0.5 h-6 w-6 rounded-full flex items-center justify-center ${
          at
            ? accent
              ? "bg-primary text-primary-foreground"
              : "bg-green-600/20 text-green-500"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-3 w-3" />
      </div>
      <div className="text-xs">
        <div className={`font-medium ${at ? "text-foreground" : "text-muted-foreground"}`}>{label}</div>
        {at ? (
          <div className="text-muted-foreground">
            {formatDateTime(at)} <span className="opacity-60">· {formatRelative(at)}</span>
          </div>
        ) : (
          <div className="text-muted-foreground italic">pending</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Transfer Status</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track each transfer's fulfillment timeline and resend seller reminders when stalled.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTransfers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Order paid · transfer pending</div>
          <div className="text-2xl font-bold mt-1">{counts.completedOrderPending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Awaiting Ticketmaster email</div>
          <div className="text-2xl font-bold mt-1">{counts.awaitingTM}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Awaiting seller proof</div>
          <div className="text-2xl font-bold mt-1 text-amber-500">{counts.awaitingProof}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Disputed</div>
          <div className="text-2xl font-bold mt-1 text-destructive">{counts.disputed}</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event, buyer, seller, section, or ID…"
            className="pl-9"
          />
        </div>
        {(["pending", "disputed", "completed", "all"] as const).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          No transfers match the current filters.
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const stalled =
              r.status === "pending" &&
              !r.transfer_image_url &&
              Date.now() - new Date(r.created_at).getTime() > 30 * 60 * 1000;
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[260px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {r.event_title ?? "Unknown event"}
                      </span>
                      {renderStatusBadge(r)}
                      {r.order_status && (
                        <Badge variant="outline" className="capitalize text-xs">
                          Order: {r.order_status}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {r.event_date ? formatDateTime(r.event_date) : "—"}
                      {r.venue ? ` · ${r.venue}` : ""}
                      {r.section ? ` · Sec ${r.section}` : ""}
                      {r.row_name ? ` Row ${r.row_name}` : ""}
                      {r.expected_quantity ? ` · ×${r.expected_quantity}` : ""}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Buyer:</span>{" "}
                        <span className="text-foreground">{r.buyer_name ?? "—"}</span>{" "}
                        <span className="text-muted-foreground">{r.buyer_email ?? ""}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Seller:</span>{" "}
                        <span className="text-foreground">{r.seller_name ?? "Admin (LMK)"}</span>{" "}
                        <span className="text-muted-foreground">{r.seller_email ?? ""}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Order:</span>{" "}
                        <code className="text-foreground">#{r.order_id.slice(0, 8)}</code>{" "}
                        {r.order_total != null && (
                          <span className="text-muted-foreground">· ${Number(r.order_total).toFixed(2)}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transfer:</span>{" "}
                        <code className="text-foreground">{r.id.slice(0, 8)}</code>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <Button
                      size="sm"
                      onClick={() => handleResendReminder(r.id)}
                      disabled={busyId === r.id || !r.seller_email}
                      title={!r.seller_email ? "No seller email on file" : undefined}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {busyId === r.id ? "Sending…" : r.seller_reminder_sent_at ? "Resend reminder" : "Send reminder"}
                    </Button>
                    {r.seller_reminder_sent_at && (
                      <div className="text-[11px] text-muted-foreground">
                        Last sent {formatRelative(r.seller_reminder_sent_at)}
                      </div>
                    )}
                    {stalled && !r.seller_reminder_sent_at && (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/40">
                        Stalled &gt; 30m
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <TimelineItem label="Order created" at={r.created_at} icon={CheckCircle2} />
                  <TimelineItem label="TM email received" at={r.accept_link_extracted_at} icon={Inbox} />
                  <TimelineItem
                    label="Buyer accept link sent"
                    at={r.forward_sent_at ?? r.fallback_sent_at}
                    icon={Send}
                  />
                  <TimelineItem
                    label="Seller reminder"
                    at={r.seller_reminder_sent_at}
                    icon={Mail}
                    accent
                  />
                  <TimelineItem label="Proof uploaded" at={r.uploaded_at} icon={Inbox} />
                  <TimelineItem label="Confirmed" at={r.confirmed_at} icon={CheckCircle2} />
                </div>

                {r.admin_escalation_sent_at && (
                  <div className="mt-3 text-xs flex items-center gap-2 text-destructive">
                    <ShieldAlert className="h-3 w-3" />
                    Escalated to admin {formatRelative(r.admin_escalation_sent_at)}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminTransferStatus;
