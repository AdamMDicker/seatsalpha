import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Check, ShieldCheck, ExternalLink } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface FeeGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketPrice: number;
  section: string;
  rowName?: string | null;
  onProceedWithFees: () => void;
  loading: boolean;
  venueName?: string;
  gameTitle?: string;
}

type CheckoutOption = "hst" | "membership";

const FeeGateDialog = ({
  open,
  onOpenChange,
  ticketPrice,
  section,
  rowName,
  onProceedWithFees,
  loading,
  venueName,
  gameTitle,
}: FeeGateDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<CheckoutOption>("membership");
  const [membershipLoading, setMembershipLoading] = useState(false);
  const { toast } = useToast();

  const hstAmount = Math.round(ticketPrice * 0.13 * 100) / 100;
  const totalWithHST = Math.round((ticketPrice + hstAmount) * 100) / 100;
  const totalWithMembership = Math.round((ticketPrice + 49.95) * 100) / 100;

  const currentTotal = selectedOption === "hst" ? totalWithHST : totalWithMembership;

  const handleBuyMembership = async () => {
    setMembershipLoading(true);
    try {
      const tier = `Section ${section}${rowName ? ` Row ${rowName}` : ""}`;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          ticketAmount: ticketPrice,
          eventTitle: gameTitle || "Event Ticket",
          tier,
          venue: venueName || "",
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not start checkout", variant: "destructive" });
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleProceed = () => {
    if (selectedOption === "membership") {
      handleBuyMembership();
    } else {
      onProceedWithFees();
    }
  };

  const isLoading = selectedOption === "membership" ? membershipLoading : loading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-foreground">Checkout</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Section {section}{rowName ? ` · Row ${rowName}` : ""}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Ticket base price */}
          <div className="flex justify-between items-center py-3 border-b border-border">
            <span className="text-foreground font-medium text-base">Ticket Price</span>
            <span className="text-foreground font-bold text-lg">${ticketPrice.toFixed(2)}</span>
          </div>

          {/* Option cards */}
          <div className="space-y-3">
            {/* Option: No membership (pay HST) */}
            <button
              onClick={() => setSelectedOption("hst")}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                selectedOption === "hst"
                  ? "border-destructive bg-destructive/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedOption === "hst" ? "border-destructive bg-destructive" : "border-muted-foreground/40"
                  }`}>
                    {selectedOption === "hst" && <Check className="h-3 w-3 text-destructive-foreground" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">No Membership</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Add 13% HST <span className="text-destructive font-semibold">(+${hstAmount.toFixed(2)})</span>
                    </p>
                  </div>
                </div>
                <span className="text-foreground font-bold text-lg whitespace-nowrap">
                  ${totalWithHST.toFixed(2)}
                </span>
              </div>
            </button>

            {/* Option: Add membership (no HST) */}
            <button
              onClick={() => setSelectedOption("membership")}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                selectedOption === "membership"
                  ? "border-gold bg-gold/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedOption === "membership" ? "border-gold bg-gold" : "border-muted-foreground/40"
                  }`}>
                    {selectedOption === "membership" && <Check className="h-3 w-3 text-gold-foreground" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">Add Membership</p>
                      <span className="text-[10px] font-bold bg-gold/20 text-gold px-1.5 py-0.5 rounded uppercase tracking-wide">
                        Recommended
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      $49.95/year — <span className="text-primary font-semibold">no HST</span> on all seats.ca purchases
                    </p>
                  </div>
                </div>
                <span className="text-foreground font-bold text-lg whitespace-nowrap">
                  ${totalWithMembership.toFixed(2)}
                </span>
              </div>

              {/* Savings callout when selected */}
              {selectedOption === "membership" && (
                <div className="mt-3 ml-8 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>Save the HST on every ticket for 12 months. Cancel anytime.</span>
                </div>
              )}
            </button>

            {/* Membership info link */}
            {selectedOption === "membership" && (
              <div className="text-center">
                <Link
                  to="/membership"
                  target="_blank"
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Crown className="h-3 w-3" />
                  Why buy a membership?
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Total + CTA */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-foreground font-bold text-lg">Total</span>
              <span className="text-foreground font-display font-bold text-2xl">
                ${currentTotal.toFixed(2)}
              </span>
            </div>

            <Button
              variant={selectedOption === "membership" ? "gold" : "hero"}
              size="lg"
              className="w-full text-base h-12"
              onClick={handleProceed}
              disabled={isLoading}
            >
              {selectedOption === "membership" ? (
                <>
                  <Zap className="h-4 w-4" />
                  {isLoading ? "Processing..." : `Get Membership & Pay $${currentTotal.toFixed(2)}`}
                </>
              ) : (
                <>
                  {isLoading ? "Processing..." : `Pay $${currentTotal.toFixed(2)}`}
                </>
              )}
            </Button>

            {selectedOption === "hst" && (
              <p className="text-center text-xs text-muted-foreground">
                Includes ${hstAmount.toFixed(2)} HST. <button onClick={() => setSelectedOption("membership")} className="text-gold hover:underline font-medium">Save with a membership →</button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeGateDialog;
