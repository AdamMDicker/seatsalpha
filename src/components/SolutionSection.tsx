import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Lock, CreditCard, Headphones } from "lucide-react";

const guarantees = [
  { icon: Lock, label: "Secure checkout with Stripe" },
  { icon: CreditCard, label: "All major cards accepted" },
  { icon: Headphones, label: "Canadian support team" },
];

const SolutionSection = () => {
  return (
    <section id="solution" className="py-20 sm:py-32 bg-card/20">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3 sm:mb-4">The solution</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            What you see is what you pay
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Everyone sees transparent prices. Members get the best deal — no service fees and LCC included in every ticket.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10 max-w-xl mx-auto mb-8 sm:mb-10">
          {/* VS circle */}
          <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-sm items-center justify-center shadow-lg shadow-primary/30">
            VS
          </div>

          {/* Competitor */}
          <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 sm:mb-6">StubHub / Ticketmaster</p>
            <p className="font-display text-5xl sm:text-6xl font-bold text-destructive mb-3 sm:mb-4 line-through decoration-destructive/40">$132</p>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p>$100 ticket</p>
              <p className="text-destructive/70">+ $19 service fee</p>
              <p className="text-destructive/70">+ $13 LCC</p>
            </div>
          </div>

          {/* Seats.ca */}
          <div className="rounded-2xl border-2 border-primary bg-card p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-primary/25">
              Seats.ca Member
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 sm:mb-6">$49.95/yr membership</p>
            <p className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-3 sm:mb-4">$100</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              {["No service fees", "LCC included", "What you see = what you pay"].map((text) => (
                <div key={text} className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Non-member clarification */}
        <p className="text-center text-xs text-muted-foreground mb-10 sm:mb-12 max-w-md mx-auto">
          Not a member yet? You can still browse and buy — a small service fee & taxes applies at checkout. Membership removes it entirely.
        </p>

        {/* Trust guarantees */}
        <div className="flex flex-col gap-4 sm:flex-row items-center justify-center sm:gap-10 mb-10 sm:mb-12">
          {guarantees.map((g) => (
            <div key={g.label} className="flex items-center gap-2.5 text-foreground/50">
              <g.icon className="h-4 w-4 text-primary/70 shrink-0" />
              <span className="text-xs font-medium">{g.label}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/membership" className="block">
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-10 py-4 h-auto rounded-xl shadow-xl shadow-primary/20 min-h-[52px]">
              See Membership Details
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
