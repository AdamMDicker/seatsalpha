import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Crown, Zap, Check, ShieldCheck, CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FeeGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketPrice: number;
  section: string;
  rowName?: string | null;
  onProceedWithFees: () => void;
  onProceedNoFees?: () => void;
  loading: boolean;
  venueName?: string;
  gameTitle?: string;
  eventDate?: string;
  isMember?: boolean;
}

type CheckoutOption = "hst" | "membership";

const MEMBERSHIP_BENEFITS = [
  "No HST on all seats.ca purchases for 12 months",
  "Save hundreds per season on tickets",
  "Cancel anytime — no commitment",
  "Works across all sports & events",
];

const FeeGateDialog = ({
  open,
  onOpenChange,
  ticketPrice,
  section,
  rowName,
  onProceedWithFees,
  onProceedNoFees,
  loading,
  venueName,
  gameTitle,
  eventDate,
  isMember = false,
}: FeeGateDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<CheckoutOption>("membership");
  const [membershipLoading, setMembershipLoading] = useState(false);
  const { toast } = useToast();

  const hstAmount = Math.round(ticketPrice * 0.13 * 100) / 100;
  const totalWithHST = Math.round((ticketPrice + hstAmount) * 100) / 100;
  const totalWithMembership = Math.round((ticketPrice + 49.95) * 100) / 100;

  const currentTotal = selectedOption === "hst" ? totalWithHST : totalWithMembership;

  const formattedDate = eventDate
    ? format(new Date(eventDate), "EEEE, MMMM d, yyyy · h:mm a")
    : null;

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
          eventDate: eventDate || "",
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
    if (isMember) {
      onProceedNoFees?.();
    } else if (selectedOption === "membership") {
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
          {/* Game date & venue for chargeback clarity */}
          {(formattedDate || venueName) && (
            <div className="mt-3 space-y-1">
              {formattedDate && (
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <CalendarDays className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {venueName && (
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span>{venueName}</span>
                </div>
              )}
            </div>
          )}
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

            {/* Membership info hover popover — stays in checkout */}
            {selectedOption === "membership" && (
              <div className="text-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-xs text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
                      <Crown className="h-3 w-3" />
                      Why buy a membership?
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4" align="center">
                    <div className="space-y-3">
                      <h4 className="font-display font-bold text-sm text-foreground flex items-center gap-1.5">
                        <Crown className="h-4 w-4 text-gold" />
                        Membership Benefits
                      </h4>
                      <ul className="space-y-2">
                        {MEMBERSHIP_BENEFITS.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Check className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-muted-foreground/70 pt-1 border-t border-border">
                        One payment of $49.95/year. Pays for itself in 1–2 purchases.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
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
