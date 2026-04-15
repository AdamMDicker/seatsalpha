import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Users, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Low listing fees",
    description: "Keep more of what you earn. Our seller fees are a fraction of what other platforms charge.",
  },
  {
    icon: Users,
    title: "Reach local fans",
    description: "Your tickets are shown to verified Canadian buyers who are ready to purchase.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & simple",
    description: "List in minutes, get paid via Stripe, and we handle the transfer verification.",
  },
];

const SellerSection = () => {
  return (
    <section id="seller" className="py-20 sm:py-32">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-16 items-center max-w-5xl mx-auto">
          {/* Left side */}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3 sm:mb-4">For sellers</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Got tickets?{" "}
              <span className="text-gradient">Sell them here.</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-md leading-relaxed mb-8">
              List your tickets on Canada's fastest-growing marketplace. Low fees, local buyers, and fast payouts.
            </p>
            <Link to="/reseller" className="w-full sm:w-auto inline-block">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-10 py-4 h-auto rounded-xl shadow-xl shadow-primary/20 min-h-[52px] font-semibold">
                Start Selling
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Right side — benefit cards */}
          <div className="space-y-4">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-6 sm:p-7 flex items-start gap-4 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerSection;
