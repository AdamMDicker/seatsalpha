import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">The problem</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            You're overpaying for tickets
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Other platforms add service fees, processing fees, and taxes at checkout. We don't.
          </p>
        </div>

        {/* Fee comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
          {/* Competitor */}
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">On other platforms</p>
            <p className="font-display text-4xl font-bold text-destructive mb-1">$132</p>
            <p className="text-xs text-muted-foreground">$100 ticket + $19 service fee + $13 HST</p>
          </div>

          {/* Seats.ca */}
          <div className="rounded-xl border-2 border-primary bg-card p-6 text-center relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
              Seats.ca
            </span>
            <p className="text-sm text-muted-foreground mb-2">For members</p>
            <p className="font-display text-4xl font-bold text-foreground mb-1">$100</p>
            <p className="text-xs text-muted-foreground">No service fees · HST included</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/membership"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors"
          >
            See how membership works
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
