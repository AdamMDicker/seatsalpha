import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

const KEY_TERMS = [
  "You are fully responsible for all tickets you list and sell, including fulfillment, accuracy, and any buyer issues.",
  "You authorize Seats.ca to charge your credit card for any costs related to your sales, including refunds, replacement tickets, service fees, dispute-related charges, and chargebacks, with supporting evidence provided.",
  "You understand that payouts occur approximately two (2) weeks after the event and may be withheld or offset for disputes, complaints, or amounts owed.",
  "You agree to meet ticket transfer requirements, including the 48-hour advance transfer rule and expedited timelines for last-minute sales.",
  "You confirm that you own or control all tickets listed and will not engage in speculative selling.",
  "You agree that all listings (including face value and pricing) must be accurate and compliant with applicable laws.",
  "You accept full responsibility for all taxes and compliance with ticket resale laws in all applicable jurisdictions.",
  "You agree that event changes will follow the original ticket issuer's policies and that you remain responsible for your tickets.",
  "You agree to indemnify and hold Seats.ca harmless from any claims or legal actions arising from your ticket sales.",
  "You acknowledge that Seats.ca has final decision-making authority on disputes and that disputes will be resolved via mediation and/or binding arbitration.",
  "You understand that Seats.ca may remove, pause, or adjust your listings at any time.",
  "You agree to maintain a valid credit card on file at all times and understand that failure to do so may result in account suspension.",
];

interface SellerKeyTermsProps {
  initials: string;
  setInitials: (v: string) => void;
  sellerName: string;
  setSellerName: (v: string) => void;
  signature: string;
  setSignature: (v: string) => void;
}

const SellerKeyTerms = ({
  initials,
  setInitials,
  sellerName,
  setSellerName,
  signature,
  setSignature,
}: SellerKeyTermsProps) => {
  const today = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="border-2 border-primary/30 rounded-xl p-6 md:p-8 space-y-6 bg-primary/5">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
        <h2 className="font-display text-lg font-bold text-foreground">
          Seats.ca Seller Agreement – Key Terms Acknowledgment
        </h2>
      </div>

      <p className="text-sm font-medium text-foreground">
        IMPORTANT: By initialing below, you acknowledge that you have read, understood, and agree to the key terms of the Seats.ca Seller Agreement, including but not limited to the following:
      </p>

      <ol className="list-decimal list-outside pl-5 space-y-3">
        {KEY_TERMS.map((term, i) => (
          <li key={i} className="text-sm text-muted-foreground leading-relaxed">
            {term}
          </li>
        ))}
      </ol>

      <div className="border-t border-border pt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="ack-initials">
            Seller Initials <span className="text-destructive">*</span>
          </label>
          <Input
            id="ack-initials"
            placeholder="e.g. JS"
            maxLength={4}
            value={initials}
            onChange={(e) => setInitials(e.target.value.toUpperCase())}
            className="max-w-[120px] uppercase tracking-widest font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="ack-name">
            Seller Name / Business Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="ack-name"
            placeholder="Full name or business name"
            maxLength={100}
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="ack-signature">
            Signature <span className="text-destructive">*</span>
          </label>
          <Input
            id="ack-signature"
            placeholder="Type your full name as signature"
            maxLength={100}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="italic"
            style={{ fontFamily: "'Georgia', 'Times New Roman', cursive" }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Date</label>
          <Input value={today} readOnly className="bg-muted cursor-default" />
        </div>
      </div>
    </div>
  );
};

export default SellerKeyTerms;
