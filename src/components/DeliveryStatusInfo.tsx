import { CheckCircle2, Clock, MailCheck, Inbox, AlertTriangle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export type TransferStatusRow = {
  status: string;
  uploaded_at: string | null;
  confirmed_at: string | null;
  forward_sent_at: string | null;
  created_at: string;
};

export type DeliveryStage = "awaiting_seller" | "in_review" | "delivered" | "delayed";

export function getDeliveryStage(
  orderStatus: string,
  transfers: TransferStatusRow[],
): { stage: DeliveryStage; eta: string; lastEvent: string | null } {
  if (orderStatus !== "completed") {
    return { stage: "awaiting_seller", eta: "Once payment clears", lastEvent: null };
  }

  if (transfers.length === 0) {
    return { stage: "awaiting_seller", eta: "Within a few hours", lastEvent: null };
  }

  // Delivered = all transfers have been forwarded to buyer (forward_sent_at set)
  const allForwarded = transfers.every((t) => !!t.forward_sent_at);
  if (allForwarded) {
    const last = transfers
      .map((t) => t.forward_sent_at)
      .filter(Boolean)
      .sort()
      .pop();
    return { stage: "delivered", eta: "Delivered", lastEvent: last || null };
  }

  // Confirmed but not yet forwarded = verified, relay pending
  const allConfirmed = transfers.every((t) => t.status === "confirmed" || !!t.confirmed_at);
  if (allConfirmed) {
    const last = transfers
      .map((t) => t.confirmed_at)
      .filter(Boolean)
      .sort()
      .pop();
    return { stage: "in_review", eta: "Tickets verified — delivering shortly", lastEvent: last || null };
  }

  const anyUploaded = transfers.some((t) => !!t.uploaded_at);
  if (anyUploaded) {
    const last = transfers
      .map((t) => t.uploaded_at)
      .filter(Boolean)
      .sort()
      .pop();
    return {
      stage: "in_review",
      eta: "Usually under 30 minutes",
      lastEvent: last || null,
    };
  }

  // Awaiting seller proof — check age
  const orderAgeMs = Math.min(
    ...transfers.map((t) => Date.now() - new Date(t.created_at).getTime()),
  );
  const HOURS_24 = 24 * 60 * 60 * 1000;
  if (orderAgeMs > HOURS_24) {
    return { stage: "delayed", eta: "Support has been notified", lastEvent: null };
  }
  return { stage: "awaiting_seller", eta: "Within a few hours, up to 24h", lastEvent: null };
}

interface Props {
  orderStatus: string;
  orderCreatedAt: string;
  transfers: TransferStatusRow[];
  compact?: boolean;
}

const DeliveryStatusInfo = ({ orderStatus, orderCreatedAt, transfers, compact }: Props) => {
  const { stage, eta, lastEvent } = getDeliveryStage(orderStatus, transfers);

  const config = {
    awaiting_seller: {
      label: "Preparing your tickets",
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      description:
        "Your seller is preparing the Ticketmaster transfer. You'll get an email from Ticketmaster with an Accept link the moment it's sent.",
    },
    in_review: {
      label: "Transfer in progress",
      icon: MailCheck,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      description:
        "The seller has initiated the transfer. We're verifying it and routing the Accept link to your inbox. Check Ticketmaster and your email.",
    },
    delivered: {
      label: "Tickets delivered",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      description:
        "Your tickets have been transferred and are ready in your Ticketmaster account. Bring your phone to the venue.",
    },
    delayed: {
      label: "Delivery delayed",
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      description:
        "This transfer is taking longer than expected. Our support team has been notified and is following up with the seller. Email support@seats.ca if you need an update.",
    },
  }[stage];

  const Icon = config.icon;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  }

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4 space-y-3`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${config.color}`}>{config.label}</p>
          <p className="text-xs text-foreground/80 mt-1 leading-relaxed">{config.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pl-8">
        <span>
          <span className="font-medium text-foreground/70">Estimated:</span> {eta}
        </span>
        {lastEvent && (
          <span>
            <span className="font-medium text-foreground/70">Last update:</span>{" "}
            {formatDistanceToNow(new Date(lastEvent), { addSuffix: true })}
          </span>
        )}
        <span>
          <span className="font-medium text-foreground/70">Ordered:</span>{" "}
          {format(new Date(orderCreatedAt), "MMM d, h:mm a")}
        </span>
      </div>

      {/* Two-track explainer */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground">Payment</p>
            <p className="text-[10px] text-muted-foreground">
              {orderStatus === "completed" ? "Charged successfully" : "Processing"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Inbox className={`h-3.5 w-3.5 shrink-0 ${stage === "delivered" ? "text-emerald-500" : "text-muted-foreground"}`} />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground">Ticket delivery</p>
            <p className="text-[10px] text-muted-foreground">
              {stage === "delivered" ? "Complete" : stage === "delayed" ? "Delayed" : "In progress"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStatusInfo;
