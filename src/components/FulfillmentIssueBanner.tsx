import { AlertTriangle, RefreshCw, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FulfillmentIssueBannerProps {
  /**
   * "pending"  → Order exists but not yet completed (webhook in flight or stalled).
   * "missing"  → Stripe redirected back but no order record was created within timeout.
   */
  variant: "pending" | "missing";
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

const FulfillmentIssueBanner = ({
  variant,
  onRetry,
  retrying = false,
  className = "",
}: FulfillmentIssueBannerProps) => {
  const isPending = variant === "pending";

  return (
    <div
      role="alert"
      className={`rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-5 sm:p-6 space-y-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
            {isPending
              ? "Your order is taking longer than expected"
              : "We couldn't confirm your order yet"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            {isPending
              ? "Your payment went through, but our system hasn't finished confirming your tickets. This usually clears up in a minute or two."
              : "Your payment may have completed, but we haven't received the confirmation. Don't worry — you have not been double-charged."}
          </p>
        </div>
      </div>

      <div className="bg-background/60 rounded-xl p-4 space-y-2 text-sm">
        <p className="font-semibold text-foreground">What to do next:</p>
        <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
          <li>Wait 1–2 minutes, then tap <strong className="text-foreground">Refresh</strong> below.</li>
          <li>Check your email (including spam) for a Stripe receipt.</li>
          <li>If still missing after 5 minutes, contact support — we'll resolve it manually.</li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={retrying}
            className="w-full sm:w-auto h-12 sm:h-11 gap-2 font-semibold"
            variant="default"
          >
            <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
            {retrying ? "Checking…" : "Refresh status"}
          </Button>
        )}
        <Link to="/contact" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full h-12 sm:h-11 gap-2 font-semibold">
            <MessageCircle className="h-4 w-4" />
            Contact support
          </Button>
        </Link>
        <a href="mailto:support@seats.ca" className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full h-12 sm:h-11 gap-2 font-semibold text-muted-foreground">
            <Mail className="h-4 w-4" />
            Email us
          </Button>
        </a>
      </div>

      <p className="text-xs text-muted-foreground border-t border-border/40 pt-3">
        Reference: keep this page open and include your Stripe receipt number when contacting support for fastest resolution.
      </p>
    </div>
  );
};

export default FulfillmentIssueBanner;
