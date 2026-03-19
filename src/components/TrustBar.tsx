import { ShieldCheck, BadgeDollarSign, RotateCcw } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Verified Authentic" },
  { icon: BadgeDollarSign, label: "No Hidden Fees" },
  { icon: RotateCcw, label: "Full Refund if Cancelled" },
];

const TrustBar = () => {
  return (
    <section className="border-y border-border/50 bg-card/40">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-foreground/60">
              <item.icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
