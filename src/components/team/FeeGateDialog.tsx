import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap, ArrowRight, Check, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeeGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketPrice: number;
  section: string;
  rowName?: string | null;
  onProceedWithFees: () => void;
  loading: boolean;
}

const FeeGateDialog = ({
  open,
  onOpenChange,
  ticketPrice,
  section,
  rowName,
  onProceedWithFees,
  loading,
}: FeeGateDialogProps) => {
  const [membershipLoading, setMembershipLoading] = useState(false);
  const { toast } = useToast();
  const feeAmount = Math.round(ticketPrice * 0.13 * 100) / 100;
  const totalWithFees = Math.round((ticketPrice + feeAmount) * 100) / 100;

  const handleBuyMembership = async () => {
    setMembershipLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not start membership checkout", variant: "destructive" });
    } finally {
      setMembershipLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold/10 to-gold/5 border-b border-gold/20 px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Your Ticket Summary</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review your order before proceeding to checkout.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Ticket breakdown */}
          <div className="glass rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-medium">
                Section {section}{rowName ? ` · Row ${rowName}` : ""}
              </span>
              <span className="text-foreground font-medium">${ticketPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
               <span className="text-destructive flex items-center gap-1.5">
                 <X className="h-3.5 w-3.5" /> GST (13%)
              </span>
              <span className="text-destructive font-medium">+${feeAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2.5 flex justify-between font-bold text-base">
              <span>Total without membership</span>
              <span>${totalWithFees.toFixed(2)}</span>
            </div>
          </div>

          {/* Option 1: Buy membership */}
          <div className="glass rounded-xl border-gold/30 bg-gold/5 overflow-hidden">
            <div className="bg-gold/10 px-4 py-2 border-b border-gold/20">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-gold" />
                <span className="text-sm font-bold text-gold">OPTION 1 — RECOMMENDED</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-display font-bold text-lg">Buy a Membership & Save the GST</h3>
              <p className="text-sm text-muted-foreground">
                For <strong className="text-foreground">$49.95/year</strong>, save the{" "}
                <strong className="text-destructive">${feeAmount.toFixed(2)} GST</strong> on this ticket
                and <strong className="text-foreground">every future ticket</strong> you buy.
              </p>

              <div className="glass rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ticket</span>
                  <span>${ticketPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-primary flex items-center gap-1">
                     <Check className="h-3.5 w-3.5" /> GST
                  </span>
                  <span className="text-primary font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gold flex items-center gap-1">
                    <Crown className="h-3.5 w-3.5" /> Annual Membership
                  </span>
                  <span className="text-gold font-medium">$49.95</span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between font-bold">
                  <span>Today's Total</span>
                  <span>${(ticketPrice + 49.95).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Save the GST on every ticket for 12 months. Cancel anytime.</span>
              </div>

              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={handleBuyMembership}
                disabled={membershipLoading}
              >
                <Zap className="h-4 w-4" />
                {membershipLoading ? "Loading..." : `Get Membership — Save $${feeAmount.toFixed(2)} Now`}
              </Button>
            </div>
          </div>

          {/* Option 2: Pay with fees */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="bg-muted/30 px-4 py-2 border-b border-border">
              <span className="text-sm font-bold text-muted-foreground">OPTION 2</span>
            </div>
            <div className="p-4 space-y-3">
              <h3 className="font-display font-semibold">Continue Without Membership</h3>
              <p className="text-sm text-muted-foreground">
                Pay the 10% service fee (<strong className="text-destructive">${feeAmount.toFixed(2)}</strong>) on this purchase.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={onProceedWithFees}
                disabled={loading}
              >
                {loading ? "Processing..." : `Pay $${totalWithFees.toFixed(2)} with fees`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeGateDialog;
