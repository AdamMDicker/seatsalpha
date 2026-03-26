import { ShieldCheck, BadgeDollarSign, RotateCcw, Users, TrendingUp } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Verified Authentic" },
  { icon: BadgeDollarSign, label: "No Hidden Fees" },
  { icon: RotateCcw, label: "Full Refund if Event Cancelled" },
];

const TrustBar = () => {
  return (
    <section className="border-y border-border/50 bg-card/40">
      <div className="container mx-auto px-5 sm:px-6 py-5 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row items-center justify-center sm:gap-12 md:gap-16">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-foreground/60 w-[260px] sm:w-auto">
              <item.icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats banner */}
      <div className="border-t border-border/30">
        <div className="container mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col gap-6 sm:flex-row items-center justify-center sm:gap-16 md:gap-24">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-foreground">2,400+</p>
                <p className="text-xs text-muted-foreground">Tickets sold to Canadian fans</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-foreground">$32</p>
                <p className="text-xs text-muted-foreground">Avg. saved per ticket vs StubHub</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground">Verified ticket guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
