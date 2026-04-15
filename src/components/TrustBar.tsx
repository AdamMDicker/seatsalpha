import { ShieldCheck, BadgeDollarSign, RotateCcw, Users, TrendingUp } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Verified Authentic" },
  { icon: BadgeDollarSign, label: "No Hidden Fees" },
  { icon: RotateCcw, label: "Full Refund if Event Cancelled" },
];

const TrustBar = () => {
  return (
    <section className="border-y border-white/5 bg-card/40">
      <div className="container mx-auto px-5 sm:px-6 py-5 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row items-center justify-center sm:gap-12 md:gap-16">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-foreground/60 w-[260px] sm:w-auto">
              <item.icon className="h-4 w-4 text-green-400 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats banner */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-5 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto">
            {[
              { value: "2,400+", label: "Tickets sold to Canadian fans" },
              { value: "$32", label: "Avg. saved per ticket vs StubHub" },
              { value: "100%", label: "Verified ticket guarantee" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-card p-8 text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">{stat.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
