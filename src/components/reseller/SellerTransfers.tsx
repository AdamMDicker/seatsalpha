import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, Clock, AlertTriangle, ImageIcon } from "lucide-react";

interface Transfer {
  id: string;
  order_id: string;
  ticket_id: string;
  transfer_image_url: string | null;
  transfer_email_alias: string | null;
  status: string;
  uploaded_at: string | null;
  created_at: string;
  event_title?: string;
  venue?: string;
  event_date?: string;
  section?: string;
  row_name?: string;
  quantity?: number;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  pending: { label: "Awaiting Upload", variant: "destructive", icon: Clock },
  uploaded: { label: "Uploaded", variant: "secondary", icon: Upload },
  confirmed: { label: "Confirmed", variant: "default", icon: CheckCircle },
  disputed: { label: "Disputed", variant: "destructive", icon: AlertTriangle },
};

const SellerTransfers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchTransfers = useCallback(async () => {
    if (!user) return;
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

    // Enrich with ticket/event info
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

      // Update the transfer record
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

      // Trigger buyer notification
      const { error: notifyError } = await supabase.functions.invoke("notify-buyer-transfer", {
        body: { transfer_id: transferId },
      });

      if (notifyError) {
        console.error("Failed to notify buyer:", notifyError);
      }

      toast({ title: "Transfer proof uploaded!", description: "The buyer has been notified automatically." });
      fetchTransfers();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground py-8">Loading transfers...</div>;
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

  const pendingCount = transfers.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Ticket Transfers</h2>
        {pendingCount > 0 && (
          <Badge variant="destructive">{pendingCount} awaiting upload</Badge>
        )}
      </div>

      <div className="space-y-4">
        {transfers.map((transfer) => {
          const config = statusConfig[transfer.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const orderRef = transfer.order_id.slice(0, 8).toUpperCase();

          return (
            <div
              key={transfer.id}
              className="glass rounded-xl p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-foreground truncate">
                    {transfer.event_title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{transfer.venue}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span>Order #{orderRef}</span>
                    <span>Section {transfer.section}{transfer.row_name ? ` · Row ${transfer.row_name}` : ""}</span>
                    <span>Qty: {transfer.quantity}</span>
                  </div>
                </div>
                <Badge variant={config.variant} className="flex items-center gap-1 shrink-0">
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>

              {transfer.status === "pending" && (
                <div className="pt-2 border-t border-border">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(transfer.id, file);
                      }}
                    />
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full"
                      disabled={uploading === transfer.id}
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading === transfer.id ? "Uploading..." : "Upload Transfer Proof"}
                      </span>
                    </Button>
                  </label>
                </div>
              )}

              {transfer.transfer_image_url && (
                <div className="pt-2 border-t border-border">
                  <a
                    href={transfer.transfer_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    View uploaded proof
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SellerTransfers;
