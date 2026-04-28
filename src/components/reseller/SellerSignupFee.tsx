import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Loader2 } from "lucide-react";
import { redirectToStripeCheckout } from "@/utils/redirectToStripeCheckout";
import {
  SELLER_SIGNUP_PRICE,
  SELLER_SIGNUP_PRICE_ORIGINAL,
  SELLER_SIGNUP_DISCOUNT_PCT,
} from "@/config/pricing";

const SellerSignupFee = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePaySignupFee = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-seller-signup-fee");
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
      <div className="bg-card border border-primary/20 rounded-xl p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto">
          <DollarSign className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold">One-Time Seller Sign-Up Fee</h2>

        <div className="flex flex-col items-center gap-1">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold px-2 py-0.5 rounded">
            Limited time — {SELLER_SIGNUP_DISCOUNT_PCT}% OFF
          </span>
          <div className="flex items-baseline gap-2">
            <span className="line-through text-muted-foreground/70 text-lg">
              ${SELLER_SIGNUP_PRICE_ORIGINAL.toFixed(2)}
            </span>
            <span className="font-display text-3xl font-bold text-gold">
              ${SELLER_SIGNUP_PRICE.toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">CAD</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          A one-time sign-up fee is required to activate your seller account
          and gain access to list tickets across all sports and events.
        </p>

        <Button
          variant="hero"
          size="lg"
          className="w-full max-w-sm mx-auto"
          onClick={handlePaySignupFee}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Redirecting...
            </>
          ) : (
            `Pay $${SELLER_SIGNUP_PRICE.toFixed(2)} Sign-Up Fee`
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          This is a one-time payment. After this, you'll set up your recurring weekly membership.
        </p>
      </div>
    </div>
  );
};

export default SellerSignupFee;
