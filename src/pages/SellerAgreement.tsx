import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, ShieldCheck } from "lucide-react";
import { AGREEMENT_SECTIONS } from "@/data/sellerAgreementSections";
import SellerKeyTerms from "@/components/reseller/SellerKeyTerms";

const SellerAgreement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initials, setInitials] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [signature, setSignature] = useState("");

  const keyTermsComplete =
    initials.trim().length >= 2 &&
    sellerName.trim().length >= 2 &&
    signature.trim().length >= 2;

  const canSubmit = agreed && keyTermsComplete && !submitting && !!user;

  const handleAccept = async () => {
    if (!user || !canSubmit) return;
    setSubmitting(true);

    const now = new Date().toISOString();
    const { error } = await supabase
      .from("resellers")
      .update({
        agreement_accepted_at: now,
        acknowledgment_initials: initials.trim(),
        acknowledgment_name: sellerName.trim(),
        acknowledgment_signed_at: now,
      })
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

            {/* Key Terms Acknowledgment */}
            <SellerKeyTerms
              initials={initials}
              setInitials={setInitials}
              sellerName={sellerName}
              setSellerName={setSellerName}
              signature={signature}
              setSignature={setSignature}
            />

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
                disabled={!canSubmit}
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
