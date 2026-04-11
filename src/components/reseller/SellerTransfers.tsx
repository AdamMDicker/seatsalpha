import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Upload, CheckCircle, Clock, AlertTriangle, ImageIcon, Copy, Mail,
  Loader2, ShieldCheck, ShieldAlert, ExternalLink, Search, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

const PAGE_SIZE = 20;

interface Transfer {
  id: string;
  order_id: string;
  ticket_id: string;
  transfer_image_url: string | null;
  transfer_email_alias: string | null;
  status: string;
  uploaded_at: string | null;
  created_at: string;
  verification_result?: any;
  event_title?: string;
  venue?: string;
  event_date?: string;
  section?: string;
  row_name?: string;
  quantity?: number;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Awaiting Upload", variant: "destructive" },
  uploaded: { label: "Analyzing...", variant: "secondary" },
  confirmed: { label: "Verified ✓", variant: "default" },
  disputed: { label: "Needs Re-upload", variant: "destructive" },
};

const SellerTransfers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchTransfers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("order_transfers")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch transfers:", error);
      setLoading(false);
      return;
    }

    const enriched: Transfer[] = [];
    for (const t of data || []) {
      const { data: orderItem } = await supabase
        .from("order_items")
        .select("quantity, tickets(section, row_name, event_id, events(title, venue, event_date))")
        .eq("order_id", t.order_id)
        .eq("ticket_id", t.ticket_id)
        .maybeSingle();

      const ticket = orderItem?.tickets as any;
      const event = ticket?.events as any;

      enriched.push({
        ...t,
        verification_result: (t as any).verification_result,
        event_title: event?.title || "Unknown Event",
        venue: event?.venue || "",
        event_date: event?.event_date || "",
        section: ticket?.section || "",
        row_name: ticket?.row_name || "",
        quantity: orderItem?.quantity || 1,
      });
    }
    setTransfers(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const handleUpload = async (transferId: string, file: File) => {
    if (!user) return;
    setUploading(transferId);

    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/transfers/${transferId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("seat-images")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("seat-images")
        .getPublicUrl(path);

      const imageUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("order_transfers")
        .update({
          transfer_image_url: imageUrl,
          status: "uploaded",
          uploaded_at: new Date().toISOString(),
        })
        .eq("id", transferId)
        .eq("seller_id", user.id);

      if (updateError) throw updateError;

      toast({ title: "Transfer proof uploaded!", description: "AI verification is analyzing your screenshot..." });
      setUploading(null);
      setVerifying(transferId);

      const { error: verifyError } = await supabase.functions.invoke("verify-transfer-image", {
        body: { transfer_id: transferId },
      });

      if (verifyError) {
        console.error("Verification error:", verifyError);
        await supabase.functions.invoke("notify-buyer-transfer", {
          body: { transfer_id: transferId },
        });
      }

      setVerifying(null);
      fetchTransfers();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
      setUploading(null);
      setVerifying(null);
    }
  };

  const filtered = transfers.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (t.event_title || "").toLowerCase().includes(q) ||
        (t.venue || "").toLowerCase().includes(q) ||
        t.order_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [statusFilter, search]);

  const pendingCount = transfers.filter((t) => t.status === "pending" || t.status === "disputed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto" />
        <h3 className="font-display font-semibold text-foreground">No Pending Transfers</h3>
        <p className="text-sm text-muted-foreground">When your tickets sell, transfer requests will appear here.</p>
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
              placeholder="Search events, orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-56"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Awaiting Upload</SelectItem>
              <SelectItem value="uploaded">Analyzing</SelectItem>
              <SelectItem value="confirmed">Verified</SelectItem>
              <SelectItem value="disputed">Needs Re-upload</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center text-sm text-muted-foreground">
          {pendingCount > 0 && (
            <Badge variant="destructive">{pendingCount} action needed</Badge>
          )}
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
                <TableHead>Section / Row</TableHead>
                <TableHead>Transfer Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>AI Result</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((t) => {
                const cfg = statusConfig[t.status] || statusConfig.pending;
                const vr = t.verification_result as any;
                const isCurrentlyVerifying = verifying === t.id;

                return (
                  <TableRow key={t.id}>
                    <TableCell className="max-w-[200px]">
                      <div className="font-medium text-sm truncate">{t.event_title || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.event_date ? format(new Date(t.event_date), "MMM d, yyyy") : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {t.section || "—"}{t.row_name ? ` / ${t.row_name}` : ""}
                        {t.quantity ? ` (×${t.quantity})` : ""}
                      </span>
                    </TableCell>
                    <TableCell>
                      {t.transfer_email_alias ? (
                        <div className="flex items-center gap-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[140px] block">
                            {t.transfer_email_alias}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              navigator.clipboard.writeText(t.transfer_email_alias!);
                              toast({ title: "Copied!", description: "Transfer email copied." });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isCurrentlyVerifying ? (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <Loader2 className="h-3 w-3 animate-spin" /> Analyzing...
                        </Badge>
                      ) : (
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      )}
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
                      {(t.status === "pending" || t.status === "disputed") && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(t.id, file);
                            }}
                          />
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs"
                            disabled={uploading === t.id || isCurrentlyVerifying}
                            asChild
                          >
                            <span>
                              {uploading === t.id ? (
                                <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Uploading</>
                              ) : (
                                <><Upload className="h-3 w-3 mr-1" />{t.status === "disputed" ? "Re-upload" : "Upload Proof"}</>
                              )}
                            </span>
                          </Button>
                        </label>
                      )}
                      {t.status === "confirmed" && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" /> Complete
                        </span>
                      )}
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
    </div>
  );
};

export default SellerTransfers;
