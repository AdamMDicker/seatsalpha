import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const SolutionSection = () => {
  return (
    <section id="solution" className="py-32 bg-card/20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">The solution</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
            What you see is what you pay
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
            The listed price is the final price. No fees added at checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-xl mx-auto mb-16">
          {/* Competitor */}
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">Other platforms</p>
            <p className="font-display text-6xl font-bold text-destructive mb-4">$132</p>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>$100 ticket</p>
              <p>+ $19 service fee</p>
              <p>+ $13 HST</p>
            </div>
          </div>

          {/* Seats.ca */}
          <div className="rounded-2xl border-2 border-primary bg-card p-10 text-center relative">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-primary/25">
              Seats.ca
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">For members</p>
            <p className="font-display text-6xl font-bold text-foreground mb-4">$100</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {["No service fees", "HST included", "Final price"].map((text) => (
                <div key={text} className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/membership">
            <Button variant="hero" size="lg" className="text-base px-10 py-4 h-auto rounded-xl shadow-xl shadow-primary/20">
              See Membership Details
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
