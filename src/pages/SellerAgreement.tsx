import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";

const AGREEMENT_SECTIONS = [
  {
    title: "1. Seller Responsibilities",
    content: `You are responsible for all tickets you list and sell on Seats.ca.\n\nYou represent and warrant that:\n• All tickets are valid, authentic, and transferable\n• You own or control the tickets at the time of listing\n• Listings are accurate and complete\n\nYou agree to fulfill all completed sales in a timely manner.\n\nIf an issue arises (e.g., invalid tickets, incorrect listing, failure to transfer), you are responsible for resolving it, including any reasonable costs incurred.`,
  },
  {
    title: "2. Customer Issue Resolution & Charges",
    content: `Seats.ca may take reasonable steps to resolve customer issues, including:\n• Providing replacement tickets\n• Issuing refunds where appropriate\n\nIf costs are incurred due to a seller-related issue, Seats.ca may recover those costs from you, including:\n• Replacement ticket costs\n• Refunds\n• Reasonable administrative fees\n\nImportant safeguards:\n• Seats.ca will provide an itemized summary of charges upon request\n• Charges will be commercially reasonable and directly related to the issue\n• Where feasible, you will be notified before charges are applied`,
  },
  {
    title: "3. Fees & Account Requirements",
    content: `• Annual Membership Fee: $100 (non-refundable)\n• Weekly Card Validation Fee: $0.50\n\nYou must maintain a valid payment method on file.\n\nIf payments fail, Seats.ca may:\n• Pause listings\n• Suspend selling privileges\n• Apply a reasonable reactivation fee`,
  },
  {
    title: "4. Seller Payouts",
    content: `Payments are issued approximately 2 weeks after the event, consisting of:\n• 1 week buyer protection window\n• 1 week processing period\n\nPayouts may be delayed if:\n• There is an active dispute\n• A customer complaint is under review\n\nSeats.ca may temporarily withhold payouts while acting reasonably and in good faith to resolve issues.\n\nAny amounts owed may be offset against payouts.`,
  },
  {
    title: "5. Financial Responsibility",
    content: `You are responsible for:\n• Chargebacks\n• Payment disputes\n• Reversals related to your sales\n\nSeats.ca may recover these amounts from:\n• Your payouts\n• Your payment method on file\n\nYou remain responsible for outstanding balances even if your account is suspended.`,
  },
  {
    title: "6. Taxes & Legal Compliance",
    content: `You are responsible for:\n• All applicable taxes\n• Compliance with ticket resale laws in your jurisdiction\n\nSeats.ca is responsible only for taxes related to its own service fees.`,
  },
  {
    title: "7. Verification & Documentation",
    content: `Seats.ca may request:\n• Proof of ticket ownership\n• Identity or business verification\n\nFailure to comply may result in:\n• Listing removal\n• Account suspension\n• Delayed payouts`,
  },
  {
    title: "8. Listing Accuracy",
    content: `You must ensure all listings are accurate, including:\n• Event details\n• Seat location\n• Ticket type\n\nYou must disclose the original face value where required.\n\nMisleading listings may result in:\n• Penalties\n• Charges\n• Suspension`,
  },
  {
    title: "9. Inventory Control",
    content: `• You must own or control tickets at the time of listing\n• Speculative selling is not permitted\n\nIf tickets are listed elsewhere, you must remove them immediately upon sale.`,
  },
  {
    title: "10. Ticket Transfer Requirements",
    content: `Tickets must be transferred:\n• No later than 48 hours before the event\n\nFailure to meet this requirement may result in:\n• Replacement costs\n• Penalties\n• Account restrictions`,
  },
  {
    title: "11. Transfer Process",
    content: `Tickets must be transferred using approved methods.\n\nSeats.ca may use intermediary systems to facilitate delivery.\n\nBuyer contact details will not be shared.`,
  },
  {
    title: "12. Event Changes",
    content: `Event cancellations or changes are handled according to:\n• The original ticket issuer's policies\n\nSellers must cooperate with any required resolutions.`,
  },
  {
    title: "13. Restricted Tickets",
    content: `You are responsible for ensuring tickets are transferable.\n\nListings for restricted tickets may result in liability if issues occur.`,
  },
  {
    title: "14. Platform Integrity",
    content: `Seats.ca may:\n• Remove or pause listings\n• Adjust listings where required for legal compliance\n\nThese actions will be taken reasonably to maintain marketplace integrity.`,
  },
  {
    title: "15. Service Availability",
    content: `Seats.ca provides the platform on an "as available" basis and does not guarantee uninterrupted service.`,
  },
  {
    title: "16. Communication",
    content: `You must respond to inquiries:\n• Within 48 hours (standard)\n• Within 2 hours for last-minute sales`,
  },
  {
    title: "17. Fraud & Security",
    content: `Seats.ca may monitor activity for fraud or suspicious behavior.\n\nAccounts may be suspended during investigations.`,
  },
  {
    title: "18. Circumvention",
    content: `You may not bypass the platform to transact directly with buyers introduced through Seats.ca.`,
  },
  {
    title: "19. Independent Contractor",
    content: `You are an independent seller, not an employee or agent of Seats.ca.`,
  },
  {
    title: "20. No Guarantee of Sales",
    content: `Seats.ca does not guarantee:\n• Sales volume\n• Pricing outcomes`,
  },
  {
    title: "21. Indemnification",
    content: `You agree to indemnify Seats.ca against claims arising from your listings or sales.`,
  },
  {
    title: "22. Dispute Resolution",
    content: `Seats.ca will work in good faith to resolve disputes.\n\nUnresolved disputes may be submitted to binding arbitration in Ontario, Canada, in accordance with applicable arbitration rules.`,
  },
  {
    title: "23. Limitation of Liability",
    content: `To the extent permitted by law:\n• Seats.ca is not liable for indirect or consequential damages\n• Total liability is limited to fees paid by the Seller in the past 12 months`,
  },
  {
    title: "24. Force Majeure",
    content: `Seats.ca is not liable for delays or failures caused by events beyond its control.`,
  },
  {
    title: "25. Data & Privacy",
    content: `Seats.ca may retain data for compliance and operational purposes, in accordance with its Privacy Policy.`,
  },
  {
    title: "26. Modifications",
    content: `Seats.ca may update this Agreement with notice.\n\nContinued use constitutes acceptance.`,
  },
  {
    title: "27. Acceptance",
    content: `By checking the box below and clicking "I Agree", you acknowledge that you have read, understood, and agree to be bound by the terms of this Seller Agreement.`,
  },
];

const SellerAgreement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!user || !agreed) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("resellers")
      .update({ agreement_accepted_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("status", "live");

    if (error) {
      toast({ title: "Error", description: "Could not save agreement. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Agreement accepted!", description: "You can now start listing tickets on Seats.ca." });
      navigate("/reseller");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-12">
          <div className="container mx-auto px-4 text-center">
            <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Seats.ca <span className="text-gradient">Seller Agreement</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Please read the following agreement carefully. You must accept these terms before you can list tickets.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <div className="glass rounded-xl p-6 md:p-10 space-y-8">
            <p className="text-sm text-muted-foreground">
              This Seller Agreement ("Agreement") is entered into between Seats.ca ("Seats.ca", "we", "us") and the individual or entity registering as a seller ("Seller", "you"). By listing tickets on Seats.ca, you agree to the following terms:
            </p>

            {AGREEMENT_SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="font-display font-semibold text-foreground mb-2 text-base">
                  {section.title}
                </h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}

            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="agree" className="text-sm text-foreground cursor-pointer leading-snug">
                  I have read, understood, and agree to be bound by the terms of this Seller Agreement.
                </label>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                disabled={!agreed || submitting || !user}
                onClick={handleAccept}
              >
                {submitting ? "Submitting..." : "I Agree — Start Selling"}
              </Button>

              {!user && (
                <p className="text-xs text-muted-foreground text-center">
                  You must be <a href="/auth" className="underline hover:text-primary">signed in</a> to accept this agreement.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellerAgreement;
