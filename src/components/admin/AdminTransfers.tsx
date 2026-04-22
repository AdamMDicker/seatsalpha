import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Clock, ShieldCheck, ShieldAlert, Loader2, ExternalLink, Search, RefreshCw, ScanSearch, ChevronLeft, ChevronRight, MailX, Send, Link2, AlertTriangle, Trash2 } from "lucide-react";
import { format } from "date-fns";

const PAGE_SIZE = 20;

interface AdminTransfer {
  id: string;
  order_id: string;
  ticket_id: string;
  seller_id: string;
  transfer_image_url: string | null;
  transfer_email_alias: string | null;
  status: string;
  uploaded_at: string | null;
  created_at: string;
  confirmed_at: string | null;
  verification_result: any;
  accept_link?: string | null;
  forward_sent_at?: string | null;
  // joined
  event_title?: string;
  venue?: string;
  event_date?: string;
  section?: string;
  row_name?: string;
  quantity?: number;
  seller_name?: string;
  seller_email?: string;
  buyer_email?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Upload Needed", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  uploaded: { label: "Analyzing...", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  confirmed: { label: "Verified ✓", className: "bg-green-100 text-green-800 border-green-300" },
  disputed: { label: "Error — Mismatch", className: "bg-red-100 text-red-800 border-red-300" },
};

const AdminTransfers = () => {
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<AdminTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; transfer: AdminTransfer | null; action: "confirm" | "dispute" | "reset" | "delete" }>({ open: false, transfer: null, action: "confirm" });
  const [actionLoading, setActionLoading] = useState(false);
  const [reverifying, setReverifying] = useState<string | null>(null);
  const [relaying, setRelaying] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [disputeReason, setDisputeReason] = useState("");

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("order_transfers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    // Enrich with event/ticket/seller info
    const enriched: AdminTransfer[] = await Promise.all(
      data.map(async (t) => {
        const enriched: AdminTransfer = { ...t } as AdminTransfer;

        // Get ticket + event info
        const { data: items } = await supabase
          .from("order_items")
          .select("quantity, ticket_id, tickets(section, row_name, event_id, events(title, venue, event_date))")
          .eq("order_id", t.order_id)
          .limit(1);

        if (items?.[0]) {
          const item = items[0] as any;
          enriched.section = item.tickets?.section;
          enriched.row_name = item.tickets?.row_name;
          enriched.quantity = item.quantity;
          enriched.event_title = item.tickets?.events?.title;
          enriched.venue = item.tickets?.events?.venue;
          enriched.event_date = item.tickets?.events?.event_date;
        }

        // Get seller info (try resellers first, fallback to profiles)
        const { data: reseller } = await supabase
          .from("resellers")
          .select("first_name, last_name, email")
          .eq("user_id", t.seller_id)
          .maybeSingle();

        if (reseller) {
          enriched.seller_name = `${reseller.first_name || ""} ${reseller.last_name || ""}`.trim();
          enriched.seller_email = reseller.email || undefined;
        } else {
          const { data: sellerProfile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", t.seller_id)
            .maybeSingle();
          enriched.seller_name = sellerProfile?.full_name || undefined;
          enriched.seller_email = sellerProfile?.email || undefined;
        }

        // Get buyer email from profile
        const { data: order } = await supabase
          .from("orders")
          .select("user_id")
          .eq("id", t.order_id)
          .maybeSingle();

        if (order) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("user_id", order.user_id)
            .maybeSingle();
          enriched.buyer_email = profile?.email || undefined;
        }

        return enriched;
      })
    );

    setTransfers(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleAction = async () => {
    if (!confirmDialog.transfer) return;
    setActionLoading(true);
    const { transfer, action } = confirmDialog;

    if (action === "delete") {
      const { error } = await supabase
        .from("order_transfers")
        .delete()
        .eq("id", transfer.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Deleted", description: "Transfer record removed." });
        fetchTransfers();
      }

      setActionLoading(false);
      setConfirmDialog({ open: false, transfer: null, action: "confirm" });
      return;
    }

    const updates: Record<string, any> = {};
    if (action === "confirm") {
      updates.status = "confirmed";
      updates.confirmed_at = new Date().toISOString();
    } else if (action === "dispute") {
      updates.status = "disputed";
    } else if (action === "reset") {
      updates.status = "pending";
      updates.confirmed_at = null;
      updates.verification_result = null;
      updates.transfer_image_url = null;
      updates.uploaded_at = null;
    }

    const { error } = await supabase
      .from("order_transfers")
      .update(updates)
      .eq("id", transfer.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Transfer ${action === "confirm" ? "confirmed" : action === "dispute" ? "disputed" : "reset"} successfully.` });

      // Notify buyer (confirm) or seller (dispute) via edge function
      if (action === "confirm" || action === "dispute") {
        await supabase.functions.invoke("notify-buyer-transfer", {
          body: {
            transfer_id: transfer.id,
            action,
            ...(action === "dispute" && disputeReason ? { reason: disputeReason } : {}),
          },
        });
      }

      fetchTransfers();
    }

    setActionLoading(false);
    setDisputeReason("");
    setConfirmDialog({ open: false, transfer: null, action: "confirm" });
  };

  const filtered = transfers.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (t.event_title || "").toLowerCase().includes(q) ||
        (t.seller_name || "").toLowerCase().includes(q) ||
        (t.seller_email || "").toLowerCase().includes(q) ||
        (t.buyer_email || "").toLowerCase().includes(q) ||
        t.order_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const actionLabel = { confirm: "Confirm", dispute: "Dispute", reset: "Reset", delete: "Delete" };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders, sellers, buyers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="uploaded">Uploaded</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center text-sm text-muted-foreground">
          <span>{filtered.length} transfer{filtered.length !== 1 ? "s" : ""}</span>
          <Button variant="ghost" size="sm" onClick={fetchTransfers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No transfers found.</p>
      ) : (
        <>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Section / Row</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>AI Result</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((t) => {
                  const cfg = statusConfig[t.status] || statusConfig.pending;
                  const vr = t.verification_result as any;
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="max-w-[200px]">
                        <div className="font-medium text-sm truncate">{t.event_title || "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.event_date ? format(new Date(t.event_date), "MMM d, yyyy") : ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{t.seller_name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{t.seller_email || ""}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm truncate max-w-[150px]">{t.buyer_email || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {t.section || "—"}{t.row_name ? ` / ${t.row_name}` : ""}
                          {t.quantity ? ` (×${t.quantity})` : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                          {t.status === "disputed" && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-medium">
                              <MailX className="h-3 w-3" /> Forward blocked
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {t.transfer_image_url ? (
                          <a href={t.transfer_image_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {vr ? (
                          <div className="flex items-center gap-1">
                            {vr.overall_match ? (
                              <ShieldCheck className="h-4 w-4 text-green-500" />
                            ) : (
                              <ShieldAlert className="h-4 w-4 text-destructive" />
                            )}
                            <span className="text-xs">{vr.overall_match ? "Match" : "Mismatch"}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.accept_link ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600" title={t.accept_link}>
                            <Link2 className="h-4 w-4" /> Captured
                          </span>
                        ) : t.forward_sent_at ? (
                          <span className="inline-flex items-center gap-1 text-xs text-yellow-600" title="Email sent but no link was extracted">
                            <AlertTriangle className="h-4 w-4" /> Missing
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {t.status !== "confirmed" && (
                            <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => setConfirmDialog({ open: true, transfer: t, action: "confirm" })}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Confirm
                            </Button>
                          )}
                          {t.status !== "disputed" && t.status !== "pending" && (
                            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => setConfirmDialog({ open: true, transfer: t, action: "dispute" })}>
                              <ShieldAlert className="h-3 w-3 mr-1" /> Dispute
                            </Button>
                          )}
                          {t.status !== "pending" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setConfirmDialog({ open: true, transfer: t, action: "reset" })}>
                              <RefreshCw className="h-3 w-3 mr-1" /> Reset
                            </Button>
                          )}
                          {t.transfer_image_url && (
                            <Button
                              size="sm" variant="secondary" className="h-7 text-xs"
                              disabled={reverifying === t.id}
                              onClick={async () => {
                                setReverifying(t.id);
                                try {
                                  const { error } = await supabase.functions.invoke("verify-transfer-image", { body: { transfer_id: t.id } });
                                  if (error) throw error;
                                  toast({ title: "Re-verification triggered", description: "AI is analyzing the transfer proof." });
                                  setTimeout(() => fetchTransfers(), 3000);
                                } catch {
                                  toast({ title: "Error", description: "Failed to trigger re-verification.", variant: "destructive" });
                                } finally {
                                  setReverifying(null);
                                }
                              }}
                            >
                              {reverifying === t.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <ScanSearch className="h-3 w-3 mr-1" />}
                              Re-verify
                            </Button>
                          )}
                          <Button
                            size="sm" variant="outline" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
                            disabled={relaying === t.id}
                            onClick={async () => {
                              setRelaying(t.id);
                              try {
                                const { data, error } = await supabase.functions.invoke("resolve-transfer-email", { body: { transfer_id: t.id } });
                                if (error) throw error;
                                toast({ title: "Relay sent", description: `Buyer notification re-sent to ${t.buyer_email || "buyer"}.` });
                                fetchTransfers();
                              } catch {
                                toast({ title: "Error", description: "Failed to resend relay email.", variant: "destructive" });
                              } finally {
                                setRelaying(null);
                              }
                            }}
                          >
                            {relaying === t.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                            Resend Relay
                          </Button>
                          <Button
                            size="sm" variant="destructive" className="h-7 text-xs"
                            onClick={() => setConfirmDialog({ open: true, transfer: t, action: "delete" })}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({filtered.length} total)
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={confirmDialog.open} onOpenChange={(o) => { if (!o) { setConfirmDialog({ open: false, transfer: null, action: "confirm" }); setDisputeReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionLabel[confirmDialog.action]} Transfer</DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "confirm" && "This will mark the transfer as confirmed and notify the buyer that their tickets are ready."}
              {confirmDialog.action === "dispute" && "This will mark the transfer as disputed. The seller will be notified to re-upload proof."}
              {confirmDialog.action === "reset" && "This will reset the transfer to pending, clearing all uploaded proof and verification results."}
            </DialogDescription>
          </DialogHeader>
          {confirmDialog.transfer && (
            <div className="text-sm space-y-1 py-2">
              <p><strong>Event:</strong> {confirmDialog.transfer.event_title || "—"}</p>
              <p><strong>Seller:</strong> {confirmDialog.transfer.seller_name} ({confirmDialog.transfer.seller_email})</p>
              <p><strong>Buyer:</strong> {confirmDialog.transfer.buyer_email || "—"}</p>
            </div>
          )}
          {confirmDialog.action === "dispute" && (
            <div className="space-y-2">
              <Label htmlFor="dispute-reason">Reason for dispute (included in seller email)</Label>
              <Textarea
                id="dispute-reason"
                placeholder="e.g. Screenshot is blurry, wrong recipient email, missing seat details..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, transfer: null, action: "confirm" })} disabled={actionLoading}>Cancel</Button>
            <Button
              variant={confirmDialog.action === "dispute" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {actionLabel[confirmDialog.action]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTransfers;
