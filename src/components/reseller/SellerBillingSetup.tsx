import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Tag, Loader2 } from "lucide-react";
import { redirectToStripeCheckout } from "@/utils/redirectToStripeCheckout";

interface SellerBillingSetupProps {
  onSuccess?: () => void;
}

const SellerBillingSetup = ({ onSuccess }: SellerBillingSetupProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");

  const handleSetupBilling = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-seller-checkout", {
        body: { discount_code: discountCode || undefined },
      });

      if (error) throw error;
      if (data?.url) {
        redirectToStripeCheckout(data.url);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mb-16">
      <div className="glass rounded-xl p-8 text-center space-y-6">
        <CreditCard className="h-10 w-10 text-primary mx-auto" />
        <h2 className="font-display text-xl font-bold">Set Up Weekly Billing</h2>
        <p className="text-sm text-muted-foreground">
          Set up your recurring weekly seller membership.
          Your card will be charged automatically each week.
        </p>

        <div className="space-y-3 max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Discount code (optional)"
              maxLength={20}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleSetupBilling}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              "Add Payment Method & Subscribe"
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          You can cancel anytime. If payment fails, your listings will be automatically delisted.
        </p>
      </div>
    </div>
  );
};

export default SellerBillingSetup;
