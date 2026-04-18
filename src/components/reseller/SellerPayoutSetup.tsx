import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { redirectToStripeCheckout } from "@/utils/redirectToStripeCheckout";

interface SellerPayoutSetupProps {
  connectAccountId: string | null;
  variant?: "card" | "inline";
  onUpdated?: () => void;
}

const SellerPayoutSetup = ({ connectAccountId, variant = "card" }: SellerPayoutSetupProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-seller-connect-account");
      if (error) throw error;
      if (data?.url) {
        redirectToStripeCheckout(data.url);
      } else {
        throw new Error("No onboarding URL returned");
      }
    } catch (err: any) {
      toast({
        title: "Could not open payout setup",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isConnected = !!connectAccountId;

  return (
    <div className={variant === "card" ? "rounded-xl border border-border bg-card p-6 space-y-4" : "space-y-4"}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="font-semibold">Payout Account</span>
        </div>
        {isConnected ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Connected
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" /> Not set up
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {isConnected
          ? "Your bank account is connected through Stripe. Payouts are processed 2 weeks after each event."
          : "Connect your bank account through Stripe to receive payouts. You'll fill in your banking and identity details on Stripe's secure form. Payouts are processed 2 weeks after each event."}
      </p>

      {!isConnected && (
        <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
          <li>Bank account / transit / institution number</li>
          <li>Government-issued ID</li>
          <li>SIN (last 4 digits) for tax reporting</li>
          <li>Business address</li>
        </ul>
      )}

      <Button
        variant={isConnected ? "outline" : "hero"}
        onClick={handleSetup}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirecting to Stripe…
          </>
        ) : (
          <>
            <ExternalLink className="h-4 w-4 mr-2" />
            {isConnected ? "Update Payout Details" : "Set Up Payout Account"}
          </>
        )}
      </Button>

      <p className="text-[11px] text-muted-foreground">
        🔒 Banking and tax information is collected and stored by Stripe — Seats.ca never sees your full bank or ID details.
      </p>
    </div>
  );
};

export default SellerPayoutSetup;
