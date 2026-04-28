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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Crown, Zap, Check, ShieldCheck, CalendarDays, AlertTriangle, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { redirectToStripeCheckout } from "@/utils/redirectToStripeCheckout";
import { format } from "date-fns";
import { MEMBERSHIP_PRICE, MEMBERSHIP_PRICE_ORIGINAL, MEMBERSHIP_DISCOUNT_PCT } from "@/config/pricing";
import ContactInfoGate from "./ContactInfoGate";

interface FeeGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketPrice: number;
  section: string;
  rowName?: string | null;
  onProceedWithFees: (qty: number) => void;
  onProceedNoFees?: (qty: number) => void;
  ticketId?: string;
  loading: boolean;
  venueName?: string;
  gameTitle?: string;
  eventDate?: string;
  isMember?: boolean;
  isAdmin?: boolean;
  availableQuantity: number;
  splitType?: string | null;
  preferredQuantity?: number;
  faceValue?: number | null;
}

type CheckoutOption = "hst" | "membership";

const MEMBERSHIP_BENEFITS = [
  "LCC becomes inclusive on all seats.ca purchases for 12 months",
  "Save hundreds per season on tickets",
  "Cancel anytime — auto-renew can be turned off",
  "Works across all sports & events",
];

const getEdgeFunctionErrorMessage = async (err: any, fallback: string) => {
  const defaultMessage = err?.message || fallback;
  const context = err?.context;

  if (!context || typeof context.json !== "function") {
    return defaultMessage;
  }

  try {
    const body = await context.json();
    if (typeof body?.error === "string" && body.error.trim()) {
      return body.error;
    }
  } catch {
    // ignore body parsing issues
  }

  return defaultMessage;
};

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
  isAdmin = false,
  availableQuantity,
  splitType,
  preferredQuantity,
  ticketId,
  faceValue,
}: FeeGateDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<CheckoutOption>(isMember ? "hst" : "membership");
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [contactGateOpen, setContactGateOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const isOddFullSet = availableQuantity % 2 !== 0;
  const isThreePack = availableQuantity === 3; // kept for copy compatibility

  const getValidQuantities = (): number[] => {
    // Odd remaining → must buy as a full set
    if (isOddFullSet) return [availableQuantity];
    // Even remaining → any even quantity up to available
    const valid: number[] = [];
    for (let n = 2; n <= availableQuantity; n += 2) {
      valid.push(n);
    }
    return valid;
  };

  const validQuantities = getValidQuantities();

  const quantityHint = isOddFullSet
    ? `This listing must be purchased as a full set of ${availableQuantity} (no singles left behind).`
    : availableQuantity === 2
      ? "Sold as a pair (2 tickets)."
      : `Sold in pairs — choose ${validQuantities.join(", ")}.`;

  const getInitialQuantity = () => {
    if (preferredQuantity && validQuantities.includes(preferredQuantity)) return preferredQuantity;
    // Default to 2 when no preference (lower commitment = less friction)
    return validQuantities[0] || 2;
  };

  useEffect(() => {
    if (open) {
      setConfirmed(false);
      setQuantity(getInitialQuantity());
      setSelectedOption(isMember ? "hst" : "membership");
    }
  }, [open, availableQuantity, isMember]);

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
  const totalWithMembership = Math.round((subtotal + MEMBERSHIP_PRICE) * 100) / 100;

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
          ticketId: ticketId || "",
        },
      });
      if (error) throw error;
      if (data?.url) {
        redirectToStripeCheckout(data.url);
        return;
      }
      throw new Error("Checkout URL was not returned");
    } catch (err: any) {
      const message = await getEdgeFunctionErrorMessage(err, "Could not start checkout");
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setMembershipLoading(false);
    }
  };

  const ensureContactInfoThen = async (action: () => void) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      action();
      return;
    }
    setCurrentUserId(user.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone, address_line1, city, province, postal_code")
      .eq("user_id", user.id)
      .maybeSingle();
    const complete =
      !!profile?.phone?.trim() &&
      !!profile?.address_line1?.trim() &&
      !!profile?.city?.trim() &&
      !!profile?.province?.trim() &&
      !!profile?.postal_code?.trim();
    if (!complete) {
      setContactGateOpen(true);
      return;
    }
    action();
  };

  const handleProceed = () => {
    const action = () => {
      if (isMember || selectedOption === "hst") {
        if (isMember) {
          onProceedNoFees?.(quantity);
        } else {
          onProceedWithFees(quantity);
        }
      } else {
        handleBuyMembership();
      }
    };
    ensureContactInfoThen(action);
  };

  const isLoading = selectedOption === "membership" ? membershipLoading : loading;

  const contactGate = currentUserId ? (
    <ContactInfoGate
      open={contactGateOpen}
      onOpenChange={setContactGateOpen}
      userId={currentUserId}
      onComplete={() => {
        setContactGateOpen(false);
        setTimeout(() => handleProceed(), 50);
      }}
    />
  ) : null;

  // --- MEMBER FAST-PATH: skip pricing options entirely ---
  if (isMember) {
    return (
      <>
      {contactGate}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-gold/10 to-gold/5 border-b border-border px-4 pt-3 pb-2 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="font-display text-base text-foreground flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-gold" /> Member Checkout
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-[11px]">
                Section {section}{rowName ? ` · Row ${rowName}` : ""}{venueName ? ` · ${venueName}` : ""}
              </DialogDescription>
              {formattedDate && (
                <p className="text-[11px] font-medium text-foreground/80 flex items-center gap-1 mt-0.5">
                  <CalendarDays className="h-3 w-3" /> {formattedDate}
                </p>
              )}
            </DialogHeader>
          </div>

          <div className="px-4 pb-4 space-y-3">
            {/* Sales final warning */}
            <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 p-1.5 mt-3">
              <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-foreground/90 leading-snug">
                All ticket sales are final unless an event is cancelled without a rescheduling opportunity.
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-center gap-3 py-2">
              <span className="text-foreground font-semibold text-sm">
                Tickets <span className="text-muted-foreground text-xs font-normal ml-1">(${ticketPrice.toFixed(2)} CAD each)</span>
              </span>
              <div className="flex items-center gap-1.5">
                {validQuantities.length > 1 ? (
                  <div className="inline-flex items-center border-2 border-gold/40 rounded-lg bg-gold/10">
                    <button onClick={() => handleQuantityChange(-1)} disabled={validQuantities.indexOf(quantity) <= 0} className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-lg font-display font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">{quantity}</span>
                    <button onClick={() => handleQuantityChange(1)} disabled={validQuantities.indexOf(quantity) >= validQuantities.length - 1} className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-lg font-display font-bold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/30">×{quantity}{isThreePack ? " set" : ""}</span>
                )}
                <span className="text-muted-foreground text-xs">=</span>
                <span className="text-foreground font-bold text-base font-display">${subtotal.toFixed(2)} CAD</span>
              </div>
            </div>

            <p className="text-[10px] text-primary font-medium italic text-center">
              {quantityHint}
            </p>

            <span className="text-[9px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded block text-center">No fees — Member pricing applied</span>
            {faceValue && faceValue > 0 && (
              <p className="text-[9px] text-muted-foreground text-center mt-1">Original face value: ${faceValue.toFixed(2)} per ticket</p>
            )}

            {/* Single checkbox */}
            <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-2">
              <Checkbox id="confirm-member" checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} className="mt-0.5" />
              <label htmlFor="confirm-member" className="text-[10px] text-muted-foreground leading-snug cursor-pointer">
                I confirm the details above are correct and agree to the{" "}
                <a href="/terms-of-service" target="_blank" className="text-primary underline">Terms of Service</a>,{" "}
                <a href="/terms-of-service#refunds" target="_blank" className="text-primary underline">Refund Policy</a>, and{" "}
                <a href="/terms-of-service#ticket-delivery" target="_blank" className="text-primary underline">Ticket Delivery Policy</a>.
              </label>
            </div>

            <Button variant="gold" className="w-full h-12 text-base" onClick={handleProceed} disabled={isLoading || !confirmed}>
              <Zap className="h-4 w-4" />
              {isLoading ? "Processing..." : `Pay $${subtotal.toFixed(2)} CAD`}
            </Button>
            <p className="text-[9px] text-muted-foreground text-center">
              By purchasing, you agree to contact Seats.ca support before initiating a payment dispute.
            </p>
            <p className="text-[10px] font-bold text-primary text-center">
              📬 If you don't see the confirmation email, please check your spam/junk folder.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // --- NON-MEMBER / ADMIN FULL DIALOG ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-4 pt-2.5 pb-1.5 flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="font-display text-base text-foreground">Checkout</DialogTitle>
            <DialogDescription className="text-muted-foreground text-[11px]">
              Section {section}{rowName ? ` · Row ${rowName}` : ""}{venueName ? ` · ${venueName}` : ""}
            </DialogDescription>
            {formattedDate && (
              <p className="text-[11px] font-medium text-foreground/80 flex items-center gap-1 mt-0.5">
                <CalendarDays className="h-3 w-3" /> {formattedDate}
              </p>
            )}
          </DialogHeader>
        </div>

        <div className="px-4 pb-3 space-y-2 overflow-y-auto flex-1">
          {/* Sales final warning */}
          <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 p-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-foreground/90 leading-snug">
              All ticket sales are final unless an event is cancelled without a rescheduling opportunity set out by the event organizer.
            </p>
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-center gap-3 py-2 border-b border-border">
            <span className="text-foreground font-semibold text-sm">
              Tickets <span className="text-muted-foreground text-xs font-normal ml-1">(${ticketPrice.toFixed(2)} CAD each)</span>
            </span>
            <div className="flex items-center gap-1.5">
              {validQuantities.length > 1 ? (
                <div className="inline-flex items-center border-2 border-primary/40 rounded-lg bg-primary/10">
                  <button onClick={() => handleQuantityChange(-1)} disabled={validQuantities.indexOf(quantity) <= 0} className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-lg font-display font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} disabled={validQuantities.indexOf(quantity) >= validQuantities.length - 1} className="px-2 py-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-lg font-display font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/30">×{quantity}{isThreePack ? " set" : ""}</span>
              )}
              <span className="text-muted-foreground text-xs">=</span>
              <span className="text-foreground font-bold text-base font-display">${subtotal.toFixed(2)} CAD</span>
            </div>
          </div>

          <div className="text-center space-y-0.5">
            <p className="text-[10px] text-primary font-medium italic">
              {quantityHint}
            </p>
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wide">Please Choose:</p>
          </div>

          <div className="space-y-1.5">
            {/* HST option */}
            <button
              onClick={() => setSelectedOption("hst")}
              className={`w-full text-left rounded-md border-2 p-2 transition-all ${
                selectedOption === "hst"
                  ? "border-destructive bg-destructive/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedOption === "hst" ? "border-destructive bg-destructive" : "border-muted-foreground/40"
                  }`}>
                    {selectedOption === "hst" && <Check className="h-2 w-2 text-destructive-foreground" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-xs">Non-Member Pricing</p>
                    <p className="text-[10px] text-muted-foreground">
                      {quantity}× ${ticketPrice.toFixed(2)} +{" "}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a href="/terms" target="_blank" className="text-destructive font-medium underline decoration-dotted cursor-help">LCC (13%) ${hstAmount.toFixed(2)}</a>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] text-center">
                          <p className="text-xs">Local Consumption Charge. <span className="underline">See Terms of Service</span></p>
                        </TooltipContent>
                      </Tooltip>
                    </p>
                  </div>
                </div>
                <span className="text-foreground font-bold text-sm whitespace-nowrap">${totalWithHST.toFixed(2)} CAD</span>
              </div>
            </button>

            {/* Membership option */}
            <button
              onClick={() => setSelectedOption("membership")}
              className={`w-full text-left rounded-md border-2 p-2 transition-all ${
                selectedOption === "membership"
                  ? "border-gold bg-gold/5"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedOption === "membership" ? "border-gold bg-gold" : "border-muted-foreground/40"
                }`}>
                  {selectedOption === "membership" && <Check className="h-2 w-2 text-gold-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="font-semibold text-foreground text-xs">Become a Member & Save</p>
                    <span className="text-[8px] font-bold bg-gold/20 text-gold px-1 py-0.5 rounded uppercase tracking-wide">Best Value</span>
                  </div>
                  {/* Receipt-style breakdown */}
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tickets ({quantity}× ${ticketPrice.toFixed(2)}, no fees, no LCC)</span>
                      <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">+ Annual membership <span className="text-[8px] font-bold bg-gold/20 text-gold px-1 py-0.5 rounded uppercase tracking-wide ml-0.5">{MEMBERSHIP_DISCOUNT_PCT}% OFF</span></span>
                      <span className="text-foreground font-medium">
                        <span className="line-through text-muted-foreground/60 text-[9px] mr-1">${MEMBERSHIP_PRICE_ORIGINAL.toFixed(2)}</span>
                        ${MEMBERSHIP_PRICE.toFixed(2)}/yr
                      </span>
                    </div>
                    <div className="border-t border-dashed border-muted-foreground/30 my-0.5" />
                    <div className="flex justify-between font-bold text-foreground text-xs">
                      <span>Total</span>
                      <span>${totalWithMembership.toFixed(2)} CAD</span>
                    </div>
                  </div>
                  {/* Savings callout */}
                  <p className="text-[11px] text-gold font-bold mt-1.5 bg-gold/10 rounded px-1.5 py-1">
                    💡 Save ${(totalWithHST - totalWithMembership).toFixed(2)} vs non-member + no fees on ALL purchases for 12 months
                  </p>
                </div>
              </div>
            </button>

            {selectedOption === "membership" && (
              <div className="text-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-[10px] text-primary hover:underline inline-flex items-center gap-1 cursor-pointer">
                      <Crown className="h-2.5 w-2.5" /> Why buy a membership?
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="center">
                    <div className="space-y-2">
                      <h4 className="font-display font-bold text-xs text-foreground flex items-center gap-1.5">
                        <Crown className="h-3.5 w-3.5 text-gold" /> Membership Benefits
                      </h4>
                      <ul className="space-y-1.5">
                        {MEMBERSHIP_BENEFITS.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                            <Check className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[9px] text-muted-foreground/70 pt-1 border-t border-border">
                        One payment of ${MEMBERSHIP_PRICE.toFixed(2)}/year (regular ${MEMBERSHIP_PRICE_ORIGINAL.toFixed(2)}). Pays for itself in 1–2 purchases.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Single combined checkbox */}
          <div className="flex items-start gap-2 rounded-md border-2 border-primary/30 bg-primary/5 p-2">
            <Checkbox id="confirm-all" checked={confirmed} onCheckedChange={(v) => setConfirmed(v === true)} className="mt-0.5" />
            <label htmlFor="confirm-all" className="text-[10px] text-muted-foreground leading-snug cursor-pointer">
              <ShieldCheck className="h-3 w-3 inline mr-0.5 text-primary" />
              I confirm the ticket details are correct and agree to the{" "}
              <a href="/terms-of-service" target="_blank" className="text-primary underline hover:text-primary/80">Terms of Service</a>,{" "}
              <a href="/terms-of-service#refunds" target="_blank" className="text-primary underline hover:text-primary/80">Refund Policy</a>, and{" "}
              <a href="/terms-of-service#ticket-delivery" target="_blank" className="text-primary underline hover:text-primary/80">Ticket Delivery Policy</a>.
            </label>
          </div>

          {/* Total + Pay */}
          <div className="border-t border-border pt-1.5 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-foreground font-bold text-sm">Total</span>
              <span className="text-foreground font-display font-bold text-lg">${currentTotal.toFixed(2)} CAD</span>
            </div>
            {faceValue && faceValue > 0 && (
              <p className="text-[9px] text-muted-foreground text-center">Original face value: ${faceValue.toFixed(2)} per ticket</p>
            )}
            <p className="text-[9px] text-muted-foreground text-center">
              By purchasing, you agree to contact Seats.ca support before initiating a payment dispute with your bank.
            </p>
            <p className="text-[10px] font-bold text-primary text-center">
              📬 If you don't see the confirmation email, please check your spam/junk folder.
            </p>
            <Button
              variant={selectedOption === "membership" ? "gold" : "hero"}
              className="w-full h-12 text-base"
              onClick={handleProceed}
              disabled={isLoading || !confirmed}
            >
              {selectedOption === "membership" ? (
                <>
                  <Zap className="h-4 w-4" />
                  {isLoading ? "Processing..." : `Get Membership & Pay $${currentTotal.toFixed(2)} CAD`}
                </>
              ) : (
                <>{isLoading ? "Processing..." : `Pay $${currentTotal.toFixed(2)} CAD`}</>
              )}
            </Button>
            {selectedOption === "hst" && (
              <p className="text-center text-[10px] text-muted-foreground">
                Includes ${hstAmount.toFixed(2)} CAD{" "}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="/terms" target="_blank" className="underline decoration-dotted cursor-help">LCC (13%)</a>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-center">
                    <p className="text-xs">Local Consumption Charge. <span className="underline">See Terms of Service</span></p>
                  </TooltipContent>
                </Tooltip>
                . <button onClick={() => setSelectedOption("membership")} className="text-gold hover:underline font-medium">Save with a membership →</button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeGateDialog;
