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
import { Crown, Zap, Check, ShieldCheck, CalendarDays, MapPin, AlertTriangle, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FeeGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketPrice: number;
  section: string;
  rowName?: string | null;
  onProceedWithFees: (qty: number) => void;
  onProceedNoFees?: (qty: number) => void;
  loading: boolean;
  venueName?: string;
  gameTitle?: string;
  eventDate?: string;
  isMember?: boolean;
  availableQuantity: number;
  splitType?: string | null;
}

type CheckoutOption = "hst" | "membership";

const MEMBERSHIP_BENEFITS = [
  "HST becomes inclusive on all seats.ca purchases for 12 months",
  "Save hundreds per season on tickets",
  "Cancel anytime — auto-renew can be turned off",
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
  availableQuantity,
  splitType,
}: FeeGateDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<CheckoutOption>("membership");
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmedDetails, setConfirmedDetails] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  // Tickets can only be sold in 2 or 4. 3-packs must be sold as full set.
  const isThreePack = availableQuantity === 3;

  const getValidQuantities = (): number[] => {
    if (isThreePack) return [3];
    const valid: number[] = [];
    if (availableQuantity >= 2) valid.push(2);
    if (availableQuantity >= 4) valid.push(4);
    return valid;
  };

  const validQuantities = getValidQuantities();

  const getInitialQuantity = () => {
    return validQuantities[0] || 2;
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setAgreedToTerms(false);
      setConfirmedDetails(false);
      setQuantity(getInitialQuantity());
    }
  }, [open, availableQuantity]);

  const handleQuantityChange = (delta: number) => {
    const currentIdx = validQuantities.indexOf(quantity);
    const nextIdx = currentIdx + delta;
    if (nextIdx >= 0 && nextIdx < validQuantities.length) {
      setQuantity(validQuantities[nextIdx]);
    }
  };

  const subtotal = Math.round(ticketPrice * quantity * 100) / 100;
  const hstAmount = Math.round(subtotal * 0.13 * 100) / 100;
  const totalWithHST = Math.round((subtotal + hstAmount) * 100) / 100;
  const totalWithMembership = Math.round((subtotal + 49.95) * 100) / 100;

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
          ticketAmount: subtotal,
          quantity,
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
      onProceedNoFees?.(quantity);
    } else if (selectedOption === "membership") {
      handleBuyMembership();
    } else {
      onProceedWithFees(quantity);
    }
  };

  const isLoading = isMember ? loading : (selectedOption === "membership" ? membershipLoading : loading);
  const canProceed = agreedToTerms && confirmedDetails;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-5 pt-4 pb-3">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-foreground">Checkout</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Section {section}{rowName ? ` · Row ${rowName}` : ""}
              {venueName ? ` · ${venueName}` : ""}
            </DialogDescription>
            {formattedDate && (
              <p className="text-xs font-medium text-foreground/80 flex items-center gap-1 mt-1">
                <CalendarDays className="h-3 w-3" />
                {formattedDate}
              </p>
            )}
          </DialogHeader>
        </div>

        <div className="px-5 pb-5 space-y-3">
          {/* Sales final warning — always at top */}
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground/90">
              All ticket sales are final unless an event is cancelled without a rescheduling opportunity set out by the event organizer.
            </p>
          </div>

          {/* Quantity selector + ticket price */}
          <div className="flex justify-between items-center py-2 border-b border-border">
            <div>
              <span className="text-foreground font-medium text-sm">Tickets</span>
              <span className="text-muted-foreground text-xs ml-1.5">(${ticketPrice.toFixed(2)} each)</span>
            </div>
            <div className="flex items-center gap-2">
              {validQuantities.length > 1 ? (
                <div className="flex items-center gap-1 border border-border rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={validQuantities.indexOf(quantity) <= 0}
                    className="px-1.5 py-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-bold text-foreground w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={validQuantities.indexOf(quantity) >= validQuantities.length - 1}
                    className="px-1.5 py-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">×{quantity} {isThreePack ? "(full set)" : ""}</span>
              )}
              <span className="text-foreground font-bold text-base">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Quantity notice */}
          <p className="text-[10px] text-muted-foreground text-center italic">
            {isThreePack
              ? `This listing must be purchased as a full set of 3.`
              : "Tickets are sold in groups of 2 or 4."}
          </p>
          )}

          {isMember ? (
            /* ---- MEMBER CHECKOUT ---- */
            <div className="space-y-3">
              <div className="rounded-lg border-2 border-gold bg-gold/5 p-3">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-gold" />
                  <p className="font-semibold text-foreground text-sm">Member Pricing</p>
                  <span className="text-[10px] font-bold bg-gold/20 text-gold px-1.5 py-0.5 rounded uppercase tracking-wide">
                    No Fees
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">Your membership removes all service fees.</p>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
                <p className="text-[11px] font-bold text-primary flex items-center gap-1 uppercase tracking-wide">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Required — Check both to proceed
                </p>
                <div className="flex items-start gap-2">
                  <Checkbox id="terms-member" checked={agreedToTerms} onCheckedChange={(v) => setAgreedToTerms(v === true)} className="mt-0.5" />
                  <label htmlFor="terms-member" className="text-[11px] text-muted-foreground leading-snug cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms-of-service" target="_blank" className="text-primary underline hover:text-primary/80">Terms of Service</a>,{" "}
                    <a href="/terms-of-service#refunds" target="_blank" className="text-primary underline hover:text-primary/80">Refund Policy</a>, and{" "}
                    <a href="/terms-of-service#ticket-delivery" target="_blank" className="text-primary underline hover:text-primary/80">Ticket Delivery Policy</a>.
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="details-member" checked={confirmedDetails} onCheckedChange={(v) => setConfirmedDetails(v === true)} className="mt-0.5" />
                  <label htmlFor="details-member" className="text-[11px] text-muted-foreground leading-snug cursor-pointer">
                    I confirm the ticket details above are correct.
                  </label>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-bold text-base">Total</span>
                  <span className="text-foreground font-display font-bold text-xl">${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  By purchasing, you agree to contact Seats.ca support before initiating a payment dispute with your bank.
                </p>
                <Button variant="gold" size="lg" className="w-full text-sm h-10" onClick={handleProceed} disabled={isLoading || !canProceed}>
                  <Zap className="h-4 w-4" />
                  {isLoading ? "Processing..." : `Pay $${subtotal.toFixed(2)}`}
                </Button>
              </div>
            </div>
          ) : (
            /* ---- NON-MEMBER CHECKOUT ---- */
            <>
              <p className="text-xs font-bold text-foreground uppercase tracking-wide text-center">Please Choose:</p>

              <div className="space-y-2">
                {/* Option: No membership */}
                <button
                  onClick={() => setSelectedOption("hst")}
                  className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
                    selectedOption === "hst"
                      ? "border-destructive bg-destructive/5"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedOption === "hst" ? "border-destructive bg-destructive" : "border-muted-foreground/40"
                      }`}>
                        {selectedOption === "hst" && <Check className="h-2.5 w-2.5 text-destructive-foreground" />}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">Buy Tickets with No Membership</p>
                        <p className="text-[11px] text-muted-foreground">
                          {quantity}× ${ticketPrice.toFixed(2)} + <span className="text-destructive font-medium">HST ${hstAmount.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-foreground font-bold text-base whitespace-nowrap">${totalWithHST.toFixed(2)}</span>
                  </div>
                </button>

                {/* Option: Add membership */}
                <button
                  onClick={() => setSelectedOption("membership")}
                  className={`w-full text-left rounded-lg border-2 p-3 transition-all ${
                    selectedOption === "membership"
                      ? "border-gold bg-gold/5"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedOption === "membership" ? "border-gold bg-gold" : "border-muted-foreground/40"
                      }`}>
                        {selectedOption === "membership" && <Check className="h-2.5 w-2.5 text-gold-foreground" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">Add Annual Membership to Purchase</p>
                          <span className="text-[9px] font-bold bg-gold/20 text-gold px-1 py-0.5 rounded uppercase tracking-wide">
                            Recommended
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          $49.95/year — HST becomes inclusive for 12 months. Cancel anytime.
                        </p>
                      </div>
                    </div>
                    <span className="text-foreground font-bold text-base whitespace-nowrap">${totalWithMembership.toFixed(2)}</span>
                  </div>
                </button>

                {selectedOption === "membership" && (
                  <div className="text-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
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

              {/* Checkboxes — highlighted box */}
              <div className="space-y-2 rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
                <p className="text-[11px] font-bold text-primary flex items-center gap-1 uppercase tracking-wide">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Required — Check both to proceed
                </p>
                <div className="flex items-start gap-2">
                  <Checkbox id="terms-nonmember" checked={agreedToTerms} onCheckedChange={(v) => setAgreedToTerms(v === true)} className="mt-0.5" />
                  <label htmlFor="terms-nonmember" className="text-[11px] text-muted-foreground leading-snug cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms-of-service" target="_blank" className="text-primary underline hover:text-primary/80">Terms of Service</a>,{" "}
                    <a href="/terms-of-service#refunds" target="_blank" className="text-primary underline hover:text-primary/80">Refund Policy</a>, and{" "}
                    <a href="/terms-of-service#ticket-delivery" target="_blank" className="text-primary underline hover:text-primary/80">Ticket Delivery Policy</a>.
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="details-nonmember" checked={confirmedDetails} onCheckedChange={(v) => setConfirmedDetails(v === true)} className="mt-0.5" />
                  <label htmlFor="details-nonmember" className="text-[11px] text-muted-foreground leading-snug cursor-pointer">
                    I confirm the ticket details above are correct.
                  </label>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-bold text-base">Total</span>
                  <span className="text-foreground font-display font-bold text-xl">${currentTotal.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  By purchasing, you agree to contact Seats.ca support before initiating a payment dispute with your bank.
                </p>
                <Button
                  variant={selectedOption === "membership" ? "gold" : "hero"}
                  size="lg"
                  className="w-full text-sm h-10"
                  onClick={handleProceed}
                  disabled={isLoading || !canProceed}
                >
                  {selectedOption === "membership" ? (
                    <>
                      <Zap className="h-4 w-4" />
                      {isLoading ? "Processing..." : `Get Membership & Pay $${currentTotal.toFixed(2)}`}
                    </>
                  ) : (
                    <>{isLoading ? "Processing..." : `Pay $${currentTotal.toFixed(2)}`}</>
                  )}
                </Button>
                {selectedOption === "hst" && (
                  <p className="text-center text-[11px] text-muted-foreground">
                    Includes ${hstAmount.toFixed(2)} HST. <button onClick={() => setSelectedOption("membership")} className="text-gold hover:underline font-medium">Save with a membership →</button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeGateDialog;
