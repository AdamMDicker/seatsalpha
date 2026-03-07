import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap, ArrowRight, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const feeAmount = Math.round(ticketPrice * 0.1 * 100) / 100;
  const totalWithFees = Math.round((ticketPrice + feeAmount) * 100) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Before You Checkout</DialogTitle>
          <DialogDescription>
            Non-members pay a 10% service fee on all ticket purchases.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Ticket summary */}
          <div className="glass rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Section {section}{rowName ? ` · Row ${rowName}` : ""}
              </span>
              <span className="text-foreground font-medium">${ticketPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-destructive flex items-center gap-1">
                <X className="h-3 w-3" /> Service Fee (10%)
              </span>
              <span className="text-destructive font-medium">+${feeAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>${totalWithFees.toFixed(2)}</span>
            </div>
          </div>

          {/* Membership upsell */}
          <div className="glass rounded-xl p-4 border-gold/30 bg-gold/5 space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-gold" />
              <span className="font-semibold text-gold">Save with Membership</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Join for <strong className="text-foreground">$49.95/year</strong> and pay{" "}
              <strong className="text-primary">$0 fees</strong> on every ticket — starting today.
            </p>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-destructive">
                <span className="line-through">${totalWithFees.toFixed(2)}</span>
              </div>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <div className="flex items-center gap-1 text-primary font-bold">
                <Check className="h-4 w-4" />
                ${ticketPrice.toFixed(2)}
              </div>
            </div>
            <Button
              variant="gold"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                navigate("/membership");
              }}
            >
              <Zap className="h-4 w-4" />
              Join & Save ${feeAmount.toFixed(2)} Now
            </Button>
          </div>

          {/* Proceed with fees */}
          <Button
            variant="outline"
            className="w-full"
            onClick={onProceedWithFees}
            disabled={loading}
          >
            {loading ? "Processing..." : `Continue with $${feeAmount.toFixed(2)} fee`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeeGateDialog;
