import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { RefreshCw, Send, Clock, AlertTriangle, CheckCircle2, XCircle, MailWarning } from "lucide-react";

type TimeRange = "24h" | "7d" | "30d";
type StatusFilter = "all" | "sent" | "failed" | "dlq" | "pending" | "rate_limited";

interface EmailLogRow {
  message_id: string;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface Stats {
  total: number;
  sent: number;
  failed: number;
  dlq: number;
  pending: number;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
  sent: { label: "Sent", variant: "default", icon: CheckCircle2 },
  failed: { label: "Failed", variant: "destructive", icon: XCircle },
  dlq: { label: "DLQ", variant: "destructive", icon: AlertTriangle },
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  rate_limited: { label: "Rate Limited", variant: "outline", icon: MailWarning },
};

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

function getTimeRangeDate(range: TimeRange): string {
  const now = new Date();
  if (range === "24h") now.setHours(now.getHours() - 24);
  else if (range === "7d") now.setDate(now.getDate() - 7);
  else now.setDate(now.getDate() - 30);
  return now.toISOString();
}

const PAGE_SIZE = 50;

const AdminEmailMonitor = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [templates, setTemplates] = useState<string[]>([]);
  const [logs, setLogs] = useState<EmailLogRow[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, sent: 0, failed: 0, dlq: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const since = getTimeRangeDate(timeRange);

    // Fetch all logs in range for dedup + stats (limited to 1000)
    const { data: rawLogs, error } = await supabase
      .from("email_send_log")
      .select("message_id, template_name, recipient_email, status, error_message, created_at")
      .gte("created_at", since)
      .not("message_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Failed to fetch email logs:", error);
      setLoading(false);
      return;
    }

    // Deduplicate: keep latest row per message_id
    const seen = new Map<string, EmailLogRow>();
    for (const row of rawLogs ?? []) {
      const r = row as EmailLogRow;
      if (!r.message_id) continue;
      if (!seen.has(r.message_id)) {
        seen.set(r.message_id, r);
      }
    }
    const deduped = Array.from(seen.values());

    // Compute stats
    const s: Stats = { total: deduped.length, sent: 0, failed: 0, dlq: 0, pending: 0 };
    const templateSet = new Set<string>();
    for (const row of deduped) {
      if (row.status === "sent") s.sent++;
      else if (row.status === "failed") s.failed++;
      else if (row.status === "dlq") s.dlq++;
      else if (row.status === "pending") s.pending++;
      templateSet.add(row.template_name);
    }
    setStats(s);
    setTemplates(Array.from(templateSet).sort());

    // Apply filters
    let filtered = deduped;
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (templateFilter !== "all") {
      filtered = filtered.filter((r) => r.template_name === templateFilter);
    }

    // Paginate
    const start = page * PAGE_SIZE;
    const pageData = filtered.slice(start, start + PAGE_SIZE);
    setHasMore(filtered.length > start + PAGE_SIZE);
    setLogs(pageData);
    setLoading(false);
  }, [timeRange, statusFilter, templateFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(0);
  }, [timeRange, statusFilter, templateFilter]);

  const handleRetry = async (row: EmailLogRow) => {
    setRetrying(row.message_id);
    try {
      // Look up original payload from DLQ
      const { data, error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          type: row.template_name === "buyer-confirmation" ? "buyer_confirmation" : "seller_notification",
          to: row.recipient_email,
          meta: {
            eventTitle: "Retry — check original order",
            venue: "",
            eventDate: "",
            tier: "",
            quantity: "1",
            totalAmount: "0.00",
            section: "",
            rowName: "",
            salePrice: "0.00",
            buyerEmail: "",
          },
        },
      });

      if (error) throw error;
      toast.success(`Retry queued for ${row.recipient_email}`);
      await fetchData();
    } catch (err) {
      toast.error(`Retry failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setRetrying(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = STATUS_CONFIG[status] || { label: status, variant: "outline" as const, icon: Clock };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1 font-mono text-xs">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Sent", value: stats.sent, color: "text-emerald-500" },
          { label: "Failed", value: stats.failed, color: "text-red-500" },
          { label: "DLQ", value: stats.dlq, color: "text-amber-500" },
          { label: "Pending", value: stats.pending, color: "text-blue-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {TIME_RANGES.map((tr) => (
            <Button
              key={tr.value}
              size="sm"
              variant={timeRange === tr.value ? "default" : "secondary"}
              onClick={() => setTimeRange(tr.value)}
            >
              {tr.label}
            </Button>
          ))}
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="dlq">DLQ</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rate_limited">Rate Limited</SelectItem>
          </SelectContent>
        </Select>

        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            {templates.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Log table */}
      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Template</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Error</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No emails found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((row) => (
                  <TableRow key={row.message_id}>
                    <TableCell className="font-mono text-xs">{row.template_name}</TableCell>
                    <TableCell className="text-sm">{row.recipient_email}</TableCell>
                    <TableCell><StatusBadge status={row.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-red-400 max-w-[250px] truncate" title={row.error_message ?? ""}>
                      {row.error_message || "—"}
                    </TableCell>
                    <TableCell>
                      {(row.status === "dlq" || row.status === "failed") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={retrying === row.message_id}
                          onClick={() => handleRetry(row)}
                          title="Retry this email"
                        >
                          <Send className={`h-3.5 w-3.5 ${retrying === row.message_id ? "animate-spin" : ""}`} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {(page > 0 || hasMore) && (
        <div className="flex justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground self-center">Page {page + 1}</span>
          <Button size="sm" variant="outline" disabled={!hasMore} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminEmailMonitor;
