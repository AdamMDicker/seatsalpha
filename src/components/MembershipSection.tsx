import { Button } from "@/components/ui/button";
import { Crown, Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  "HST inclusive ticket pricing for 12 months",
  "Save hundreds compared to StubHub & Ticketmaster",
  "Bundle savings on travel and ride packages",
];

const MembershipSection = () => {
  return (
    <section className="py-20 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-7 sm:p-8 md:p-12 shadow-lg glow-gold relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

            <div className="flex flex-col md:flex-row gap-8 sm:gap-10 items-center">
              <div className="flex-1 space-y-5 sm:space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30">
                  <Crown className="h-4 w-4 text-gold" />
                  <span className="text-sm font-semibold text-gold">seats.ca Membership</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
                  Save More with
                  <br />
                  <span className="text-gold">Annual Membership</span>
                </h2>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Join for just $49.95/year and never pay HST on tickets again. Most members save over $200 in their first year.
                </p>

                <ul className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground/80">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/membership" className="block">
                  <Button variant="gold" size="lg" className="w-full sm:w-auto min-h-[52px]">
                    <Zap className="h-4 w-4" />
                    Learn More — $49.95/year
                  </Button>
                </Link>
              </div>

              <div className="flex-shrink-0 text-center hidden sm:block">
                <div className="w-44 h-44 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex flex-col items-center justify-center glow-gold">
                  <span className="font-display text-3xl md:text-4xl font-bold text-gold">$49.95 CAD</span>
                  <span className="text-sm text-muted-foreground mt-1">per year</span>
                  <span className="text-xs text-gold/70 mt-0.5">Save $200+ avg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;
