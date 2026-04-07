import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Calendar, Tag, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { redirectToStripeCheckout } from "@/utils/redirectToStripeCheckout";

interface SubscriptionInfo {
  status: string;
  current_period_end: string | null;
  weekly_fee: number;
  discount_code: string | null;
}

const SellerBillingTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchSub = async () => {
      const { data: reseller } = await supabase
        .from("resellers")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "live")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (reseller) {
        const { data } = await supabase
          .from("seller_subscriptions")
          .select("status, current_period_end, weekly_fee, discount_code")
          .eq("reseller_id", reseller.id)
          .single();

        if (data) setSub(data);
      }
      setLoading(false);
    };
    fetchSub();
  }, [user]);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        redirectToStripeCheckout(data.url);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to open billing portal",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) return <div className="text-center text-muted-foreground py-4">Loading billing info...</div>;

  if (!sub) return <div className="text-center text-muted-foreground py-4">No subscription found.</div>;

  const statusVariant = sub.status === "active" ? "default" : "destructive";

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">Billing & Subscription</h2>
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="font-semibold">Seller Membership</span>
          </div>
          <Badge variant={statusVariant}>{sub.status.toUpperCase()}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Next Billing</p>
              <p className="font-medium">
                {sub.current_period_end
                  ? new Date(sub.current_period_end).toLocaleDateString("en-CA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Weekly Fee</p>
            <p className="font-medium">
              {sub.discount_code ? (
                <span className="text-green-500">$0.00 (waived)</span>
              ) : (
                `$${sub.weekly_fee.toFixed(2)} CAD`
              )}
            </p>
          </div>
          {sub.discount_code && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Discount Code</p>
                <p className="font-medium">{sub.discount_code}</p>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={handleManageBilling}
          disabled={portalLoading}
          className="mt-4"
        >
          {portalLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4 mr-2" />
          )}
          Manage Payment Method
        </Button>
      </div>
    </div>
  );
};

export default SellerBillingTab;
