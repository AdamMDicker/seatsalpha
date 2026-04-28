import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface SellerCredit {
  id: string;
  seller_id: string;
  order_id: string | null;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
  paid_at: string | null;
}

const AdminSellerCredits = () => {
  const { toast } = useToast();
  const [credits, setCredits] = useState<SellerCredit[]>([]);
  const [sellerEmails, setSellerEmails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("seller_credits")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading credits", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setCredits((data || []) as SellerCredit[]);

    const sellerIds = Array.from(new Set((data || []).map((c: any) => c.seller_id)));
    if (sellerIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", sellerIds);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => { map[p.user_id] = p.email || ""; });
      setSellerEmails(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markPaid = async (id: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("seller_credits")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", id);
    setUpdatingId(null);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Marked paid" });
      load();
    }
  };

  const pendingTotal = credits
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + Number(c.amount), 0);

  return (
    <div className="space-y-4">
      <div className="bg-card border border-primary/20 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-gold" />
          <div>
            <h2 className="font-display text-lg font-bold">Seller Credits</h2>
            <p className="text-sm text-muted-foreground">
              Bonuses owed to sellers (e.g. $20 membership-referral). Reconcile alongside the next Stripe Connect payout.
            </p>
          </div>
        </div>
        <div className="mt-3 text-sm">
          Pending total: <strong className="text-gold">${pendingTotal.toFixed(2)}</strong> across{" "}
          {credits.filter((c) => c.status === "pending").length} credit(s).
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
        ) : credits.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No seller credits yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {credits.map((c) => (
              <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{sellerEmails[c.seller_id] || c.seller_id.slice(0, 8)}</span>
                    <Badge variant={c.status === "paid" ? "secondary" : "default"}>{c.status}</Badge>
                    <span className="text-xs text-muted-foreground">{c.reason}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {format(new Date(c.created_at), "PPp")}
                    {c.order_id && <> · order {c.order_id.slice(0, 8)}</>}
                    {c.paid_at && <> · paid {format(new Date(c.paid_at), "PP")}</>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-gold">${Number(c.amount).toFixed(2)}</span>
                  {c.status === "pending" && (
                    <Button size="sm" onClick={() => markPaid(c.id)} disabled={updatingId === c.id}>
                      {updatingId === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark paid"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellerCredits;
