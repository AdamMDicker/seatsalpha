import { ShieldCheck, BadgeDollarSign, RotateCcw } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Verified Authentic Tickets" },
  { icon: BadgeDollarSign, label: "No Hidden Fees" },
  { icon: RotateCcw, label: "Full Refund if Cancelled" },
];

const TrustBar = () => {
  return (
    <section className="border-y border-border bg-card/50">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 text-foreground/80">
              <item.icon className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
