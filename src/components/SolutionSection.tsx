import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const SolutionSection = () => {
  return (
    <section id="solution" className="py-28 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">The solution</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-5">
            Seats.ca: what you see is what you pay
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            We built a ticket marketplace where the listed price is the final price. No fees, no surprises.
          </p>
        </div>

        {/* Fee comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-14">
          {/* Competitor */}
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-4">Other platforms</p>
            <p className="font-display text-5xl font-bold text-destructive mb-2">$132</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>$100 ticket price</p>
              <p>+ $19 service fee</p>
              <p>+ $13 HST</p>
            </div>
          </div>

          {/* Seats.ca */}
          <div className="rounded-2xl border-2 border-primary bg-card p-8 text-center relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full">
              Seats.ca Members
            </span>
            <p className="text-sm font-medium text-muted-foreground mb-4">On Seats.ca</p>
            <p className="font-display text-5xl font-bold text-foreground mb-2">$100</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span>No service fees</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span>HST included</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span>Price = final price</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-5">Members save an average of <strong className="text-foreground">$30+ per ticket</strong>.</p>
          <Link to="/membership">
            <Button variant="hero" size="lg">See Membership Details</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
